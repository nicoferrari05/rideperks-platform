-- ═══════════════════════════════════════════════════════════════
-- RidePerks — Paid Referrals Migration
-- Run this once in the Supabase SQL editor
--
-- Reverses the auto-subscription part of free_access_migration.sql:
-- new drivers still skip photo verification (status = 'verified'
-- immediately), but access is now gated behind a one-time $15 Yappy
-- payment instead of being granted for free. That payment funds the
-- referral program (see api/yappy/ipn/route.ts, which activates the
-- subscription and records the referral once Yappy confirms payment).
--
-- Existing drivers who already got free access from the previous
-- migration keep it — this only changes the flow for NEW signups.
-- ═══════════════════════════════════════════════════════════════

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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
