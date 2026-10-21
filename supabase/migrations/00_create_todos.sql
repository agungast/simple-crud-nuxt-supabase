-- ==============================================================================
-- MIGRATION: 00_create_todos.sql
-- DESKRIPSI: Skema dasar tabel `public.todos`.
--
-- Files migration 01–07 di repo ini BERASUMSI tabel ini sudah ada: 01 langsung
-- melakukan `ALTER TABLE public.todos ADD COLUMN user_id`, bukan `CREATE TABLE`.
-- Akibatnya `supabase db push` pada project baru GAGAL di migration pertama,
-- karena tabelnya belum pernah dibuat. File ini menutup celah tersebut.
--
-- Kolom di sini adalah kolom "warisan" yang dipakai store sebagai fallback saat
-- insert/updatenya gagal. Kolom SoloFlow (priority, status, due_date, tags,
-- cover_image_url, dll.) ditambahkan oleh migration 05 dan 07.
--
-- Idempotent — aman dijalankan berulang kali.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.todos (
  -- UUID agar konsisten dengan projects.id (UUID) dan seluruh tabel lain.
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Nama tugas. Store selalu mengirim `task` dan `title`; trigger di 05/
  -- 08 menyinkronkan keduanya.
  task TEXT NOT NULL,

  -- Status selesai. Dipakai sebagai sumber kebenaran bersama `status`.
  is_completed BOOLEAN NOT NULL DEFAULT false,

  -- URL cover gambar BERSAMAAN (dipakai store sebagai fallback). Nilai yang
  -- disimpan adalah URL absolut bucket publik.
  image_url TEXT DEFAULT NULL,

  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------ index --
-- Di-index untuk query "tugas terbaru" dan sekaligus dipakai pada
-- `ORDER BY created_at` di setiap page load.
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON public.todos (created_at DESC);

-- ------------------------------------------------------------------ RLS ----
-- RLS diaktifkan di migration 01; baris ini hanya penjaga agar tabel tidak
-- pernah terbuka bila ada yang menjalankan file ini sendirian.
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;