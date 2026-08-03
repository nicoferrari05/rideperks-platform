-- ═══════════════════════════════════════════════════════════════
-- RidePerks — Username Login Migration
-- Run this once in the Supabase SQL editor
--
-- Adds an optional username to profiles so drivers can register and
-- log in with a username instead of (or in addition to) their email.
-- Email stays required at signup — this only adds an alternate
-- identifier. Case-insensitive uniqueness via a lower(username) index.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;

ALTER TABLE profiles ADD CONSTRAINT profiles_username_format
  CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_]{3,20}$');

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique_idx
  ON profiles (lower(username)) WHERE username IS NOT NULL;
