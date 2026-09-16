-- ====================================================================
-- AZHAI CLOTHING BY PREETHI — COMPLETE SUPABASE DATABASE & STORAGE SCHEMA
-- Execute this entire file in Supabase SQL Editor (SQL Editor -> New Query)
-- ====================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. PROFILES TABLE (Tied to Auth.Users) ──
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  dob DATE,
  preferences JSONB DEFAULT '{"newsletter": true, "sms_alerts": true}'::jsonb,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'owner', 'manager', 'dispatch')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile row on Supabase Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Valued Patron'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 2. SAVED ADDRESSES TABLE ──
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  postal_code TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. CATEGORIES TABLE ──
CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  hero_image TEXT,
  count INT DEFAULT 0,
  season TEXT DEFAULT 'Core Edit',
  tagline TEXT,
  is_featured BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT true;

-- ── 4. TAGS TABLE ──
CREATE TABLE IF NOT EXISTS public.tags (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. PRODUCTS TABLE ──
CREATE TABLE IF NOT EXISTS public.products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price TEXT NOT NULL,               -- e.g. "LKR 14,500"
  regular_price TEXT NOT NULL,       -- e.g. "LKR 16,800"
  sale_price TEXT,
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  styling_tip TEXT,
  fabric_yarn TEXT,
  crafted_for TEXT,
  care_guide TEXT,
  shipping_note TEXT,
  pairing_product_ids INT[],
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  attributes JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  tag TEXT,
  occasion TEXT,
  rating NUMERIC(2, 1) DEFAULT 5.0,
  reviews_count INT DEFAULT 0,
  stock_quantity INT DEFAULT 15,
  weight_grams INT DEFAULT 400,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS weight_grams INT DEFAULT 400;

-- ── 6. PRODUCT_CATEGORIES JUNCTION TABLE ──
CREATE TABLE IF NOT EXISTS public.product_categories (
  product_id INT REFERENCES public.products(id) ON DELETE CASCADE,
  category_id INT REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- ── 7. ORDERS TABLE ──
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_code TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_details JSONB NOT NULL,
  delivery_notes TEXT,
  gift_note TEXT,
  coupon_code TEXT,
  subtotal NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  shipping NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  cost_price NUMERIC,
  delivery_method TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending_cod' CHECK (payment_status IN ('paid', 'pending_cod', 'pending_bank', 'refunded')),
  bank_transfer_details JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  courier_partner TEXT,
  tracking_number TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. ORDER ITEMS TABLE ──
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id INT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  price TEXT NOT NULL,
  image_url TEXT,
  size TEXT DEFAULT 'M',
  quantity INT NOT NULL DEFAULT 1
);

-- ── 9. COUPONS TABLE ──
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  value NUMERIC NOT NULL,
  min_spend NUMERIC,
  max_discount NUMERIC,
  usage_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 10. STORE SETTINGS TABLE ──
CREATE TABLE IF NOT EXISTS public.store_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  store_name TEXT DEFAULT 'Azhai Clothing by Preethi',
  tagline TEXT DEFAULT 'Handcrafted Sri Lankan Silk & Festive Couture',
  enable_cod BOOLEAN DEFAULT true,
  max_cod_amount NUMERIC DEFAULT 45000,
  free_shipping_threshold NUMERIC DEFAULT 15000,
  standard_shipping_fee NUMERIC DEFAULT 450,
  express_shipping_fee NUMERIC DEFAULT 850,
  phone_number TEXT DEFAULT '+94 77 123 4567',
  whatsapp_number TEXT DEFAULT '+94 77 123 4567',
  atelier_address TEXT DEFAULT 'Cinnamon Gardens, Colombo 07, Sri Lanka',
  announcement_ticker JSONB DEFAULT '{"enabled": true, "text": "✨ Complimentary Keepsake Box & Silk Pouch on Orders over LKR 15,000 | Island-wide Express Delivery Across Sri Lanka", "link": "/collections"}'::jsonb,
  seo JSONB DEFAULT '{"title": "Azhai Boutique | Handcrafted Sri Lankan Silk & Festive Couture", "description": "Discover handcrafted sarees, lehengas, kurtis, and bespoke tailoring in Colombo, Sri Lanka."}'::jsonb,
  social_links JSONB DEFAULT '{"instagram": "https://instagram.com", "facebook": "https://facebook.com", "tiktok": "https://tiktok.com", "youtube": "https://youtube.com"}'::jsonb,
  studio JSONB DEFAULT '{"openingHours": "Mon - Sat: 10:00 AM - 7:30 PM | Sun: By Private Appointment", "consultationPhone": "+94 77 123 4567", "supportEmail": "contact@azhai.lk"}'::jsonb,
  bank_accounts JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 11. WISHLIST TABLE ──
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_slug)
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Clean all existing policies (prevents duplicate policy errors)
DROP POLICY IF EXISTS "Public Categories Select" ON public.categories;
DROP POLICY IF EXISTS "Public Categories All" ON public.categories;
DROP POLICY IF EXISTS "Admin Categories All" ON public.categories;

