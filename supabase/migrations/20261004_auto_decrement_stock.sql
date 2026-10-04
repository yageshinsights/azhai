-- ====================================================================
-- AZHAI CLOTHING — AUTOMATIC INVENTORY STOCK DECREMENTATION
-- Migration: 20261004_auto_decrement_stock.sql
-- Description:
--   1. Automatically decrements products.stock_quantity when order_items
--      are inserted during checkout.
--   2. Runs as SECURITY DEFINER so anonymous customers can checkout
--      without needing direct UPDATE permissions on the products table.
--   3. Guarantees stock never drops below 0 using GREATEST(0, ...).
--   4. Provides a standalone atomic RPC helper decrement_product_stock().
-- ====================================================================

-- ────────────────────────────────────────────────────────────────────
-- 1. TRIGGER FUNCTION: DECREMENT STOCK ON ORDER ITEM INSERT
-- ────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.decrement_stock_on_order_item()
RETURNS TRIGGER AS $$
BEGIN
  -- Only ready-to-wear products with a valid product_id deduct stock
  IF NEW.product_id IS NOT NULL AND NEW.quantity > 0 THEN
    UPDATE public.products
    SET 
      stock_quantity = GREATEST(0, COALESCE(stock_quantity, 15) - NEW.quantity)
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it already exists to ensure idempotency
DROP TRIGGER IF EXISTS trg_decrement_stock_on_order ON public.order_items;

-- Attach trigger to order_items table
CREATE TRIGGER trg_decrement_stock_on_order
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_stock_on_order_item();

-- ────────────────────────────────────────────────────────────────────
-- 2. STANDALONE SECURE RPC HELPER FOR ATOMIC STOCK DEDUCTION
-- ────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.decrement_product_stock(
  p_product_id INT,
  p_quantity INT DEFAULT 1
)
RETURNS INT AS $$
DECLARE
  v_new_stock INT;
BEGIN
  IF p_product_id IS NULL OR p_quantity <= 0 THEN
    RETURN NULL;
  END IF;

  UPDATE public.products
  SET stock_quantity = GREATEST(0, COALESCE(stock_quantity, 15) - p_quantity)
  WHERE id = p_product_id
  RETURNING stock_quantity INTO v_new_stock;

  RETURN v_new_stock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────────────
-- 3. OPTIONAL TRIGGER FUNCTION: RESTORE STOCK IF ORDER IS CANCELLED
-- ────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.restore_stock_on_order_cancel()
RETURNS TRIGGER AS $$
BEGIN
  -- If order status transitioned to 'cancelled', restore stock for its items
  IF NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled') THEN
    UPDATE public.products p
    SET stock_quantity = COALESCE(p.stock_quantity, 0) + sub.total_qty
    FROM (
      SELECT product_id, SUM(quantity)::INT AS total_qty
      FROM public.order_items
      WHERE order_id = NEW.id
        AND product_id IS NOT NULL
        AND quantity > 0
      GROUP BY product_id
    ) sub
    WHERE p.id = sub.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_restore_stock_on_order_cancel ON public.orders;

CREATE TRIGGER trg_restore_stock_on_order_cancel
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.restore_stock_on_order_cancel();
