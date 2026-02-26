-- Add receipt_url column to store AbacatePay receipt URL
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS receipt_url TEXT;
