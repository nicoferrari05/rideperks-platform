-- ═══════════════════════════════════════════════════════════════
-- RidePerks — Revert Username Login Migration
-- Run this once in the Supabase SQL editor
--
-- Undoes username_migration.sql: drops the username column, its
-- unique index, and its format check constraint from profiles.
-- ═══════════════════════════════════════════════════════════════

DROP INDEX IF EXISTS profiles_username_unique_idx;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_format;
ALTER TABLE profiles DROP COLUMN IF EXISTS username;
