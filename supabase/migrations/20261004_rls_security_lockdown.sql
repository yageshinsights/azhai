-- ====================================================================
-- AZHAI CLOTHING — COMPREHENSIVE ROW LEVEL SECURITY (RLS) LOCKDOWN
-- Migration: 20261004_rls_security_lockdown.sql
-- Description:
--   1. Enables RLS on all tables including product_categories
--   2. Introduces is_admin() helper based on auth.uid() + profiles.role
--   3. Locks down profiles, addresses, orders, order_items, store_settings,
--      coupons, products, categories, tags, tailoring tables, inquiries,
--      abandoned_carts, newsletter_subscribers, and product_reviews
--   4. Creates secure RPC helpers for guest order lookup, bank slip uploads,
--      and review likes
--   5. Secures storage buckets (order-slips vs product-images)
-- ====================================================================

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

-- Ensure potentially unmigrated columns exist
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS bank_transfer_details JSONB;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS courier_partner TEXT;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;

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

-- Users can view their own profile; admins can view all profiles
CREATE POLICY "Profiles Select Policy"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Users can update their own profile (cannot alter role unless admin)
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

-- Only auth triggers / service_role can insert profiles
CREATE POLICY "Profiles Insert Policy"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────────────
-- 4. SAVED ADDRESSES TABLE
-- ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public Addresses All" ON public.addresses;
DROP POLICY IF EXISTS "Users Addresses Operations" ON public.addresses;

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

-- Logged-in customers see their own orders; admins see all
CREATE POLICY "Orders Select Policy"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Anyone (guest or patron) can place an order at checkout
CREATE POLICY "Orders Insert Policy"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- Only admins and service role can update orders directly
CREATE POLICY "Orders Update Policy"
  ON public.orders FOR UPDATE
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- Only admins can delete orders
CREATE POLICY "Orders Delete Policy"
  ON public.orders FOR DELETE
  USING (public.is_admin() OR auth.role() = 'service_role');

-- Order Items
DROP POLICY IF EXISTS "Public Order Items Read" ON public.order_items;
DROP POLICY IF EXISTS "Public Order Items Insert" ON public.order_items;
DROP POLICY IF EXISTS "Admin Order Items Modify" ON public.order_items;

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
-- 6. STORE SETTINGS (CRITICAL FINANCIAL INTEGRITY)
-- ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public Store Settings Read" ON public.store_settings;
DROP POLICY IF EXISTS "Admin Store Settings Write" ON public.store_settings;

-- Public can read store settings (branding, contacts, bank details for transfer)
CREATE POLICY "Store Settings Select Policy"
  ON public.store_settings FOR SELECT
  USING (true);

-- Only authenticated admins or service role can edit store settings or bank details
CREATE POLICY "Store Settings Write Policy"
  ON public.store_settings FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────────────
-- 7. CATALOG: PRODUCTS, CATEGORIES, JUNCTION, TAGS
-- ────────────────────────────────────────────────────────────────────
-- Products
DROP POLICY IF EXISTS "Public Products Read" ON public.products;
DROP POLICY IF EXISTS "Admin Products Write" ON public.products;

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

CREATE POLICY "Categories Select Policy"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Categories Write Policy"
  ON public.categories FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- Product Categories (Junction)
DROP POLICY IF EXISTS "Public Product Categories Read" ON public.product_categories;
DROP POLICY IF EXISTS "Admin Product Categories Write" ON public.product_categories;

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
-- Dress Types
DROP POLICY IF EXISTS "Public Read Tailoring Dress Types" ON public.tailoring_dress_types;
DROP POLICY IF EXISTS "Admin Modify Tailoring Dress Types" ON public.tailoring_dress_types;
DROP POLICY IF EXISTS "Admin Full Tailoring Dress Types" ON public.tailoring_dress_types;
DROP POLICY IF EXISTS "Admin Tailoring Dress Types Write" ON public.tailoring_dress_types;

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
-- 11. INQUIRIES & NEWSLETTER
-- ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can submit inquiry" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can view and manage inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admin Manage Inquiries" ON public.inquiries;

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

-- A. Increment Review Likes securely without giving broad UPDATE permissions
CREATE OR REPLACE FUNCTION public.increment_review_likes(review_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.product_reviews
  SET likes = COALESCE(likes, 0) + 1
  WHERE id = review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B. Safe Guest Order Lookup by exact Order Code
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
    o.bank_transfer_details,
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

-- C. Safe Bank Transfer Slip Submission
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
-- Public Read for product-images remains active
-- Secure write operations:
DROP POLICY IF EXISTS "Public Upload Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Order Slips" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Product Images" ON storage.objects;

-- Allow patrons & guests to upload bank transfer slips under 'order-slips/' prefix
CREATE POLICY "Public Upload Order Slips"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = 'order-slips'
  );

-- Admins and service role can upload any product image
CREATE POLICY "Admin Upload Product Images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND (public.is_admin() OR auth.role() = 'service_role')
  );

-- Only admins can update or delete files in product-images
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
