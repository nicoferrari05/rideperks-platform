-- Add referred_by_code to profiles so the code is captured at registration
-- Run this in the Supabase SQL editor
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by_code TEXT;