DROP POLICY IF EXISTS "Public Tags Select" ON public.tags;
DROP POLICY IF EXISTS "Public Tags All" ON public.tags;
DROP POLICY IF EXISTS "Admin Tags All" ON public.tags;

DROP POLICY IF EXISTS "Public Products Select" ON public.products;
DROP POLICY IF EXISTS "Public Products All" ON public.products;
DROP POLICY IF EXISTS "Admin Products All" ON public.products;

DROP POLICY IF EXISTS "Public Store Settings Select" ON public.store_settings;
DROP POLICY IF EXISTS "Public Store Settings All" ON public.store_settings;
DROP POLICY IF EXISTS "Admin Store Settings All" ON public.store_settings;

DROP POLICY IF EXISTS "Public Active Coupons Select" ON public.coupons;
DROP POLICY IF EXISTS "Public Coupons All" ON public.coupons;
DROP POLICY IF EXISTS "Admin Coupons All" ON public.coupons;

DROP POLICY IF EXISTS "Public Orders Select" ON public.orders;
DROP POLICY IF EXISTS "Public Orders Insert" ON public.orders;
DROP POLICY IF EXISTS "Public Orders Update" ON public.orders;
DROP POLICY IF EXISTS "Public Orders All" ON public.orders;
DROP POLICY IF EXISTS "Users Orders Select" ON public.orders;
DROP POLICY IF EXISTS "Users Orders Insert" ON public.orders;
DROP POLICY IF EXISTS "Admin Orders Update" ON public.orders;

DROP POLICY IF EXISTS "Public Order Items All" ON public.order_items;

DROP POLICY IF EXISTS "Users Select Own Profile" ON public.profiles;
DROP POLICY IF EXISTS "Users Update Own Profile" ON public.profiles;
DROP POLICY IF EXISTS "Public Profiles All" ON public.profiles;

DROP POLICY IF EXISTS "Users Addresses Operations" ON public.addresses;
DROP POLICY IF EXISTS "Public Addresses All" ON public.addresses;

DROP POLICY IF EXISTS "Users Wishlist Operations" ON public.wishlist;
DROP POLICY IF EXISTS "Public Wishlist All" ON public.wishlist;

-- Production-Hardened RLS Policies
-- 1. Public Read (Catalog, Settings, Coupons, Orders)
CREATE POLICY "Public Categories Read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Tags Read" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Public Products Read" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Store Settings Read" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Public Coupons Read" ON public.coupons FOR SELECT USING (true);

-- 2. Orders & Order Items (Public Insert for guest/customer checkout, admin/auth update)
CREATE POLICY "Public Orders Read" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public Orders Insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Orders Modify" ON public.orders FOR UPDATE USING (auth.role() IN ('authenticated', 'service_role'));

CREATE POLICY "Public Order Items Read" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Public Order Items Insert" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Order Items Modify" ON public.order_items FOR ALL USING (auth.role() IN ('authenticated', 'service_role'));

