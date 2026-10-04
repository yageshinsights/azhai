-- ====================================================================
-- AZHAI CLOTHING — COMPREHENSIVE ROW LEVEL SECURITY (RLS) LOCKDOWN
-- Migration: 20261004_rls_security_lockdown.sql
-- Description:
--   1. Ensures all required extensions and tables exist
--   2. Enables RLS on all tables including product_categories
--   3. Introduces is_admin() helper based on auth.uid() + profiles.role
--   4. Locks down profiles, addresses, orders, order_items, store_settings,
--      coupons, products, categories, tags, tailoring tables, inquiries,
--      abandoned_carts, newsletter_subscribers, and product_reviews
--   5. Creates secure RPC helpers for guest order lookup, bank slip uploads,
--      and review likes
--   6. Secures storage buckets (order-slips vs product-images)
-- ====================================================================

-- ────────────────────────────────────────────────────────────────────
-- 0. EXTENSIONS & TABLE CREATION SAFEGUARDS
-- ────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ensure all tables exist so DROP/CREATE POLICY does not fail
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'Valued Patron',
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  dob DATE,
  preferences JSONB DEFAULT '{"newsletter": true, "sms_alerts": true}'::jsonb,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'owner', 'manager', 'dispatch')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW(),
  family_profiles JSONB DEFAULT '[]'::jsonb
);

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

CREATE TABLE IF NOT EXISTS public.tags (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price TEXT NOT NULL,
  regular_price TEXT NOT NULL,
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

CREATE TABLE IF NOT EXISTS public.product_categories (
  product_id INT REFERENCES public.products(id) ON DELETE CASCADE,
  category_id INT REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

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
  payment_status TEXT DEFAULT 'pending_cod' CHECK (payment_status IN ('paid', 'pending_card', 'pending_cod', 'pending_bank', 'refunded')),
  bank_transfer_details JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  courier_partner TEXT,
  tracking_number TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id INT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  price TEXT NOT NULL,
  image_url TEXT,
  size TEXT DEFAULT 'M',
  quantity INT NOT NULL DEFAULT 1,
  custom_measurements JSONB
);

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
  announcement_ticker JSONB,
  seo JSONB,
  social_links JSONB,
  studio JSONB,
  bank_accounts JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_slug)
);

