-- ═══════════════════════════════════════════════════════════════
-- RidePerks — Referral Program Migration
-- Run this once in the Supabase SQL editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Add referral_code column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- 2. Function to generate a short unique code (format: RP-XXXX)
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code  TEXT;
BEGIN
  LOOP
    code := 'RP-'
      || substr(chars, floor(random() * length(chars) + 1)::int, 1)
      || substr(chars, floor(random() * length(chars) + 1)::int, 1)
      || substr(chars, floor(random() * length(chars) + 1)::int, 1)
      || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    EXIT WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE referral_code = code);
  END LOOP;
  RETURN code;
END;
$$;

-- 3. Trigger — auto-assigns a code to every new profile
CREATE OR REPLACE FUNCTION assign_referral_code()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_referral_code_on_insert ON profiles;
CREATE TRIGGER set_referral_code_on_insert
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION assign_referral_code();

-- 4. Backfill existing profiles that don't have a code yet
UPDATE profiles
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL;

-- 5. Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id         UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_driver_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status              TEXT        NOT NULL DEFAULT 'active'
                                  CHECK (status IN ('active', 'rewarded')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rewarded_at         TIMESTAMPTZ,
  UNIQUE(referred_driver_id)   -- each driver can only be referred once
);

-- 6. Row Level Security for referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Conductors see only their own outgoing referrals
CREATE POLICY "Drivers see own referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id);

-- Admins have full access
CREATE POLICY "Admins manage referrals"
  ON referrals FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
