-- Add coupon_id column to events table
ALTER TABLE events ADD COLUMN coupon_id TEXT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_events_coupon_id ON events(coupon_id);