CREATE TABLE IF NOT EXISTS public.tailoring_dress_types (
  id SERIAL PRIMARY KEY,
  collection_id INTEGER REFERENCES public.categories(id) ON DELETE SET NULL,
  collection_slug TEXT DEFAULT '',
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  cover_image TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  stitching_fee INTEGER NOT NULL DEFAULT 0,
  required_meters NUMERIC(4,2) DEFAULT 2.5,
  lead_time TEXT DEFAULT '5–7 working days',
  description TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS public.tailoring_measurement_fields (
  id SERIAL PRIMARY KEY,
  category_slug TEXT NOT NULL DEFAULT 'kurties',
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  min_value NUMERIC DEFAULT 0,
  max_value NUMERIC DEFAULT 100,
  display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.tailoring_size_presets (
  id SERIAL PRIMARY KEY,
  dress_type_id INTEGER,
  size_label TEXT NOT NULL,
  measurements JSONB NOT NULL DEFAULT '{}'
);

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

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT DEFAULT 'Valued Patron',
  source TEXT DEFAULT 'website',
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure potentially unmigrated columns exist on orders table
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS bank_transfer_details JSONB;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS courier_partner TEXT;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE IF EXISTS public.order_items ADD COLUMN IF NOT EXISTS custom_measurements JSONB;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS family_profiles JSONB DEFAULT '[]'::jsonb;

-- ────────────────────────────────────────────────────────────────────
-- 1. ADMIN HELPER FUNCTION
-- ────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'manager', 'dispatch', 'admin')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Ensure admin user exists with owner role if already registered
UPDATE public.profiles 
SET role = 'owner' 
WHERE LOWER(email) = LOWER('admin@azhai.lk') AND role = 'customer';

-- ────────────────────────────────────────────────────────────────────
-- 2. ENABLE RLS ON ALL TABLES
-- ────────────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tailoring_dress_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tailoring_fabrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tailoring_measurement_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tailoring_size_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────────
-- 3. PROFILES TABLE
-- ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public Profiles All" ON public.profiles;
DROP POLICY IF EXISTS "Users Select Own Profile" ON public.profiles;
DROP POLICY IF EXISTS "Users Update Own Profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles Select Policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles Update Policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles Insert Policy" ON public.profiles;

CREATE POLICY "Profiles Select Policy"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Profiles Update Policy"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (
    public.is_admin() 
    OR (
      auth.uid() = id 
      AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Profiles Insert Policy"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────────────
-- 4. SAVED ADDRESSES TABLE
-- ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public Addresses All" ON public.addresses;
DROP POLICY IF EXISTS "Users Addresses Operations" ON public.addresses;
DROP POLICY IF EXISTS "Addresses Select Policy" ON public.addresses;
DROP POLICY IF EXISTS "Addresses Insert Policy" ON public.addresses;
DROP POLICY IF EXISTS "Addresses Update Policy" ON public.addresses;
DROP POLICY IF EXISTS "Addresses Delete Policy" ON public.addresses;

CREATE POLICY "Addresses Select Policy"
  ON public.addresses FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Addresses Insert Policy"
  ON public.addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Addresses Update Policy"
  ON public.addresses FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Addresses Delete Policy"
  ON public.addresses FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- ────────────────────────────────────────────────────────────────────
-- 5. ORDERS & ORDER ITEMS TABLES
-- ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public Orders Read" ON public.orders;
DROP POLICY IF EXISTS "Public Orders Insert" ON public.orders;
DROP POLICY IF EXISTS "Admin Orders Modify" ON public.orders;
DROP POLICY IF EXISTS "Admin Orders Delete" ON public.orders;
DROP POLICY IF EXISTS "Orders Select Policy" ON public.orders;
DROP POLICY IF EXISTS "Orders Insert Policy" ON public.orders;
DROP POLICY IF EXISTS "Orders Update Policy" ON public.orders;
DROP POLICY IF EXISTS "Orders Delete Policy" ON public.orders;

CREATE POLICY "Orders Select Policy"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Orders Insert Policy"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Orders Update Policy"
  ON public.orders FOR UPDATE
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Orders Delete Policy"
  ON public.orders FOR DELETE
  USING (public.is_admin() OR auth.role() = 'service_role');

-- Order Items
DROP POLICY IF EXISTS "Public Order Items Read" ON public.order_items;
DROP POLICY IF EXISTS "Public Order Items Insert" ON public.order_items;
DROP POLICY IF EXISTS "Admin Order Items Modify" ON public.order_items;
DROP POLICY IF EXISTS "Order Items Select Policy" ON public.order_items;
DROP POLICY IF EXISTS "Order Items Insert Policy" ON public.order_items;
DROP POLICY IF EXISTS "Order Items Update Policy" ON public.order_items;
DROP POLICY IF EXISTS "Order Items Delete Policy" ON public.order_items;

CREATE POLICY "Order Items Select Policy"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Order Items Insert Policy"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Order Items Update Policy"
  ON public.order_items FOR UPDATE
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Order Items Delete Policy"
  ON public.order_items FOR DELETE
  USING (public.is_admin() OR auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────────────
-- 6. STORE SETTINGS
-- ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public Store Settings Read" ON public.store_settings;
DROP POLICY IF EXISTS "Admin Store Settings Write" ON public.store_settings;
DROP POLICY IF EXISTS "Store Settings Select Policy" ON public.store_settings;
DROP POLICY IF EXISTS "Store Settings Write Policy" ON public.store_settings;

CREATE POLICY "Store Settings Select Policy"
  ON public.store_settings FOR SELECT
  USING (true);

CREATE POLICY "Store Settings Write Policy"
  ON public.store_settings FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────────────
-- 7. CATALOG: PRODUCTS, CATEGORIES, JUNCTION, TAGS, COUPONS
-- ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public Products Read" ON public.products;
DROP POLICY IF EXISTS "Admin Products Write" ON public.products;
DROP POLICY IF EXISTS "Products Select Policy" ON public.products;
DROP POLICY IF EXISTS "Products Write Policy" ON public.products;

CREATE POLICY "Products Select Policy"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Products Write Policy"
  ON public.products FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- Categories
DROP POLICY IF EXISTS "Public Categories Read" ON public.categories;
DROP POLICY IF EXISTS "Admin Categories Write" ON public.categories;
DROP POLICY IF EXISTS "Categories Select Policy" ON public.categories;
DROP POLICY IF EXISTS "Categories Write Policy" ON public.categories;

CREATE POLICY "Categories Select Policy"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Categories Write Policy"
  ON public.categories FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- Product Categories Junction
DROP POLICY IF EXISTS "Public Product Categories Read" ON public.product_categories;
DROP POLICY IF EXISTS "Admin Product Categories Write" ON public.product_categories;
DROP POLICY IF EXISTS "Product Categories Select Policy" ON public.product_categories;
DROP POLICY IF EXISTS "Product Categories Write Policy" ON public.product_categories;

CREATE POLICY "Product Categories Select Policy"
  ON public.product_categories FOR SELECT
  USING (true);

CREATE POLICY "Product Categories Write Policy"
  ON public.product_categories FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- Tags
DROP POLICY IF EXISTS "Public Tags Read" ON public.tags;
DROP POLICY IF EXISTS "Admin Tags Write" ON public.tags;
DROP POLICY IF EXISTS "Tags Select Policy" ON public.tags;
DROP POLICY IF EXISTS "Tags Write Policy" ON public.tags;

CREATE POLICY "Tags Select Policy"
  ON public.tags FOR SELECT
  USING (true);

CREATE POLICY "Tags Write Policy"
  ON public.tags FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- Coupons
DROP POLICY IF EXISTS "Public Coupons Read" ON public.coupons;
DROP POLICY IF EXISTS "Admin Coupons Write" ON public.coupons;
DROP POLICY IF EXISTS "Coupons Select Policy" ON public.coupons;
DROP POLICY IF EXISTS "Coupons Write Policy" ON public.coupons;

CREATE POLICY "Coupons Select Policy"
  ON public.coupons FOR SELECT
  USING (true);

CREATE POLICY "Coupons Write Policy"
  ON public.coupons FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────────────
-- 8. TAILORING STUDIO TABLES
-- ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public Read Tailoring Dress Types" ON public.tailoring_dress_types;
DROP POLICY IF EXISTS "Admin Modify Tailoring Dress Types" ON public.tailoring_dress_types;
DROP POLICY IF EXISTS "Admin Full Tailoring Dress Types" ON public.tailoring_dress_types;
DROP POLICY IF EXISTS "Admin Tailoring Dress Types Write" ON public.tailoring_dress_types;
DROP POLICY IF EXISTS "Tailoring Dress Types Select" ON public.tailoring_dress_types;
DROP POLICY IF EXISTS "Tailoring Dress Types Write" ON public.tailoring_dress_types;

CREATE POLICY "Tailoring Dress Types Select"
  ON public.tailoring_dress_types FOR SELECT
  USING (true);

CREATE POLICY "Tailoring Dress Types Write"
  ON public.tailoring_dress_types FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- Fabrics
DROP POLICY IF EXISTS "Public Read Tailoring Fabrics" ON public.tailoring_fabrics;
DROP POLICY IF EXISTS "Admin Modify Tailoring Fabrics" ON public.tailoring_fabrics;
DROP POLICY IF EXISTS "Admin Tailoring Fabrics Write" ON public.tailoring_fabrics;
DROP POLICY IF EXISTS "Tailoring Fabrics Select" ON public.tailoring_fabrics;
DROP POLICY IF EXISTS "Tailoring Fabrics Write" ON public.tailoring_fabrics;

CREATE POLICY "Tailoring Fabrics Select"
  ON public.tailoring_fabrics FOR SELECT
  USING (true);

CREATE POLICY "Tailoring Fabrics Write"
  ON public.tailoring_fabrics FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- Measurement Fields
DROP POLICY IF EXISTS "Public Read Tailoring Fields" ON public.tailoring_measurement_fields;
DROP POLICY IF EXISTS "Admin Modify Tailoring Fields" ON public.tailoring_measurement_fields;
DROP POLICY IF EXISTS "Admin Full Tailoring Fields" ON public.tailoring_measurement_fields;
DROP POLICY IF EXISTS "Admin Tailoring Fields Write" ON public.tailoring_measurement_fields;
DROP POLICY IF EXISTS "Tailoring Fields Select" ON public.tailoring_measurement_fields;
DROP POLICY IF EXISTS "Tailoring Fields Write" ON public.tailoring_measurement_fields;

CREATE POLICY "Tailoring Fields Select"
  ON public.tailoring_measurement_fields FOR SELECT
  USING (true);

CREATE POLICY "Tailoring Fields Write"
  ON public.tailoring_measurement_fields FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- Size Presets
DROP POLICY IF EXISTS "Public Read Tailoring Presets" ON public.tailoring_size_presets;
DROP POLICY IF EXISTS "Admin Modify Tailoring Presets" ON public.tailoring_size_presets;
DROP POLICY IF EXISTS "Admin Tailoring Presets Write" ON public.tailoring_size_presets;
DROP POLICY IF EXISTS "Tailoring Presets Select" ON public.tailoring_size_presets;
DROP POLICY IF EXISTS "Tailoring Presets Write" ON public.tailoring_size_presets;

CREATE POLICY "Tailoring Presets Select"
  ON public.tailoring_size_presets FOR SELECT
  USING (true);

CREATE POLICY "Tailoring Presets Write"
  ON public.tailoring_size_presets FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────────────
-- 9. USER WISHLIST
-- ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public Wishlist All" ON public.wishlist;
DROP POLICY IF EXISTS "Users Wishlist Operations" ON public.wishlist;
DROP POLICY IF EXISTS "Wishlist Select Policy" ON public.wishlist;
DROP POLICY IF EXISTS "Wishlist Insert Policy" ON public.wishlist;
DROP POLICY IF EXISTS "Wishlist Delete Policy" ON public.wishlist;

CREATE POLICY "Wishlist Select Policy"
  ON public.wishlist FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Wishlist Insert Policy"
  ON public.wishlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Wishlist Delete Policy"
  ON public.wishlist FOR DELETE
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────
-- 10. PRODUCT REVIEWS
-- ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Public can submit reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Public can update review likes" ON public.product_reviews;
DROP POLICY IF EXISTS "Admins can view and manage reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Admin Manage Reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Reviews Select Policy" ON public.product_reviews;
DROP POLICY IF EXISTS "Reviews Insert Policy" ON public.product_reviews;
DROP POLICY IF EXISTS "Reviews Write Policy" ON public.product_reviews;

CREATE POLICY "Reviews Select Policy"
  ON public.product_reviews FOR SELECT
  USING (is_approved = true OR public.is_admin());

CREATE POLICY "Reviews Insert Policy"
  ON public.product_reviews FOR INSERT
  WITH CHECK (is_approved = false OR public.is_admin());

CREATE POLICY "Reviews Write Policy"
  ON public.product_reviews FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ────────────────────────────────────────────────────────────────────
-- 11. INQUIRIES & NEWSLETTER & ABANDONED CARTS
-- ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can submit inquiry" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can view and manage inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admin Manage Inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Inquiries Insert Policy" ON public.inquiries;
DROP POLICY IF EXISTS "Inquiries Admin Policy" ON public.inquiries;

CREATE POLICY "Inquiries Insert Policy"
  ON public.inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Inquiries Admin Policy"
  ON public.inquiries FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Newsletter Subscribers
DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can view newsletter subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admin View Subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admin Manage Subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Newsletter Insert Policy" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Newsletter Admin Policy" ON public.newsletter_subscribers;

CREATE POLICY "Newsletter Insert Policy"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Newsletter Admin Policy"
  ON public.newsletter_subscribers FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Abandoned Carts
DROP POLICY IF EXISTS "Allow cart session management" ON public.abandoned_carts;
DROP POLICY IF EXISTS "Cart Session Select" ON public.abandoned_carts;
DROP POLICY IF EXISTS "Cart Session Insert" ON public.abandoned_carts;
DROP POLICY IF EXISTS "Cart Session Update" ON public.abandoned_carts;
DROP POLICY IF EXISTS "Cart Session Delete" ON public.abandoned_carts;
DROP POLICY IF EXISTS "Abandoned Carts Select Policy" ON public.abandoned_carts;
DROP POLICY IF EXISTS "Abandoned Carts Insert Policy" ON public.abandoned_carts;
DROP POLICY IF EXISTS "Abandoned Carts Update Policy" ON public.abandoned_carts;
DROP POLICY IF EXISTS "Abandoned Carts Delete Policy" ON public.abandoned_carts;

CREATE POLICY "Abandoned Carts Select Policy"
  ON public.abandoned_carts FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Abandoned Carts Insert Policy"
  ON public.abandoned_carts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Abandoned Carts Update Policy"
  ON public.abandoned_carts FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Abandoned Carts Delete Policy"
  ON public.abandoned_carts FOR DELETE
  USING (public.is_admin() OR auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────────────
-- 12. SECURE RPC HELPER FUNCTIONS
-- ────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_review_likes(review_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.product_reviews
  SET likes = COALESCE(likes, 0) + 1
  WHERE id = review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_order_by_code(p_order_code TEXT)
RETURNS TABLE (
  id UUID,
  order_code TEXT,
  customer_details JSONB,
  subtotal NUMERIC,
  discount NUMERIC,
  shipping NUMERIC,
  total NUMERIC,
  delivery_method TEXT,
  payment_method TEXT,
  payment_status TEXT,
  bank_transfer_details JSONB,
  status TEXT,
  created_at TIMESTAMPTZ,
  order_items JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.order_code,
    o.customer_details,
    o.subtotal,
    o.discount,
    o.shipping,
    o.total,
    o.delivery_method,
    o.payment_method,
    o.payment_status,
    COALESCE(o.bank_transfer_details, o.customer_details->'bank_transfer_details') AS bank_transfer_details,
    o.status,
    o.created_at,
    COALESCE(
      (
        SELECT jsonb_agg(jsonb_build_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'product_name', oi.product_name,
          'price', oi.price,
          'image_url', oi.image_url,
          'size', oi.size,
          'quantity', oi.quantity,
          'custom_measurements', oi.custom_measurements
        ))
        FROM public.order_items oi
        WHERE oi.order_id = o.id
      ),
      '[]'::jsonb
    ) AS order_items
  FROM public.orders o
  WHERE o.order_code = p_order_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.submit_bank_transfer_slip(
  p_order_code TEXT,
  p_slip_url TEXT,
  p_reference_number TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_customer JSONB;
  v_bank JSONB;
BEGIN
  SELECT customer_details INTO v_customer
  FROM public.orders
  WHERE order_code = p_order_code;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  v_bank := jsonb_build_object(
    'slipUrl', p_slip_url,
    'referenceNumber', p_reference_number,
    'submittedAt', NOW()
  );

  UPDATE public.orders
  SET 
    customer_details = jsonb_set(
      COALESCE(v_customer, '{}'::jsonb),
      ARRAY['bank_transfer_details'],
      v_bank,
      true
    ),
    bank_transfer_details = v_bank,
    updated_at = NOW()
  WHERE order_code = p_order_code;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────────────
-- 13. STORAGE BUCKET POLICIES
-- ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public Upload Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Order Slips" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Product Images" ON storage.objects;

CREATE POLICY "Public Upload Order Slips"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = 'order-slips'
  );

CREATE POLICY "Admin Upload Product Images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND (public.is_admin() OR auth.role() = 'service_role')
  );

CREATE POLICY "Admin Update Product Images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND (public.is_admin() OR auth.role() = 'service_role')
  );

CREATE POLICY "Admin Delete Product Images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND (public.is_admin() OR auth.role() = 'service_role')
  );
