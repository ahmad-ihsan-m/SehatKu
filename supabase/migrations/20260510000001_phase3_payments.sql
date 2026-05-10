-- Phase 3: Payment & Order Transaction System

-- 1. Create Payment Status Enum
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_type 
        WHERE typname = 'payment_status'
    ) THEN
        CREATE TYPE payment_status AS ENUM (
            'pending',
            'paid',
            'failed',
            'expired',
            'refunded'
        );
    END IF;
END $$;

-- 2. Update payments table
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS transaction_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS snap_token TEXT,
ADD COLUMN IF NOT EXISTS snap_redirect_url TEXT,
ADD COLUMN IF NOT EXISTS payment_type TEXT,
ADD COLUMN IF NOT EXISTS fraud_status TEXT,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS expired_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 3. Convert payment status to enum
ALTER TABLE public.payments
ALTER COLUMN status TYPE payment_status
USING status::payment_status;

-- 4. Add indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id 
ON public.payments(order_id);

CREATE INDEX IF NOT EXISTS idx_payments_transaction_id 
ON public.payments(transaction_id);

CREATE INDEX IF NOT EXISTS idx_payments_status 
ON public.payments(status);

-- 5. Add payment_status to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'pending';

-- 6. Payment RLS Policy
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;

CREATE POLICY "Users can view own payments" 
ON public.payments 
FOR SELECT 
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- 7. Safe stock increment RPC
CREATE OR REPLACE FUNCTION increment_stock(
    row_id UUID,
    inc_val INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.medicines
  SET stock = stock + inc_val
  WHERE id = row_id;
END;
$$;
