-- ==============================================================================
-- MIGRATION: 11_add_actual_hours_to_todos.sql
-- DESKRIPSI: Menambahkan kolom `actual_hours` pada tabel `public.todos`
--            untuk mendukung fitur Pomodoro Timer & Focus Mode (Sprint 1)
-- ==============================================================================

ALTER TABLE public.todos
  ADD COLUMN IF NOT EXISTS actual_hours NUMERIC(4, 1) NOT NULL DEFAULT 0;

-- Indeks opsional untuk kueri pelacakan produktivitas dan agregasi jam kerja
CREATE INDEX IF NOT EXISTS idx_todos_actual_hours ON public.todos (actual_hours);

COMMENT ON COLUMN public.todos.actual_hours IS 'Jumlah jam kerja aktual yang dihabiskan pada tugas ini via Focus/Pomodoro Mode';
