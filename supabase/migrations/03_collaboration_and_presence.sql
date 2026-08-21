-- ============================================================================
-- MIGRATION: 03_collaboration_and_presence.sql
-- DESKRIPSI: Kebijakan RLS Kolaborasi Tim Realtime Multi-User
--            Memungkinkan seluruh anggota tim terautentikasi untuk
--            melihat, menambah, mengupdate (drag & drop), dan menghapus tugas bersama.
-- ============================================================================

-- 1. Bersihkan policy solo lama pada tabel todos
DROP POLICY IF EXISTS "Users can view their own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can insert their own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can update their own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can delete their own todos" ON public.todos;
DROP POLICY IF EXISTS "Team members can view all todos" ON public.todos;
DROP POLICY IF EXISTS "Team members can insert todos" ON public.todos;
DROP POLICY IF EXISTS "Team members can update todos" ON public.todos;
DROP POLICY IF EXISTS "Team members can delete todos" ON public.todos;

-- 2. Buat Policy Kolaborasi Tim pada tabel todos:
-- [SELECT] Anggota tim terautentikasi dapat melihat seluruh tugas tim
CREATE POLICY "Team members can view all todos" 
ON public.todos 
FOR SELECT 
TO authenticated 
USING (true);

-- [INSERT] Anggota tim terautentikasi dapat menambahkan tugas
CREATE POLICY "Team members can insert todos" 
ON public.todos 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- [UPDATE] Anggota tim terautentikasi dapat memperbarui status tugas (termasuk drag & drop kanban)
CREATE POLICY "Team members can update todos" 
ON public.todos 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- [DELETE] Anggota tim terautentikasi dapat menghapus tugas
CREATE POLICY "Team members can delete todos" 
ON public.todos 
FOR DELETE 
TO authenticated 
USING (true);

-- 3. Bersihkan policy solo lama pada tabel task_attachments
DROP POLICY IF EXISTS "Users can view their own task attachments" ON public.task_attachments;
DROP POLICY IF EXISTS "Users can insert their own task attachments" ON public.task_attachments;
DROP POLICY IF EXISTS "Users can update their own task attachments" ON public.task_attachments;
DROP POLICY IF EXISTS "Users can delete their own task attachments" ON public.task_attachments;
DROP POLICY IF EXISTS "Team members can view all task attachments" ON public.task_attachments;
DROP POLICY IF EXISTS "Team members can insert task attachments" ON public.task_attachments;
DROP POLICY IF EXISTS "Team members can update task attachments" ON public.task_attachments;
DROP POLICY IF EXISTS "Team members can delete task attachments" ON public.task_attachments;

-- 4. Buat Policy Kolaborasi Tim pada tabel task_attachments:
CREATE POLICY "Team members can view all task attachments" 
ON public.task_attachments 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Team members can insert task attachments" 
ON public.task_attachments 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Team members can update task attachments" 
ON public.task_attachments 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Team members can delete task attachments" 
ON public.task_attachments 
FOR DELETE 
TO authenticated 
USING (true);

-- 5. Pastikan publikasi Realtime supabase_realtime memuat kedua tabel
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'todos'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.todos;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'task_attachments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.task_attachments;
  END IF;
END $$;
