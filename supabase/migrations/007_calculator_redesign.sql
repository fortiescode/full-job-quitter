-- Add post-quit expenses field for the redesigned Freedom Calculator
ALTER TABLE public.financial_goals
ADD COLUMN IF NOT EXISTS monthly_expenses_after_quit NUMERIC(12, 2) NOT NULL DEFAULT 0;
