-- ══════════════════════════════════════════════════════════════
-- AZHAI BOUTIQUE: PRIVATE ORDER SLIPS STORAGE BUCKET MIGRATION
-- Migration Date: 2026-10-06
-- Purpose: Protect customer bank deposit receipts by migrating from
--          the public 'product-images' bucket to a private 'order-slips' bucket.
-- ══════════════════════════════════════════════════════════════

-- 1. Create the private 'order-slips' storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'order-slips',
  'order-slips',
  false,
  10485760, -- 10MB file limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];

-- 2. Drop any legacy/redundant policies on order slips
DROP POLICY IF EXISTS "Public Upload Order Slips" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload order slips" ON storage.objects;
DROP POLICY IF EXISTS "Admins and owners can view order slips" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update order slips" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete order slips" ON storage.objects;

-- 3. Policy: Allow customers (guest or authenticated) and admins to upload deposit slips
CREATE POLICY "Anyone can upload order slips"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'order-slips');

-- 4. Policy: Allow authenticated admins or order owners to view slips
CREATE POLICY "Admins and owners can view order slips"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'order-slips'
    AND (
      public.is_admin()
      OR auth.role() = 'service_role'
      OR (auth.uid() IS NOT NULL AND auth.uid()::text = (storage.foldername(name))[1])
    )
  );

-- 5. Policy: Allow admins to update order slips
CREATE POLICY "Admins can update order slips"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'order-slips'
    AND (public.is_admin() OR auth.role() = 'service_role')
  );

-- 6. Policy: Allow admins to delete order slips
CREATE POLICY "Admins can delete order slips"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'order-slips'
    AND (public.is_admin() OR auth.role() = 'service_role')
  );
