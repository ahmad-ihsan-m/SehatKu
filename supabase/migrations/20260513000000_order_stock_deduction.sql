-- ============================================================
-- Migration: Order-level Atomic Stock Deduction
-- Fixes: stock tidak berkurang saat order status → delivered
-- ============================================================

-- 1. Add stock_deducted flag to orders
--    Prevents double deduction (idempotency guard)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stock_deducted BOOLEAN NOT NULL DEFAULT false;

-- 2. Add payment_status to orders if not exists
--    (used by webhook sync, make sure column is present)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending';

-- ============================================================
-- FUNCTION: deduct_order_stock
-- Atomically deducts stock for ALL items in an order.
-- Idempotent: safe to call multiple times — second call is a no-op.
-- Anti-race-condition: locks order row + medicine rows before writing.
-- Returns: jsonb { success, error?, already_deducted? }
-- ============================================================
CREATE OR REPLACE FUNCTION public.deduct_order_stock(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stock_deducted BOOLEAN;
  v_error_msg      TEXT;
BEGIN
  -- Step 1: Lock the order row — prevents concurrent calls for the same order
  SELECT stock_deducted
  INTO   v_stock_deducted
  FROM   orders
  WHERE  id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order tidak ditemukan');
  END IF;

  -- Step 2: Idempotency guard — already processed, return early
  IF v_stock_deducted = true THEN
    RETURN jsonb_build_object('success', true, 'already_deducted', true);
  END IF;

  -- Step 3: Lock ALL medicine rows for this order in a consistent order
  --         (ORDER BY m.id prevents deadlock with concurrent orders sharing medicines)
  PERFORM 1
  FROM   order_items oi
  JOIN   medicines m ON m.id = oi.medicine_id
  WHERE  oi.order_id = p_order_id
  ORDER BY m.id
  FOR UPDATE OF m;

  -- Step 4: Validate stock for every item (medicines are now locked)
  SELECT format(
    'Stok tidak cukup untuk %s (tersedia: %s, dibutuhkan: %s)',
    m.name, m.stock::TEXT, oi.quantity::TEXT
  )
  INTO  v_error_msg
  FROM  order_items oi
  JOIN  medicines m ON m.id = oi.medicine_id
  WHERE oi.order_id = p_order_id
    AND m.stock < oi.quantity
  LIMIT 1;

  IF v_error_msg IS NOT NULL THEN
    -- Unlock happens automatically on RETURN (no explicit rollback needed here)
    RETURN jsonb_build_object('success', false, 'error', v_error_msg);
  END IF;

  -- Step 5: Atomic batch deduction for all order items
  UPDATE medicines m
  SET
    stock      = m.stock - oi.quantity,
    updated_at = now()
  FROM order_items oi
  WHERE oi.order_id = p_order_id
    AND m.id        = oi.medicine_id;

  -- Step 6: Stamp the order so this function is never applied twice
  UPDATE orders
  SET
    stock_deducted = true,
    updated_at     = now()
  WHERE id = p_order_id;

  RETURN jsonb_build_object('success', true, 'already_deducted', false);

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ============================================================
-- FUNCTION: restore_order_stock
-- Atomically restores stock for ALL items in a cancelled order.
-- Idempotent: only restores if stock_deducted = true.
-- Returns: jsonb { success, error?, restored? }
-- ============================================================
CREATE OR REPLACE FUNCTION public.restore_order_stock(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stock_deducted BOOLEAN;
BEGIN
  -- Step 1: Lock the order row
  SELECT stock_deducted
  INTO   v_stock_deducted
  FROM   orders
  WHERE  id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order tidak ditemukan');
  END IF;

  -- Step 2: Only restore if stock was actually deducted
  IF v_stock_deducted = false THEN
    RETURN jsonb_build_object('success', true, 'restored', false);
  END IF;

  -- Step 3: Add back quantities
  UPDATE medicines m
  SET
    stock      = m.stock + oi.quantity,
    updated_at = now()
  FROM order_items oi
  WHERE oi.order_id = p_order_id
    AND m.id        = oi.medicine_id;

  -- Step 4: Reset flag so deduct_order_stock can be re-applied if needed
  UPDATE orders
  SET
    stock_deducted = false,
    updated_at     = now()
  WHERE id = p_order_id;

  RETURN jsonb_build_object('success', true, 'restored', true);

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ============================================================
-- Permissions
-- ============================================================
GRANT EXECUTE ON FUNCTION public.deduct_order_stock(UUID)  TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_order_stock(UUID)  TO service_role;
GRANT EXECUTE ON FUNCTION public.restore_order_stock(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_order_stock(UUID) TO service_role;
