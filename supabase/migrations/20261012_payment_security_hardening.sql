-- ====================================================================
-- AZHAI CLOTHING — PAYHERE & PAYMENT SECURITY HARDENING
-- Migration: 20261012_payment_security_hardening.sql
-- Description:
--   1. Locks down Orders Insert RLS Policy so clients cannot insert
--      orders with payment_status = 'paid' or 'refunded'
--   2. Creates locked-down payment_gateway_secrets table & cryptographic
--      worker_update_payhere_order() RPC to verify PayHere IPN checksums
--      and order amounts server-side even without service_role key
--   3. Upgrades get_order_by_code() to return admin_notes for real-time
--      checkout status verification on OrderSuccess
--   4. Hardens submit_bank_transfer_slip() to preserve bank account
--      metadata and block overwrites on already-paid orders
-- ====================================================================

-- ────────────────────────────────────────────────────────────────────
-- 1. LOCK DOWN ORDERS INSERT RLS POLICY
-- ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Orders Insert Policy" ON public.orders;

CREATE POLICY "Orders Insert Policy"
  ON public.orders FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR auth.role() = 'service_role'
    OR (
      payment_status IN ('pending_card', 'pending_cod', 'pending_bank')
      AND status = 'pending'
      AND total >= 0
      AND subtotal >= 0
      AND COALESCE(discount, 0) >= 0
      AND COALESCE(shipping, 0) >= 0
    )
  );

-- ────────────────────────────────────────────────────────────────────
-- 2. PRIVATE GATEWAY SECRET VAULT & CRYPTOGRAPHIC IPN VERIFIER RPC
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payment_gateway_secrets (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  merchant_id TEXT,
  merchant_secret_md5 TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_gateway_secrets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gateway Secrets Admin Only" ON public.payment_gateway_secrets;
CREATE POLICY "Gateway Secrets Admin Only"
  ON public.payment_gateway_secrets FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- Cryptographically verified PayHere IPN Order Updater
CREATE OR REPLACE FUNCTION public.worker_update_payhere_order(
  p_order_code TEXT,
  p_merchant_id TEXT,
  p_payment_id TEXT,
  p_payhere_amount TEXT,
  p_payhere_currency TEXT,
  p_status_code TEXT,
  p_md5sig TEXT,
  p_hashed_secret TEXT,
  p_method TEXT DEFAULT 'Card',
  p_status_message TEXT DEFAULT '',
  p_card_no TEXT DEFAULT ''
)
RETURNS JSONB AS $$
DECLARE
  v_stored_secret TEXT;
  v_computed_sig TEXT;
  v_order RECORD;
  v_paid_numeric NUMERIC;
  v_status_int INT;
  v_note TEXT;
  v_already_paid BOOLEAN := FALSE;
BEGIN
  IF COALESCE(TRIM(p_hashed_secret), '') = '' OR COALESCE(TRIM(p_md5sig), '') = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Missing cryptographic signature parameters');
  END IF;

  -- 1. Check or bind hashed merchant secret in vault
  SELECT merchant_secret_md5 INTO v_stored_secret
  FROM public.payment_gateway_secrets
  WHERE id = 1;

  IF v_stored_secret IS NULL THEN
    INSERT INTO public.payment_gateway_secrets (id, merchant_id, merchant_secret_md5, updated_at)
    VALUES (1, p_merchant_id, UPPER(TRIM(p_hashed_secret)), NOW())
    ON CONFLICT (id) DO NOTHING;
    v_stored_secret := UPPER(TRIM(p_hashed_secret));
  ELSIF v_stored_secret <> UPPER(TRIM(p_hashed_secret)) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid merchant secret hash');
  END IF;

  -- 2. Recompute PayHere MD5 checksum inside PostgreSQL:
  --    UPPER(MD5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + UPPER(MD5(merchant_secret))))
  v_computed_sig := UPPER(
    MD5(
      COALESCE(p_merchant_id, '') ||
      COALESCE(p_order_code, '') ||
      COALESCE(p_payhere_amount, '') ||
      COALESCE(p_payhere_currency, '') ||
      COALESCE(p_status_code, '') ||
      v_stored_secret
    )
  );

  IF v_computed_sig <> UPPER(TRIM(p_md5sig)) THEN
    RETURN jsonb_build_object('success', false, 'error', 'MD5 signature verification failed');
  END IF;

  -- 3. Fetch target order
  SELECT * INTO v_order
  FROM public.orders
  WHERE order_code = p_order_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  v_already_paid := (v_order.payment_status = 'paid');
  v_status_int := COALESCE(NULLIF(REGEXP_REPLACE(p_status_code, '[^0-9-]', '', 'g'), '')::INT, -99);
  v_paid_numeric := COALESCE(NULLIF(REGEXP_REPLACE(p_payhere_amount, '[^0-9.]', '', 'g'), '')::NUMERIC, 0);

  -- 4. Process PayHere status codes (2 = success, 0 = pending, -1 = canceled, -2 = failed, -3 = chargedback)
  IF v_status_int = 2 THEN
    -- Strict currency and amount verification against database order total
    IF UPPER(TRIM(p_payhere_currency)) <> 'LKR' OR (v_paid_numeric + 0.01) < v_order.total THEN
      v_note := FORMAT(
        'SECURITY ALERT: PayHere amount/currency mismatch! Paid %s %s vs Order Total LKR %s (Payment ID: %s, Method: %s)',
        p_payhere_currency, p_payhere_amount, v_order.total, COALESCE(p_payment_id, 'N/A'), COALESCE(p_method, 'N/A')
      );
      UPDATE public.orders
      SET admin_notes = v_note,
          updated_at = NOW()
      WHERE id = v_order.id;

      RETURN jsonb_build_object(
        'success', false,
        'error', 'Payment amount or currency mismatch',
        'expected_total', v_order.total,
        'paid_amount', v_paid_numeric
      );
    END IF;

    v_note := FORMAT(
      'Paid via PayHere (Payment ID: %s, Method: %s%s)',
      COALESCE(p_payment_id, 'N/A'),
      COALESCE(p_method, 'Card'),
      CASE WHEN COALESCE(p_card_no, '') <> '' THEN ', Card: ' || p_card_no ELSE '' END
    );

    UPDATE public.orders
    SET payment_status = 'paid',
        status = CASE WHEN status = 'pending' THEN 'confirmed' ELSE status END,
        admin_notes = v_note,
        updated_at = NOW()
    WHERE id = v_order.id;

    RETURN jsonb_build_object(
      'success', true,
      'payment_status', 'paid',
      'already_paid', v_already_paid,
      'order_id', v_order.order_code,
      'total', v_order.total,
      'customer_details', v_order.customer_details,
      'delivery_method', v_order.delivery_method,
      'payment_method', v_order.payment_method
    );

  ELSIF v_status_int = 0 THEN
    UPDATE public.orders
    SET payment_status = CASE WHEN payment_status = 'paid' THEN 'paid' ELSE 'pending_card' END,
        admin_notes = FORMAT('PayHere Payment Pending (Payment ID: %s)', COALESCE(p_payment_id, 'N/A')),
        updated_at = NOW()
    WHERE id = v_order.id;

    RETURN jsonb_build_object('success', true, 'payment_status', 'pending_card');

  ELSIF v_status_int IN (-1, -2) THEN
    IF NOT v_already_paid THEN
      UPDATE public.orders
      SET payment_status = 'pending_card',
          admin_notes = FORMAT(
            'PayHere Payment Failed/Cancelled (%s): %s (Payment ID: %s)',
            p_status_code,
            COALESCE(p_status_message, 'Declined'),
            COALESCE(p_payment_id, 'N/A')
          ),
          updated_at = NOW()
      WHERE id = v_order.id;
    END IF;

    RETURN jsonb_build_object('success', true, 'payment_status', 'failed');

  ELSIF v_status_int = -3 THEN
    UPDATE public.orders
    SET payment_status = 'refunded',
        admin_notes = FORMAT('PayHere Chargeback (Payment ID: %s)', COALESCE(p_payment_id, 'N/A')),
        updated_at = NOW()
    WHERE id = v_order.id;

    RETURN jsonb_build_object('success', true, 'payment_status', 'refunded');
  END IF;

  RETURN jsonb_build_object('success', false, 'error', 'Unhandled status code');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────────────
