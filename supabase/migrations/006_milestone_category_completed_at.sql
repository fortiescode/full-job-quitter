-- Add category and completed_at to milestones (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'milestones' AND column_name = 'category'
  ) THEN
    ALTER TABLE public.milestones
      ADD COLUMN category TEXT NOT NULL DEFAULT 'personal';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'milestones' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE public.milestones
      ADD COLUMN completed_at TIMESTAMPTZ NULL;
  END IF;
END $$;

-- Ensure only valid categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'milestones'
      AND constraint_name = 'milestones_category_check'
  ) THEN
    ALTER TABLE public.milestones
      ADD CONSTRAINT milestones_category_check
      CHECK (category IN ('financial', 'career', 'personal'));
  END IF;
END $$;
