-- ==============================================================================
-- Migration: 04_setup_pg_cron_cleanup.sql
-- Deskripsi: MENONAKKAN job cleanup lama yang berbahaya.
--
-- PERINGATAN — migrasi ini dulunya mendaftarkan cron job berikut:
--   DELETE FROM public.todos
--   WHERE is_completed = true AND created_at < NOW() - INTERVAL '30 days'
--
-- Dua bugs fatal pada job tersebut:
--   1. Memfilter `created_at` (tanggal dibuat), bukan tanggal DISELESAIKAN.
--      Tugas yang dibuat 6 bulan lalu lalu diselesaikan HARI INI akan dihapus
--      pada run cron berikutnya. => kehilangan data.
--   2. Hard DELETE tanpa arsip, padahal enum `status: 'ARCHIVED'` sudah tersedia.
--
-- Job ini juga tidak bisa diperbaiki di file ini, karena ia dijalankan SEBELUM
-- migration 05 yang baru mendefinisikan kolom `status` dan enum `task_status`.
--
-- Karena itu file ini sekarang hanya membersihkan job lamalan. Setup cron yang
-- benar (soft-delete ke `ARCHIVED` berbasis `completed_at`) dipindahkan ke
-- 08_archive_completed_tasks.sql.
-- ==============================================================================

-- 1. Aktifkan ekstensi pg_cron jika belum aktif
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Lepaskan job cleanup lama (nama 'auto-cleanup-tasks' atau nama variant lama)
DO $$
DECLARE
  legacy_job RECORD;
BEGIN
  FOR legacy_job IN
    SELECT jobid FROM cron.job WHERE jobname = 'auto-cleanup-tasks'
  LOOP
    PERFORM cron.unschedule(legacy_job.jobid);
  END LOOP;
END $$;
