-- ==============================================================================
-- MIGRATION: 10_rls_parent_ownership.sql
-- DESKRIPSI: Menutup celah lintas-tenant pada tabel anak (`subtasks`,
--            `task_attachments`) dan referensi `project_id` pada `todos`.
--
-- ---------------------------------------------------------------------------
-- CELAHNYA
-- ---------------------------------------------------------------------------
-- Policy lama hanya membandingkan `auth.uid() = <tabel>.user_id`:
--
--   06_soloflow_phase3_subtasks.sql
--     CREATE POLICY "Solo user can insert own subtasks" ON public.subtasks
--       FOR INSERT WITH CHECK (auth.uid() = user_id);
--
--   02_storage_v2_and_attachments.sql
--     CREATE POLICY "Users can insert their own task attachments"
--       ON public.task_attachments FOR INSERT
--       WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
--
-- `user_id` di kedua tabel hanya menyatakan siapa yang MEMBUAT baris, bukan siapa
-- pemilik task induknya. Trigger `handle_*_user_id()` memang mengisi `user_id`
-- dengan `auth.uid()`, tetapi trigger TIDAK memvalidasi `task_id`.
--
-- Eksploitasi: user A cukup mengirim
--     { task_id: <task milik user B>, user_id: <user A>, ... }
-- Policy terpenuhi karena `user_id` memang miliknya sendiri, padahal tasknya
-- milik orang lain. Efeknya: user A bisa membaca, mengubah, dan MENGHAPUS
-- seluruh subtask milik user B — hanya dengan menebak UUID task-nya.
--
-- Ditambah `OR user_id IS NULL` pada policy INSERT lampiran, yang membuat
-- pemeriksaan benar-benar dapat dilewati sepenuhnya.
--
-- ---------------------------------------------------------------------------
-- PERBAIKAN
-- ---------------------------------------------------------------------------
-- Semua policy tabel anak kini memverifikasi induknya:
--
--     EXISTS (SELECT 1 FROM public.todos t
--             WHERE t.id = <anak>.task_id AND t.user_id = auth.uid())
--
-- Subquery di dalam policy ikut tunduk pada RLS `todos`, jadi tidak ada jalur
-- baca lintas tenant. `todos.id` adalah primary key, jadi biayanya satu index
-- lookup per baris.
--
-- Sekadar bonus, `project_id` pada `todos` juga ikut diverifikasi: tanpa itu
-- pengguna bisa menautkan task-nya ke project milik orang lain.
--
-- Idempotent — aman dijalankan berulang kali.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Tabel `subtasks`
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Solo user can view own subtasks" ON public.subtasks;
CREATE POLICY "Solo user can view own subtasks"
  ON public.subtasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.todos t
      WHERE t.id = subtasks.task_id
        AND t.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Solo user can insert own subtasks" ON public.subtasks;
CREATE POLICY "Solo user can insert own subtasks"
  ON public.subtasks FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.todos t
      WHERE t.id = subtasks.task_id
        AND t.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Solo user can update own subtasks" ON public.subtasks;
CREATE POLICY "Solo user can update own subtasks"
  ON public.subtasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.todos t
      WHERE t.id = subtasks.task_id
        AND t.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.todos t
      WHERE t.id = subtasks.task_id
        AND t.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Solo user can delete own subtasks" ON public.subtasks;
CREATE POLICY "Solo user can delete own subtasks"
  ON public.subtasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.todos t
      WHERE t.id = subtasks.task_id
        AND t.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 2. Tabel `task_attachments`
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own task attachments" ON public.task_attachments;
CREATE POLICY "Users can view their own task attachments"
  ON public.task_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.todos t
      WHERE t.id = task_attachments.task_id
        AND t.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own task attachments" ON public.task_attachments;
CREATE POLICY "Users can insert their own task attachments"
  ON public.task_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.todos t
      WHERE t.id = task_attachments.task_id
        AND t.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own task attachments" ON public.task_attachments;
CREATE POLICY "Users can update their own task attachments"
  ON public.task_attachments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.todos t
      WHERE t.id = task_attachments.task_id
        AND t.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.todos t
      WHERE t.id = task_attachments.task_id
        AND t.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own task attachments" ON public.task_attachments;
CREATE POLICY "Users can delete their own task attachments"
  ON public.task_attachments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.todos t
      WHERE t.id = task_attachments.task_id
        AND t.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 3. Tabel `todos` — verifikasi `project_id`.
--
-- Kolom `project_id` hanya ditambah di migration 07, jadi kolom ini mungkin
-- belum ada di instalasi lama. Seluruh blok dilewati bila kolomnya absen.
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name   = 'todos'
       AND column_name  = 'project_id'
  ) THEN
    DROP POLICY IF EXISTS "Users can update their own todos" ON public.todos;
    CREATE POLICY "Users can update their own todos"
      ON public.todos FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (
        auth.uid() = user_id
        AND (
          project_id IS NULL
          OR EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = todos.project_id
              AND p.user_id = auth.uid()
          )
        )
      );

    DROP POLICY IF EXISTS "Users can insert their own todos" ON public.todos;
    CREATE POLICY "Users can insert their own todos"
      ON public.todos FOR INSERT
      TO authenticated
      WITH CHECK (
        auth.uid() = user_id
        AND (
          project_id IS NULL
          OR EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = todos.project_id
              AND p.user_id = auth.uid()
          )
        )
      );
  END IF;
END $$;