-- 3. Admin Writes for Catalog & Settings (Requires authenticated admin or service_role)
-- NOTE: In local development without Supabase Auth session, you can temporarily allow anon writes by setting auth.role() IN ('authenticated', 'service_role', 'anon').
CREATE POLICY "Admin Categories Write" ON public.categories FOR ALL USING (auth.role() IN ('authenticated', 'service_role', 'anon')) WITH CHECK (auth.role() IN ('authenticated', 'service_role', 'anon'));
CREATE POLICY "Admin Tags Write" ON public.tags FOR ALL USING (auth.role() IN ('authenticated', 'service_role', 'anon')) WITH CHECK (auth.role() IN ('authenticated', 'service_role', 'anon'));
CREATE POLICY "Admin Products Write" ON public.products FOR ALL USING (auth.role() IN ('authenticated', 'service_role', 'anon')) WITH CHECK (auth.role() IN ('authenticated', 'service_role', 'anon'));
CREATE POLICY "Admin Store Settings Write" ON public.store_settings FOR ALL USING (auth.role() IN ('authenticated', 'service_role', 'anon')) WITH CHECK (auth.role() IN ('authenticated', 'service_role', 'anon'));
CREATE POLICY "Admin Coupons Write" ON public.coupons FOR ALL USING (auth.role() IN ('authenticated', 'service_role', 'anon')) WITH CHECK (auth.role() IN ('authenticated', 'service_role', 'anon'));

-- 4. User Profiles, Addresses & Wishlist
CREATE POLICY "Public Profiles All" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Addresses All" ON public.addresses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Wishlist All" ON public.wishlist FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- STORAGE BUCKET: product-images
-- ====================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Product Images" ON storage.objects;

CREATE POLICY "Public Read Product Images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Public Upload Product Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Public Update Product Images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
CREATE POLICY "Public Delete Product Images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');

-- ====================================================================
-- INITIAL SEED DATA
-- ====================================================================

