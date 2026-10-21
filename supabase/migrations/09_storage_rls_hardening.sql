-- ==============================================================================
-- MIGRATION: 09_storage_rls_hardening.sql
-- DESKRIPSI: Menutup celah kebocoran lampiran privat, dan memisahkan bucket
--            publik dari bucket privat.
--
-- ---------------------------------------------------------------------------
-- AKAR MASALAHNYA (bukan sekadar policy yang longgar)
-- ---------------------------------------------------------------------------
-- 01_auth_and_rls.sql:87  "Public can view images"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'project-crud')
--
-- Policy tanpa klausa `TO` berlaku untuk SEMUA role termasuk `anon`. Policy itu
-- membuat SELURUH isi bucket terbaca anonim — termasuk folder `private/`.
-- Policy "Allow owner read for private folder" di 02 juga menipu: namanya
-- menyebut "owner", isinya hanya memeriksa folder pertama, tanpa ada
-- perbandingan ke `auth.uid()`.
--
-- Namun policy yang diperketat TIDAK cukup untuk menutup ini. Bucket yang
-- ditandai `public = true` di Supabase dilayani lewat endpoint
-- `/object/public/` TANPA melewati RLS sama sekali. Selama folder `public/`
-- dan `private/` berada di bucket yang sama, tidak ada policy yang bisa
-- menyembunyikan file privat selama bucket itu publik.
--
-- Karena itu bucket dipecah:
--
--   project-crud            public = true    cover tugas & avatar
--   project-crud-private    public = false   lampiran privat (Signed URL)
--
-- Bucket publik tetap `public = true` karena `cover_image_url` dan `avatar_url`
-- disimpan sebagai URL absolut permanen di database — keduanya harus tetap bisa
-- dibuka tanpa token.
--
-- ---------------------------------------------------------------------------
-- KONVENSI PATH
-- ---------------------------------------------------------------------------
--   project-crud           public/{userId}/{fileName}
--   project-crud-private   private/{userId}/{fileName}
--
-- `storage.objects` tidak punya kolom `user_id`, jadi kepemilikan hanya bisa
-- diverifikasi lewat segmen path ke-2.
--
-- ---------------------------------------------------------------------------
-- CATATAN MIGRASI DATA
-- ---------------------------------------------------------------------------
-- Object LAMA di `project-crud/private/...` TIDAK ikut berpindah secara
-- otomatis (butuh service-role). Selama masih berada di bucket publik, file
-- tersebut tetap bisa dibaca anonim. Lihat bagian "Pemuatan ulang file privat
-- legacy" di README.md.
--
-- Idempotent — aman dijalankan berulang kali.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Bucket publik: HARUS tetap `public = true`.
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('project-crud', 'project-crud', true, 26214400, NULL)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ------------------------------------------------------------------------------
-- 2. Bucket privat: tidak publik, RLS owner-scoped.
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('project-crud-private', 'project-crud-private', false, 26214400, NULL)
ON CONFLICT (id) DO UPDATE SET public = false;

-- ------------------------------------------------------------------------------
-- 3. Buang seluruh policy storage lama milik TaktVibe.
--    Policy di storage.objects bersifat global per tabel (bukan per bucket),
--    jadi satu policy yang longgar di bucket mana pun jeopardikan semuanya.
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  stale_policy RECORD;
BEGIN
  FOR stale_policy IN
    SELECT policyname FROM pg_policies
     WHERE schemaname = 'storage'
       AND tablename  = 'objects'
       AND policyname IN (
         'Public can view images',
         'Authenticated users can upload images',
         'Authenticated users can delete images',
         'Allow public read for public folder',
         'Allow owner read for private folder',
         'Authenticated users can upload objects',
         'Authenticated users can delete objects'
       )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', stale_policy.policyname);
  END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- 4. Policy final. Prefix "takt_" dipakai agar jelas dimiliki aplikasi ini.
-- ------------------------------------------------------------------------------

-- 4a. Bucket publik — SELECT untuk anon & authenticated.
--     Folder `public/` memang konten yang dibagikan, jadi ini disengaja.
--     Object di luar folder `public/` (mis. file privat legacy) TIDAK lagi
--     tercakup policy ini.
DROP POLICY IF EXISTS "takt_public_bucket_read_public_folder" ON storage.objects;
CREATE POLICY "takt_public_bucket_read_public_folder"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-crud'
  AND (storage.foldername(name))[1] = 'public'
);

-- 4b. Bucket publik — hanya menulis ke folder milik sendiri.
DROP POLICY IF EXISTS "takt_public_bucket_insert_own_folder" ON storage.objects;
CREATE POLICY "takt_public_bucket_insert_own_folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-crud'
  AND (storage.foldername(name))[1] = 'public'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- 4c. Bucket publik — hanya menghapus file milik sendiri.
DROP POLICY IF EXISTS "takt_public_bucket_delete_own_objects" ON storage.objects;
CREATE POLICY "takt_public_bucket_delete_own_objects"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-crud'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- 4d. Bucket privat — SELECT hanya pemilik. Inilah policy yang mengizinkan
--     pembuatan Signed URL.
DROP POLICY IF EXISTS "takt_private_bucket_owner_read" ON storage.objects;
CREATE POLICY "takt_private_bucket_owner_read"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-crud-private'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- 4e. Bucket privat — INSERT hanya ke folder milik sendiri.
DROP POLICY IF EXISTS "takt_private_bucket_insert_own_folder" ON storage.objects;
CREATE POLICY "takt_private_bucket_insert_own_folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-crud-private'
  AND (storage.foldername(name))[1] = 'private'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- 4f. Bucket privat — UPDATE hanya milik sendiri (cadangan untuk `upsert`).
DROP POLICY IF EXISTS "takt_private_bucket_update_own_objects" ON storage.objects;
CREATE POLICY "takt_private_bucket_update_own_objects"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-crud-private'
  AND (storage.foldername(name))[2] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'project-crud-private'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- 4g. Bucket privat — DELETE hanya milik sendiri.
DROP POLICY IF EXISTS "takt_private_bucket_delete_own_objects" ON storage.objects;
CREATE POLICY "takt_private_bucket_delete_own_objects"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-crud-private'
  AND (storage.foldername(name))[2] = auth.uid()::text
);