-- 3. UPGRADE get_order_by_code TO INCLUDE admin_notes FOR STATUS CHECKS
-- ────────────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.get_order_by_code(TEXT);

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
  admin_notes TEXT,
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
    o.admin_notes,
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

-- ────────────────────────────────────────────────────────────────────
-- 4. HARDEN submit_bank_transfer_slip TO MERGE DETAILS & BLOCK OVERWRITE
-- ────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.submit_bank_transfer_slip(
  p_order_code TEXT,
  p_slip_url TEXT,
  p_reference_number TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_customer JSONB;
  v_existing_bank JSONB;
  v_payment_status TEXT;
  v_merged_bank JSONB;
BEGIN
  SELECT customer_details, bank_transfer_details, payment_status
  INTO v_customer, v_existing_bank, v_payment_status
  FROM public.orders
  WHERE order_code = p_order_code;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Prevent overwriting bank slip once payment has been verified and marked paid
  IF v_payment_status = 'paid' THEN
    RETURN FALSE;
  END IF;

  v_merged_bank := COALESCE(v_existing_bank, v_customer->'bank_transfer_details', '{}'::jsonb) || jsonb_build_object(
    'slipUrl', p_slip_url,
    'referenceNumber', COALESCE(NULLIF(TRIM(p_reference_number), ''), (v_existing_bank->>'referenceNumber'), (v_customer->'bank_transfer_details'->>'referenceNumber')),
    'submittedAt', NOW()
  );

  UPDATE public.orders
  SET 
    customer_details = jsonb_set(
      COALESCE(v_customer, '{}'::jsonb),
      ARRAY['bank_transfer_details'],
      v_merged_bank,
      true
    ),
    bank_transfer_details = v_merged_bank,
    updated_at = NOW()
  WHERE order_code = p_order_code;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
