-- ═══════════════════════════════════════════════════════════════
-- RidePerks — Free Access (MVP) Migration
-- Run this once in the Supabase SQL editor
--
-- Goal: onboard as many drivers as possible for free during the MVP
-- phase, so there's a real driver count to show prospective partner
-- businesses. Removes the manual photo-verification approval gate —
-- drivers are verified and given active access immediately on signup.
-- ═══════════════════════════════════════════════════════════════

-- 1. New-user trigger: drivers are verified immediately and get a free
--    subscription with a far-future expiry (effectively no expiration).
--    Non-driver roles (admin/business, created directly by an admin)
--    keep the old 'pending' default untouched.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_role TEXT := COALESCE(NEW.raw_user_meta_data->>'role', 'driver');
BEGIN
  INSERT INTO profiles (id, full_name, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    new_role,
    CASE WHEN new_role = 'driver' THEN 'verified' ELSE 'pending' END
  );

  IF new_role = 'driver' THEN
    INSERT INTO subscriptions (driver_id, status, plan_name, amount, expires_at, notes)
    VALUES (NEW.id, 'active', 'mvp_free', 0, NOW() + INTERVAL '100 years', 'Acceso gratuito MVP — sin verificación manual');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Backfill: verify any existing pending drivers and grant them free
--    access too, so nobody who signed up before this migration is stuck.
UPDATE profiles
SET status = 'verified'
WHERE role = 'driver' AND status = 'pending';

INSERT INTO subscriptions (driver_id, status, plan_name, amount, expires_at, notes)
SELECT p.id, 'active', 'mvp_free', 0, NOW() + INTERVAL '100 years', 'Acceso gratuito MVP — backfill'
FROM profiles p
WHERE p.role = 'driver'
  AND NOT EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.driver_id = p.id AND s.status = 'active' AND s.expires_at > NOW()
  );
