-- Add coupon fields to payments table
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2);
