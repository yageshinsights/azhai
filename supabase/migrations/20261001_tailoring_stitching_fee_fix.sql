-- ══════════════════════════════════════════════════════════════
-- TAILORING DRESS TYPES & STITCHING FEE MIGRATION
-- Run this in your Supabase SQL Editor if you want database-level columns updated.
-- ══════════════════════════════════════════════════════════════

-- 1. Ensure tailoring_dress_types has all columns including stitching_fee and required_meters
ALTER TABLE public.tailoring_dress_types ADD COLUMN IF NOT EXISTS collection_id INTEGER REFERENCES public.categories(id) ON DELETE SET NULL;
ALTER TABLE public.tailoring_dress_types ADD COLUMN IF NOT EXISTS collection_slug TEXT DEFAULT 'kurties';
ALTER TABLE public.tailoring_dress_types ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.tailoring_dress_types ADD COLUMN IF NOT EXISTS required_meters NUMERIC(4,2) DEFAULT 2.5;
ALTER TABLE public.tailoring_dress_types ADD COLUMN IF NOT EXISTS cover_image TEXT DEFAULT '';
ALTER TABLE public.tailoring_dress_types ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '';
ALTER TABLE public.tailoring_dress_types ADD COLUMN IF NOT EXISTS stitching_fee INTEGER NOT NULL DEFAULT 0;

-- 2. Ensure tailoring_measurement_fields exists and has category_slug
CREATE TABLE IF NOT EXISTS public.tailoring_measurement_fields (
  id SERIAL PRIMARY KEY,
  category_slug TEXT DEFAULT 'kurties',
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  min_value NUMERIC NOT NULL DEFAULT 0,
  max_value NUMERIC NOT NULL DEFAULT 100,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tailoring_measurement_fields ADD COLUMN IF NOT EXISTS category_slug TEXT DEFAULT 'kurties';

-- 3. Row Level Security policies
ALTER TABLE public.tailoring_dress_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Tailoring Dress Types" ON public.tailoring_dress_types;
CREATE POLICY "Public Read Tailoring Dress Types" ON public.tailoring_dress_types FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Full Tailoring Dress Types" ON public.tailoring_dress_types;
CREATE POLICY "Admin Full Tailoring Dress Types" ON public.tailoring_dress_types FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.tailoring_measurement_fields ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Tailoring Fields" ON public.tailoring_measurement_fields;
CREATE POLICY "Public Read Tailoring Fields" ON public.tailoring_measurement_fields FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Full Tailoring Fields" ON public.tailoring_measurement_fields;
CREATE POLICY "Admin Full Tailoring Fields" ON public.tailoring_measurement_fields FOR ALL USING (true) WITH CHECK (true);
