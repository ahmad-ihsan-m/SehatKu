-- Atomic Stock Management Functions
-- Ensures safe stock updates without race conditions

-- 1. Clear existing functions to allow parameter name changes
DROP FUNCTION IF EXISTS public.increment_stock(UUID, INT);
DROP FUNCTION IF EXISTS public.decrement_stock(UUID, INT);

-- 2. Increment Stock (for cancellations/expiry)
CREATE OR REPLACE FUNCTION public.increment_stock(medicine_id UUID, amount INT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.medicines
  SET stock = stock + amount
  WHERE id = medicine_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Decrement Stock (for checkout)
-- Returns true if successful, false if insufficient stock
CREATE OR REPLACE FUNCTION public.decrement_stock(medicine_id UUID, amount INT)
RETURNS BOOLEAN AS $$
DECLARE
  current_stock INT;
BEGIN
  SELECT stock INTO current_stock FROM public.medicines WHERE id = medicine_id FOR UPDATE;
  
  IF current_stock >= amount THEN
    UPDATE public.medicines
    SET stock = stock - amount
    WHERE id = medicine_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;
