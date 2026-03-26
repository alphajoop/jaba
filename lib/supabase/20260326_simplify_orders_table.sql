-- Simplify and optimize orders table for DexPay integration
-- Remove unused fields and keep only essential ones

-- First, add the essential DexPay fields if they don't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS transaction_id TEXT,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS failed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- Remove redundant/unused fields
ALTER TABLE orders 
DROP COLUMN IF EXISTS external_transaction_id,
DROP COLUMN IF EXISTS fee_amount,
DROP COLUMN IF EXISTS net_amount,
DROP COLUMN IF EXISTS refund_amount,
DROP COLUMN IF EXISTS refund_reason,
DROP COLUMN IF EXISTS refunded_at,
DROP COLUMN IF EXISTS failure_reason,
DROP COLUMN IF EXISTS dexpay_session_id;

-- Update status check constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending','processing','paid','failed','cancelled','refunded'));