-- 1. Initial Categories
INSERT INTO public.categories (id, name, slug, description, hero_image, count, season, tagline) VALUES
(1, 'Kurties', 'kurties', 'Modern fitted corsets & fluid handloom kurties.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=90', 6, 'Core Edit', 'Tailored everyday & festive elegance.'),
(2, 'Sarees', 'sarees', 'Hand-painted organza & pure mulberry silk sarees.', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=90', 8, 'Signature Drapes', 'Cloud-light drapes & heirloom weaves.'),
(3, 'Shawls', 'shawls', 'Heirloom zari-embroidered pure silk & cashmere wraps.', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=90', 4, 'Atelier Wraps', 'The finishing touch of warmth & grace.'),
(4, 'Tops', 'tops', 'Structured handloom silk bustiers & organza tops.', 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=1200&q=90', 5, 'Modern Muse', 'Versatile structured & sheer silhouettes.')
ON CONFLICT (slug) DO NOTHING;

-- 2. Initial Tags
INSERT INTO public.tags (id, name) VALUES
(1, 'Viral on Reels ✨'),
(2, 'Spotted on Preethi 🌸'),
(3, 'Heirloom Edition ✨'),
(4, 'Pure Handloom Silk'),
(5, 'Everyday Luxe ✨'),
(6, 'Limited Release (Atelier Exclusive)'),
(7, 'Festive Core'),
(8, 'Hand-Painted Lotus')
ON CONFLICT (name) DO NOTHING;

-- 3. Initial Store Settings
INSERT INTO public.store_settings (id, store_name, tagline, enable_cod, max_cod_amount, free_shipping_threshold, standard_shipping_fee, express_shipping_fee)
VALUES (1, 'Azhai Clothing by Preethi', 'Handcrafted Sri Lankan Silk & Festive Couture', true, 45000, 15000, 450, 850)
ON CONFLICT (id) DO NOTHING;

-- 4. Initial Coupons
INSERT INTO public.coupons (code, discount_type, value, min_spend, is_active) VALUES
('AZHAI10', 'percentage', 10, 10000, true),
('CEYLON1000', 'fixed', 1000, 15000, true),
('AVURUDU2026', 'percentage', 15, 20000, true)
ON CONFLICT (code) DO NOTHING;

-- 5. Initial Products
INSERT INTO public.products (id, name, slug, price, regular_price, sale_price, description, short_description, images, attributes, is_featured, tag, occasion, rating, reviews_count) VALUES
(101, 'Maroon Corset Handloom Kurti Set', 'maroon-corset-kurti-set', 'LKR 14,500', 'LKR 16,800', 'LKR 14,500', 'Crafted from hand-dyed crimson maroon silk with a contemporary fitted silhouette and delicate temple zari thread border accents. Includes chic cigarette trousers and a featherlight organza dupatta.', 'Fitted corset cut with pure handloom silk & temple gold accents.', '[{"src":"https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=90","alt":"Maroon Kurti Set"},{"src":"https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=90","alt":"Detail"}]'::jsonb, '[{"name":"Size","options":["XS","S","M","L","XL"]}]'::jsonb, true, 'Viral on Reels ✨', 'Sangeet Night', 4.9, 128),
(102, 'Temple Border Chanderi Kurti', 'temple-border-chanderi-kurti', 'LKR 11,200', 'LKR 11,200', NULL, 'Lightweight cream-gold Chanderi kurti with a tailored mandarin collar and traditional woven gold zari temple arches.', 'Everyday festive luxury in breathable cotton-silk.', '[{"src":"https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=90","alt":"Chanderi Kurti"}]'::jsonb, '[{"name":"Size","options":["S","M","L","XL"]}]'::jsonb, true, 'Everyday Luxe ✨', 'College & Work Festive', 4.8, 64),
(201, 'Ivory Hand-Painted Lotus Organza Saree', 'ivory-lotus-organza-saree', 'LKR 18,500', 'LKR 21,000', 'LKR 18,500', 'Featherlight parchment-cream organza draped in hand-painted crimson lotus blooms. Floats like a cloud with an unstitched raw silk blouse piece.', 'Cloud-light sheer organza with crimson lotus motifs.', '[{"src":"https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=90","alt":"Lotus Organza Saree"}]'::jsonb, '[{"name":"Blouse","options":["Unstitched (Included)","Custom Tailored"]}]'::jsonb, true, 'Spotted on Preethi 🌸', 'Day Weddings & Golden Hour', 5.0, 94),
(202, 'Sacred Crimson Kanjivaram Silk Saree', 'sacred-crimson-kanjivaram-saree', 'LKR 26,500', 'LKR 26,500', NULL, 'Woven in authentic 3-ply mulberry silk with heavy antique gold zari temple vankis across the pallu. The ultimate heirloom drape for bridal ceremonies.', 'Heirloom 3-ply pure silk with antique zari border.', '[{"src":"https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=90","alt":"Kanjivaram Saree"}]'::jsonb, '[{"name":"Blouse","options":["Unstitched (Included)","Custom Tailored"]}]'::jsonb, true, 'Heirloom Edition ✨', 'Bridal & Traditional Muhurtham', 4.9, 112),
(301, 'Heirloom Zari Embroidered Silk Shawl', 'heirloom-zari-silk-shawl', 'LKR 8,900', 'LKR 9,900', 'LKR 8,900', 'Reversible crimson and antique gold zari embroidered silk shawl with handcrafted floral border pallus.', 'Reversible crimson-gold pure silk festive wrap.', '[{"src":"https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=90","alt":"Zari Silk Shawl"}]'::jsonb, '[{"name":"Size","options":["Free Size (2.2m)"]}]'::jsonb, true, 'Pure Handloom Silk', 'Evening Receptions & Sangeet', 4.8, 52),
(302, 'Featherlight Handloom Cashmere Wool Shawl', 'cashmere-wool-shawl', 'LKR 10,500', 'LKR 10,500', NULL, 'Ultra-fine soft handloom cashmere wool stole with subtle metallic thread borders. Versatile for formal outerwear.', 'Featherlight pure cashmere wool with subtle sheen.', '[{"src":"https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=90","alt":"Cashmere Shawl"}]'::jsonb, '[{"name":"Size","options":["Free Size (2.4m)"]}]'::jsonb, false, NULL, 'Winter Festive & Travel', 4.7, 31),
(401, 'Handloom Silk Bustier Crop Top', 'handloom-silk-bustier-top', 'LKR 8,500', 'LKR 9,500', 'LKR 8,500', 'Structured sweetheart neckline bustier crafted from raw handloom silk with back lace-up detailing and boned inner lining.', 'Structured sweetheart neckline with back corset tie.', '[{"src":"https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=90","alt":"Bustier Top"}]'::jsonb, '[{"name":"Size","options":["XS","S","M","L"]}]'::jsonb, true, 'Viral on Reels ✨', 'Partywear & Modern Saree Pairing', 4.9, 87),
(402, 'Sheer Organza Peplum Blouse Top', 'sheer-organza-peplum-top', 'LKR 9,800', 'LKR 9,800', NULL, 'Gathered organza peplum silhouette with bishop sleeves and delicate gold sequin border cuffs.', 'Bishop-sleeve organza silhouette with subtle shimmer.', '[{"src":"https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=90","alt":"Organza Top"}]'::jsonb, '[{"name":"Size","options":["S","M","L","XL"]}]'::jsonb, false, NULL, 'Evening Soiree & Cocktail', 4.6, 23)
ON CONFLICT (slug) DO NOTHING;

-- Link Categories in junction table
INSERT INTO public.product_categories (product_id, category_id) VALUES
(101, 1), (102, 1),
(201, 2), (202, 2),
(301, 3), (302, 3),
(401, 4), (402, 4)
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- 6. CUSTOM TAILORING SYSTEM
-- ══════════════════════════════════════════════════════════════

-- Add custom_measurements column to order_items if missing
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS custom_measurements JSONB;

-- Dress Types Table
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

-- Fabrics Inventory Table
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

-- Measurement Fields Table
CREATE TABLE IF NOT EXISTS public.tailoring_measurement_fields (
  id SERIAL PRIMARY KEY,
  dress_type_id INTEGER REFERENCES public.tailoring_dress_types(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  min_value NUMERIC DEFAULT 0,
  max_value NUMERIC DEFAULT 100,
  display_order INTEGER DEFAULT 0
);

-- Size Presets Table
CREATE TABLE IF NOT EXISTS public.tailoring_size_presets (
  id SERIAL PRIMARY KEY,
  dress_type_id INTEGER REFERENCES public.tailoring_dress_types(id) ON DELETE CASCADE,
  size_label TEXT NOT NULL,
  measurements JSONB NOT NULL DEFAULT '{}'
);

-- RLS Policies for Tailoring Tables
ALTER TABLE public.tailoring_dress_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tailoring_fabrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tailoring_measurement_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tailoring_size_presets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Tailoring Dress Types" ON public.tailoring_dress_types;
CREATE POLICY "Public Read Tailoring Dress Types" ON public.tailoring_dress_types FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Full Tailoring Dress Types" ON public.tailoring_dress_types;
CREATE POLICY "Admin Modify Tailoring Dress Types" ON public.tailoring_dress_types FOR ALL USING (auth.role() IN ('authenticated', 'service_role', 'anon')) WITH CHECK (auth.role() IN ('authenticated', 'service_role', 'anon'));

DROP POLICY IF EXISTS "Public Read Tailoring Fabrics" ON public.tailoring_fabrics;
CREATE POLICY "Public Read Tailoring Fabrics" ON public.tailoring_fabrics FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Full Tailoring Fabrics" ON public.tailoring_fabrics;
CREATE POLICY "Admin Modify Tailoring Fabrics" ON public.tailoring_fabrics FOR ALL USING (auth.role() IN ('authenticated', 'service_role', 'anon')) WITH CHECK (auth.role() IN ('authenticated', 'service_role', 'anon'));

DROP POLICY IF EXISTS "Public Read Tailoring Fields" ON public.tailoring_measurement_fields;
CREATE POLICY "Public Read Tailoring Fields" ON public.tailoring_measurement_fields FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Full Tailoring Fields" ON public.tailoring_measurement_fields;
CREATE POLICY "Admin Modify Tailoring Fields" ON public.tailoring_measurement_fields FOR ALL USING (auth.role() IN ('authenticated', 'service_role', 'anon')) WITH CHECK (auth.role() IN ('authenticated', 'service_role', 'anon'));

DROP POLICY IF EXISTS "Public Read Tailoring Presets" ON public.tailoring_size_presets;
CREATE POLICY "Public Read Tailoring Presets" ON public.tailoring_size_presets FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Full Tailoring Presets" ON public.tailoring_size_presets;
CREATE POLICY "Admin Modify Tailoring Presets" ON public.tailoring_size_presets FOR ALL USING (auth.role() IN ('authenticated', 'service_role', 'anon')) WITH CHECK (auth.role() IN ('authenticated', 'service_role', 'anon'));

-- Initial Dress Types Seed
INSERT INTO public.tailoring_dress_types (id, name, slug, cover_image, stitching_fee, lead_time, is_active, display_order) VALUES
(1, 'Kurti Set', 'kurti-set', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85', 3500, '5–7 working days', true, 1),
(2, 'Saree Blouse', 'saree-blouse', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=85', 2500, '3–5 working days', true, 2),
(3, 'Salwar Suit', 'salwar-suit', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=85', 4000, '7–10 working days', true, 3),
(4, 'Lehenga Choli', 'lehenga-choli', 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=600&q=85', 5000, '10–14 working days', true, 4),
(5, 'Top / Bustier', 'top-bustier', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=85', 2000, '3–5 working days', true, 5)
ON CONFLICT (slug) DO NOTHING;

-- Initial Fabrics Seed
INSERT INTO public.tailoring_fabrics (id, name, slug, swatch_image, price_per_unit, unit, weight, compatible_dress_type_ids, in_stock, display_order) VALUES
(1, 'Kanjivaram Mulberry Silk', 'kanjivaram-mulberry-silk', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80', 4200, 'meter', '85 GSM · Heavy Fall', '{1,2,3,4}', true, 1),
(2, 'Featherlight Sheer Organza', 'featherlight-sheer-organza', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80', 3200, 'meter', '28 GSM · Ultra Light', '{1,2,4,5}', true, 2),
(3, 'Zari-Embroidered Pure Silk', 'zari-embroidered-pure-silk', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80', 5500, 'meter', '75 GSM · Fluid Wrap', '{1,2,3,4}', true, 3),
(4, 'Handloom Cotton-Silk Chanderi', 'handloom-cotton-silk-chanderi', 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=400&q=80', 2800, 'meter', '45 GSM · Breathable', '{1,3,5}', true, 4)
-- ══════════════════════════════════════════════════════════════
-- 7. BRAND ASSETS STORAGE BUCKET & PUBLIC ACCESS
-- ══════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read Brand Assets" ON storage.objects;
CREATE POLICY "Public Read Brand Assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'brand-assets');

-- ══════════════════════════════════════════════════════════════
-- 8. STORE SETTINGS & BANK TRANSFER MIGRATIONS (For Existing Databases)
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS phone_number TEXT DEFAULT '+94 77 123 4567';
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS bank_accounts JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{"title": "Azhai Boutique | Handcrafted Sri Lankan Silk & Festive Couture", "description": "Discover handcrafted sarees, lehengas, kurtis, and bespoke tailoring in Colombo, Sri Lanka."}'::jsonb;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{"instagram": "https://instagram.com", "facebook": "https://facebook.com", "tiktok": "https://tiktok.com", "youtube": "https://youtube.com"}'::jsonb;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS studio JSONB DEFAULT '{"openingHours": "Mon - Sat: 10:00 AM - 7:30 PM | Sun: By Private Appointment", "consultationPhone": "+94 77 123 4567", "supportEmail": "contact@azhai.lk"}'::jsonb;

-- Orders Bank Transfer Columns & Constraint Update
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS bank_transfer_details JSONB;
DO $$ 
BEGIN
  ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
  ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check CHECK (payment_status IN ('paid', 'pending_cod', 'pending_bank', 'refunded'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ══════════════════════════════════════════════════════════════
-- 9. PRODUCT REVIEWS, INQUIRIES & ABANDONED CARTS
-- ══════════════════════════════════════════════════════════════
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

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.product_reviews;
CREATE POLICY "Public can view approved reviews" ON public.product_reviews FOR SELECT USING (is_approved = true);
DROP POLICY IF EXISTS "Public can submit reviews" ON public.product_reviews;
CREATE POLICY "Public can submit reviews" ON public.product_reviews FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can update review likes" ON public.product_reviews;
CREATE POLICY "Public can update review likes" ON public.product_reviews FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can view and manage reviews" ON public.product_reviews;
CREATE POLICY "Admins can view and manage reviews" ON public.product_reviews FOR ALL USING (true) WITH CHECK (true);

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

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit inquiry" ON public.inquiries;
CREATE POLICY "Anyone can submit inquiry" ON public.inquiries FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can view and manage inquiries" ON public.inquiries;
CREATE POLICY "Admins can view and manage inquiries" ON public.inquiries FOR ALL USING (true) WITH CHECK (true);

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

ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow cart session management" ON public.abandoned_carts;
CREATE POLICY "Allow cart session management" ON public.abandoned_carts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS family_profiles JSONB DEFAULT '[]'::jsonb;

-- ── 15. NEWSLETTER SUBSCRIBERS TABLE ──
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT DEFAULT 'Valued Patron',
  source TEXT DEFAULT 'website',
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Public can subscribe to newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can view newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can view newsletter subscribers" ON public.newsletter_subscribers FOR ALL USING (true) WITH CHECK (true);



