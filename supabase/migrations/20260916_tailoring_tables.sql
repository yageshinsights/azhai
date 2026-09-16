-- ==============================================================================
-- AZHAI BOUTIQUE — BESPOKE TAILORING STUDIO MIGRATION
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hrmcxxcrnxqhesiywqsc/sql/new
-- ==============================================================================

-- 1. Dress Types Table
CREATE TABLE IF NOT EXISTS public.tailoring_dress_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  cover_image TEXT DEFAULT '',
  stitching_fee INTEGER NOT NULL DEFAULT 0,
  lead_time TEXT DEFAULT '5–7 working days',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Fabrics Inventory Table
CREATE TABLE IF NOT EXISTS public.tailoring_fabrics (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  swatch_image TEXT DEFAULT '',
  price_per_unit INTEGER NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'meter',
  weight TEXT DEFAULT '',
  compatible_dress_type_ids INT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Measurement Fields Table
CREATE TABLE IF NOT EXISTS public.tailoring_measurement_fields (
  id SERIAL PRIMARY KEY,
  dress_type_id INTEGER REFERENCES public.tailoring_dress_types(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  min_value NUMERIC DEFAULT 0,
  max_value NUMERIC DEFAULT 100,
  display_order INTEGER DEFAULT 0
);

-- 4. Size Presets Table
CREATE TABLE IF NOT EXISTS public.tailoring_size_presets (
  id SERIAL PRIMARY KEY,
  dress_type_id INTEGER REFERENCES public.tailoring_dress_types(id) ON DELETE CASCADE,
  size_label TEXT NOT NULL,
  measurements JSONB NOT NULL DEFAULT '{}'
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.tailoring_dress_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tailoring_fabrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tailoring_measurement_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tailoring_size_presets ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
DROP POLICY IF EXISTS 'Public Read Tailoring Dress Types' ON public.tailoring_dress_types;
CREATE POLICY 'Public Read Tailoring Dress Types' ON public.tailoring_dress_types FOR SELECT USING (true);
DROP POLICY IF EXISTS 'Admin Modify Tailoring Dress Types' ON public.tailoring_dress_types;
CREATE POLICY 'Admin Modify Tailoring Dress Types' ON public.tailoring_dress_types FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS 'Public Read Tailoring Fabrics' ON public.tailoring_fabrics;
CREATE POLICY 'Public Read Tailoring Fabrics' ON public.tailoring_fabrics FOR SELECT USING (true);
DROP POLICY IF EXISTS 'Admin Modify Tailoring Fabrics' ON public.tailoring_fabrics;
CREATE POLICY 'Admin Modify Tailoring Fabrics' ON public.tailoring_fabrics FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS 'Public Read Tailoring Fields' ON public.tailoring_measurement_fields;
CREATE POLICY 'Public Read Tailoring Fields' ON public.tailoring_measurement_fields FOR SELECT USING (true);
DROP POLICY IF EXISTS 'Admin Modify Tailoring Fields' ON public.tailoring_measurement_fields;
CREATE POLICY 'Admin Modify Tailoring Fields' ON public.tailoring_measurement_fields FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS 'Public Read Tailoring Presets' ON public.tailoring_size_presets;
CREATE POLICY 'Public Read Tailoring Presets' ON public.tailoring_size_presets FOR SELECT USING (true);
DROP POLICY IF EXISTS 'Admin Modify Tailoring Presets' ON public.tailoring_size_presets;
CREATE POLICY 'Admin Modify Tailoring Presets' ON public.tailoring_size_presets FOR ALL USING (true) WITH CHECK (true);

-- 7. Seed Initial Dress Types
INSERT INTO public.tailoring_dress_types (id, name, slug, cover_image, stitching_fee, lead_time, is_active, display_order) VALUES
(1, 'Kurti Set', 'kurti-set', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85', 3500, '5–7 working days', true, 1),
(2, 'Saree Blouse', 'saree-blouse', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=85', 2500, '3–5 working days', true, 2),
(3, 'Salwar Suit', 'salwar-suit', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=85', 4000, '7–10 working days', true, 3),
(4, 'Lehenga Choli', 'lehenga-choli', 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=600&q=85', 5000, '10–14 working days', true, 4),
(5, 'Top / Bustier', 'top-bustier', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=85', 2000, '3–5 working days', true, 5)
ON CONFLICT (slug) DO NOTHING;

-- 8. Seed Initial Fabrics
INSERT INTO public.tailoring_fabrics (id, name, slug, swatch_image, price_per_unit, unit, weight, compatible_dress_type_ids, in_stock, display_order) VALUES
(1, 'Kanjivaram Mulberry Silk', 'kanjivaram-mulberry-silk', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80', 4200, 'meter', '85 GSM · Heavy Fall', '{1,2,3,4}', true, 1),
(2, 'Featherlight Sheer Organza', 'featherlight-sheer-organza', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80', 3200, 'meter', '28 GSM · Ultra Light', '{1,2,4,5}', true, 2),
(3, 'Zari-Embroidered Pure Silk', 'zari-embroidered-pure-silk', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80', 5500, 'meter', '75 GSM · Fluid Wrap', '{1,2,3,4}', true, 3),
(4, 'Handloom Cotton-Silk Chanderi', 'handloom-cotton-silk-chanderi', 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=400&q=80', 2800, 'meter', '45 GSM · Breathable', '{1,3,5}', true, 4)
ON CONFLICT (slug) DO NOTHING;
