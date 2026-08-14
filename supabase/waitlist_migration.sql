-- ============================================================
-- LISTA DE ESPERA — Acceso anticipado con referidos
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS waitlist_signups (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name      TEXT NOT NULL,
  email          TEXT NOT NULL UNIQUE,
  phone          TEXT,
  platform       TEXT CHECK (platform IN ('uber', 'indrive', 'pedidosya', 'multiple')),
  referral_code  TEXT UNIQUE,
  referred_by    TEXT REFERENCES waitlist_signups(referral_code),
  referral_count INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mismo formato RP-XXXX que ya usa el programa de referidos de conductores
-- (supabase/referrals_migration.sql), pero con su propia función/tabla —
-- esta lista de espera no depende de auth.users ni de profiles.
CREATE OR REPLACE FUNCTION generate_waitlist_referral_code()
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
    EXIT WHEN NOT EXISTS (SELECT 1 FROM waitlist_signups WHERE referral_code = code);
  END LOOP;
  RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION assign_waitlist_referral_code()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_waitlist_referral_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_waitlist_referral_code_on_insert ON waitlist_signups;
CREATE TRIGGER set_waitlist_referral_code_on_insert
  BEFORE INSERT ON waitlist_signups
  FOR EACH ROW EXECUTE FUNCTION assign_waitlist_referral_code();

-- Sube el contador de quien refirió cada vez que entra un nuevo anotado —
-- así la posición en la fila se calcula sin agregar sobre toda la tabla.
CREATE OR REPLACE FUNCTION bump_waitlist_referrer_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    UPDATE waitlist_signups
    SET referral_count = referral_count + 1
    WHERE referral_code = NEW.referred_by;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bump_referrer_count_on_insert ON waitlist_signups;
CREATE TRIGGER bump_referrer_count_on_insert
  AFTER INSERT ON waitlist_signups
  FOR EACH ROW EXECUTE FUNCTION bump_waitlist_referrer_count();

-- RLS habilitado sin políticas: nadie con la anon/authenticated key puede
-- leer ni escribir directo. Todo pasa por rutas API con el cliente admin
-- (mismo patrón que /api/verify-business y /api/verify-qr).
ALTER TABLE waitlist_signups ENABLE ROW LEVEL SECURITY;
