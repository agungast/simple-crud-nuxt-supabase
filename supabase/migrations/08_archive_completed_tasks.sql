-- ==============================================================================
-- MIGRATION: 08_archive_completed_tasks.sql
-- DESKRIPSI: Mengganti hard DELETE cron lama dengan arsip (soft-delete) yang
--            benar-benar aman, ditambah kolom `completed_at` yang selama ini
--            tidak pernah ada (penyebab utama cron lama menghapus data keliru).
--
-- Menjalankan migrasi ini aman diulang (idempotent).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Kolom `completed_at` — mencatat KAPAN tugas diselesaikan.
--    Tidak boleh memakai `created_at` untuk keperluan ini.
-- ------------------------------------------------------------------------------
ALTER TABLE public.todos
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ DEFAULT NULL;

-- Backfill data lama: untuk tugas yang sudah selesai, anggap selesai saat dibuat.
-- Estimasi ini mungkin meleset beberapa hari, tetapi JAUH lebih baik daripada NULL
-- dan tetap jauh lebih aman daripada logika lama yang menyaring `created_at`.
UPDATE public.todos
SET completed_at = created_at
WHERE is_completed = true
  AND completed_at IS NULL;

-- ------------------------------------------------------------------------------
-- 2. Trigger pemelihara `completed_at`.
--    PENTING: nama trigger sengaja diurutkan agar dieksekusi SETELAH
--    `tr_sync_todos_status` (PostgreSQL menjalankan BEFORE trigger berdasarkan
--    abjad nama, dan "tr_sync..." < "tr_todos..."). Jadi ia selalu membaca
--    nilai `status`/`is_completed` yang SUDAH dinormalisasi.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_todos_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Tugas yang diarsipkan tetap menyimpan jejak kapan ia selesai.
  IF NEW.status = 'ARCHIVED' THEN
    RETURN NEW;
  END IF;

  IF NEW.is_completed IS TRUE AND NEW.completed_at IS NULL THEN
    NEW.completed_at := timezone('utc'::text, now());
  ELSIF NEW.is_completed IS NOT TRUE THEN
    NEW.completed_at := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_todos_completed_at ON public.todos;
CREATE TRIGGER tr_todos_completed_at
BEFORE INSERT OR UPDATE ON public.todos
FOR EACH ROW
EXECUTE FUNCTION public.sync_todos_completed_at();

-- ------------------------------------------------------------------------------
-- 3. Definisi ulang trigger status dengan aturan yang sudah diperbaiki.
--    (Block ini wajib diulang di sini karena instalasi yang sudah ada tidak
--    akan menjalankan ulang file 05.)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_todos_status_and_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Alias nama tugas: kolom `task` (bawaan) <-> `title` (SoloFlow)
  IF NEW.task IS NOT NULL AND (NEW.title IS NULL OR NEW.title = '') THEN
    NEW.title := NEW.task;
  ELSIF NEW.title IS NOT NULL AND (NEW.task IS NULL OR NEW.task = '') THEN
    NEW.task := NEW.title;
  END IF;

  -- Alias URL cover image
  IF NEW.image_url IS NOT NULL AND NEW.cover_image_url IS NULL THEN
    NEW.cover_image_url := NEW.image_url;
  ELSIF NEW.cover_image_url IS NOT NULL AND NEW.image_url IS NULL THEN
    NEW.image_url := NEW.cover_image_url;
  END IF;

  -- Normalisasi status
  IF NEW.status IS NULL THEN
    NEW.status := CASE WHEN NEW.is_completed = true THEN 'DONE' ELSE 'TODO' END;
  END IF;

  -- is_completed di-toggle true tanpa perubahan status -> naikkan ke DONE
  IF NEW.is_completed = true
     AND NEW.status IS DISTINCT FROM 'DONE'
     AND NEW.status IS DISTINCT FROM 'ARCHIVED' THEN
    NEW.status := 'DONE';
  END IF;

  -- 'ARCHIVED' sengaja diabaikan agar is_completed tidak ter-reset.
  IF NEW.status = 'DONE' THEN
    NEW.is_completed := true;
  ELSIF NEW.status IN ('BACKLOG', 'TODO', 'IN_PROGRESS') THEN
    NEW.is_completed := false;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 4. Index yang selama ini hilang (P1-13).
--    `created_at` di-ORDER BY pada setiap page load; `is_completed` di-scan
--    penuh oleh cron; keduanya belum pernah di-index.
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_todos_created_at    ON public.todos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_todos_completed_at  ON public.todos (completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_todos_is_completed  ON public.todos (is_completed);
CREATE INDEX IF NOT EXISTS idx_todos_user_created ON public.todos (user_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- 5. Jadwalkan ulang cron: ARSIP, bukan HAPUS.
--    Runs setiap hari 17:00 UTC (= 00:00 WIB).
--    Kriteria: SELESAI lebih dari 30 hari lalu (berdasarkan `completed_at`).
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'auto-cleanup-tasks') THEN
    PERFORM cron.unschedule('auto-cleanup-tasks');
  END IF;
END $$;

SELECT cron.schedule(
  'auto-cleanup-tasks',
  '0 17 * * *',
  $$
  UPDATE public.todos
     SET status = 'ARCHIVED', is_completed = false
   WHERE is_completed = true
     AND status <> 'ARCHIVED'
     AND completed_at IS NOT NULL
     AND completed_at < NOW() - INTERVAL '30 days'
  $$
);

-- ------------------------------------------------------------------------------
-- 6. Realtime publication untuk tabel yang belum terdaftar.
--    `subtasks` (06) dan `projects` (07) tidak pernah ditambahkan ke
--    supabase_realtime, padahal `fetchTasks` meminta `subtasks(*)` secara
--    eager — sehingga perubahan subtask tidak pernah menyiarkan secara live.
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
     WHERE pubname = 'supabase_realtime'
       AND schemaname = 'public' AND tablename = 'subtasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.subtasks;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
     WHERE pubname = 'supabase_realtime'
       AND schemaname = 'public' AND tablename = 'projects'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 7. Pin `search_path` pada fungsi SECURITY DEFINER yang dibuat di 01/02/06/07.
--    Tanpa ini, fungsi tersebut rentan search_path injection.
-- ------------------------------------------------------------------------------
ALTER FUNCTION public.handle_todos_user_id()      SET search_path = pg_catalog, public;
ALTER FUNCTION public.handle_attachments_user_id() SET search_path = pg_catalog, public;
ALTER FUNCTION public.handle_subtasks_user_id()    SET search_path = pg_catalog, public;
ALTER FUNCTION public.handle_projects_user_id()    SET search_path = pg_catalog, public;
ALTER FUNCTION public.sync_todos_completed_at()    SET search_path = pg_catalog, public;
ALTER FUNCTION public.sync_todos_status_and_completion() SET search_path = pg_catalog, public;
