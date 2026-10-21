-- ============================================================================
-- MIGRATION: 01_auth_and_rls.sql
-- DESKRIPSI: Skrip lengkap untuk Row Level Security (RLS) pada tabel `todos`
--            dan storage bucket `project-crud`.
-- ============================================================================

-- 1. Tambah kolom user_id ke tabel todos (jika belum ada)
ALTER TABLE public.todos 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

-- 2. Index user_id untuk performa query cepat
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos (user_id);

-- 3. Trigger otomatis: Jika user_id tidak dikirim dari frontend, isi dengan auth.uid()
CREATE OR REPLACE FUNCTION public.handle_todos_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_todos_user_id ON public.todos;
CREATE TRIGGER tr_todos_user_id
BEFORE INSERT ON public.todos
FOR EACH ROW
EXECUTE FUNCTION public.handle_todos_user_id();

-- 4. Aktifkan Row Level Security (RLS) pada tabel todos
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- 5. Bersihkan policy lama jika ada untuk mencegah konflik
DROP POLICY IF EXISTS "Users can view their own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can insert their own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can update their own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can delete their own todos" ON public.todos;

-- 6. Buat 4 Policy RLS baru:
--
-- `user_id` selalu diisi trigger BEFORE INSERT dengan `auth.uid()`, sehingga
-- cabang `OR user_id IS NULL` di bawah tidak pernah dapat dieksploitasi.

-- [SELECT] Pengguna hanya dapat membaca tugas miliknya sendiri
CREATE POLICY "Users can view their own todos" 
ON public.todos 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- [INSERT] Pengguna hanya dapat menambah tugas untuk dirinya sendiri
CREATE POLICY "Users can insert their own todos" 
ON public.todos 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- [UPDATE] Pengguna hanya dapat memperbarui tugas miliknya sendiri.
-- Policy ini diperketat lagi di 10_rls_parent_ownership.sql untuk memverifikasi
-- `project_id` benar-benar milik pengguna tersebut.
CREATE POLICY "Users can update their own todos" 
ON public.todos 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- [DELETE] Pengguna hanya dapat menghapus tugas miliknya sendiri
CREATE POLICY "Users can delete their own todos" 
ON public.todos 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 7. Policy untuk Storage Bucket 'project-crud' (untuk lampiran gambar)
--
-- CATATAN KEAMANAN: policy di blok ini hanya versi awal. Konvensi path storage
-- yang final (dengan userId di segmen ke-2) beserta policy owner-scoped-nya
-- didefinisikan di 09_storage_rls_hardening.sql. Policy di bawah tetap ditulis
-- ketat agar instalasi baru tidak pernah berada dalam keadaan terbuka.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'project-crud') THEN
    -- Izinkan user yang login untuk mengunggah gambar ke folder miliknya sendiri
    DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
    CREATE POLICY "Authenticated users can upload images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'project-crud'
      AND (storage.foldername(name))[2] = auth.uid()::text
    );

    -- HAPUS policy lama "Public can view images". Policy tersebut tidak
    -- membatasi role maupun folder, sehingga role `anon` bisa membaca
    -- file `private/` milik user lain. Hanya folder `public/` yang boleh
    -- terbuka (lihat 09).
    DROP POLICY IF EXISTS "Public can view images" ON storage.objects;

    -- Izinkan user login menghapus file miliknya sendiri
    DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
    CREATE POLICY "Authenticated users can delete images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'project-crud'
      AND (storage.foldername(name))[2] = auth.uid()::text
    );
  END IF;
END $$;

-- 8. Aktifkan Broadcast Realtime untuk tabel 'todos'
-- Memastikan perubahan database (INSERT, UPDATE, DELETE) dikirim secara realtime ke client
DO $$
BEGIN
  -- Tambahkan tabel todos ke publikasi supabase_realtime jika belum ada
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'todos'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.todos;
  END IF;
END $$;

-- Set replica identity ke FULL agar Realtime payload memuat seluruh kolom (termasuk saat DELETE/UPDATE)
ALTER TABLE public.todos REPLICA IDENTITY FULL;

