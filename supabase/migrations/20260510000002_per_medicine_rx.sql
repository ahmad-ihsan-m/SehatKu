-- Phase 3.1: Per-Medicine Prescription System

-- 1. Add medicine_id to prescriptions table
ALTER TABLE public.prescriptions 
ADD COLUMN IF NOT EXISTS medicine_id UUID REFERENCES public.medicines(id) ON DELETE SET NULL;

-- 2. Add index for faster lookup
CREATE INDEX IF NOT EXISTS idx_prescriptions_medicine_id ON public.prescriptions(medicine_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_user_medicine ON public.prescriptions(user_id, medicine_id);

-- 3. Update get_approved_prescription logic (implicit in queries)
-- We don't need to change the table further, just the query logic in our app.
