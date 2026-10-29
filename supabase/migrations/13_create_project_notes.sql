-- ==============================================================================
-- MIGRATION: 13_create_project_notes.sql
-- Sprint 4 — Project Wiki / Knowledge Scratchpad
-- ==============================================================================

-- 1. Buat tabel project_notes (Wiki / Scratchpad per Project)
CREATE TABLE IF NOT EXISTS public.project_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Catatan Tanpa Judul',
  content_markdown TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Index untuk optimasi query
CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON public.project_notes (project_id);
CREATE INDEX IF NOT EXISTS idx_project_notes_user_id ON public.project_notes (user_id);
CREATE INDEX IF NOT EXISTS idx_project_notes_updated_at ON public.project_notes (updated_at DESC);

-- 3. Trigger auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_project_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_project_notes_updated_at ON public.project_notes;
CREATE TRIGGER tr_project_notes_updated_at
BEFORE UPDATE ON public.project_notes
FOR EACH ROW
EXECUTE FUNCTION public.handle_project_notes_updated_at();

-- 4. Aktifkan RLS
ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "Solo user full access to project_notes" ON public.project_notes;
CREATE POLICY "Solo user full access to project_notes"
  ON public.project_notes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
