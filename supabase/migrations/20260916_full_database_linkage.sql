-- ====================================================================
-- AZHAI BOUTIQUE — FULL DATABASE LINKAGE MIGRATION
-- Run this entire script in the Supabase SQL Editor (SQL Editor -> New Query)
-- ====================================================================

-- ── 0. EXTENSIONS ──
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. PRODUCT REVIEWS TABLE ──
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  product_slug TEXT,
  user_id UUID,
  author_name TEXT NOT NULL,
  location TEXT DEFAULT 'Colombo',
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  fit TEXT DEFAULT 'True to Size' CHECK (fit IN ('True to Size', 'Runs Slightly Small', 'Runs Slightly Large')),
  is_verified BOOLEAN DEFAULT true,
  likes INT DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_name ON public.product_reviews(product_name);
CREATE INDEX IF NOT EXISTS idx_product_reviews_slug ON public.product_reviews(product_slug);

-- Enable RLS for product reviews
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved reviews" ON public.product_reviews;
CREATE POLICY "Public can view approved reviews"
  ON public.product_reviews FOR SELECT
  USING (is_approved = true);

DROP POLICY IF EXISTS "Public can submit reviews" ON public.product_reviews;
CREATE POLICY "Public can submit reviews"
  ON public.product_reviews FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update review likes" ON public.product_reviews;
CREATE POLICY "Public can update review likes"
  ON public.product_reviews FOR UPDATE
  USING (true)
  WITH CHECK (true);


-- ── 2. CONTACT & ATELIER INQUIRIES TABLE ──
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  topic TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'in_progress', 'resolved')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_email ON public.inquiries(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);

-- Enable RLS for inquiries
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit inquiry" ON public.inquiries;
CREATE POLICY "Anyone can submit inquiry"
  ON public.inquiries FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view and manage inquiries" ON public.inquiries;
CREATE POLICY "Admins can view and manage inquiries"
  ON public.inquiries FOR ALL
  USING (true)
  WITH CHECK (true);


-- ── 3. ABANDONED CARTS TABLE ──
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL UNIQUE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_value NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_abandoned_carts_email ON public.abandoned_carts(customer_email);

-- Enable RLS for abandoned carts
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow cart session management" ON public.abandoned_carts;
CREATE POLICY "Allow cart session management"
  ON public.abandoned_carts FOR ALL
  USING (true)
  WITH CHECK (true);


-- ── 4. EXTEND PROFILES WITH FAMILY MEASUREMENT PROFILES ──
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS family_profiles JSONB DEFAULT '[]'::jsonb;


-- ── 5. SEED CURATED PRODUCT REVIEWS ──
INSERT INTO public.product_reviews (product_name, product_slug, author_name, location, rating, title, comment, fit, is_verified, likes)
VALUES
  (
    'Maroon Corset Handloom Kurti Set',
    'maroon-corset-kurti-set',
    'Ananya S.',
    'Colombo 07',
    5,
    'Exquisite handloom drape and stitching',
    'The silk is featherlight and the maroon hue is truly royal. Wore this for my cousin’s engagement in Colombo and received endless compliments. Sizing was spot-on.',
    'True to Size',
    true,
    14
  ),
  (
    'Ivory Hand-Painted Lotus Organza Saree',
    'ivory-lotus-organza-saree',
    'Tharushi W.',
    'Kandy',
    5,
    'Prompt delivery and heirloom packaging',
    'Arrived in Kandy within 48 hours via Sri Lanka Post Speed Post. The gold zari weaving is breathtaking and the fabric breathes beautifully in our climate.',
    'True to Size',
    true,
    9
  ),
  (
    'Heirloom Zari Embroidered Silk Shawl',
    'heirloom-zari-silk-shawl',
    'Preethi K.',
    'Jaffna',
    5,
    'Authentic craftsmanship by Preethi',
    'You can feel the artisan touch in every border detail. The lining is soft pure cotton, making it extremely comfortable for all-day wear.',
    'True to Size',
    true,
    18
  )
ON CONFLICT DO NOTHING;
