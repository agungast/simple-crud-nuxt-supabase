-- ============================================================================== 
-- MIGRATION: 12_create_task_templates.sql
-- Sprint 3 — AI Natural Language Quick Add & Templates
-- ============================================================================== 

CREATE TABLE IF NOT EXISTS public.task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  title_template TEXT NOT NULL,
  description_markdown TEXT DEFAULT '',
  priority task_priority NOT NULL DEFAULT 'MEDIUM',
  tags TEXT[] DEFAULT '{}',
  estimated_hours NUMERIC(4, 1) DEFAULT 0,
  subtasks TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_templates_user ON public.task_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_task_templates_created ON public.task_templates(created_at DESC);

ALTER TABLE public.task_templates
  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "task_templates_user_isolation" ON public.task_templates;

CREATE POLICY "task_templates_user_isolation" 
ON public.task_templates 
FOR ALL 
USING (auth.uid() = user_id);
