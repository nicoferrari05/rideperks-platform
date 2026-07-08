-- Add referred_by column to profiles
-- Stores the referral code of whoever invited this driver
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by TEXT REFERENCES profiles(referral_code);
