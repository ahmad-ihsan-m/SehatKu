-- Phase 2: Core Business Completion - Medicine Management
-- Adds inventory management fields and status tracking

-- 0. Enable extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. Add missing columns to medicines table
ALTER TABLE public.medicines 
ADD COLUMN IF NOT EXISTS dosage TEXT,
ADD COLUMN IF NOT EXISTS manufacturer TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Create storage bucket for medicine images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('medicines', 'medicines', true) 
ON CONFLICT (id) DO NOTHING;

-- 3. Drop old policies if exist
DROP POLICY IF EXISTS "Medicine images are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Only admins can upload medicine images." ON storage.objects;
DROP POLICY IF EXISTS "Only admins can update medicine images." ON storage.objects;
DROP POLICY IF EXISTS "Only admins can delete medicine images." ON storage.objects;

-- 4. Create storage policies
CREATE POLICY "Medicine images are publicly accessible." 
ON storage.objects FOR SELECT 
USING (bucket_id = 'medicines');

CREATE POLICY "Only admins can upload medicine images." 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'medicines'
  AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update medicine images." 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'medicines'
  AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Only admins can delete medicine images." 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'medicines'
  AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- 5. Improve performance with indexes
CREATE INDEX IF NOT EXISTS idx_medicines_name_trgm 
ON public.medicines 
USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_medicines_is_active 
ON public.medicines(is_active);
