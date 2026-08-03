-- ============================================================
-- RIDEPERK PLATFORM — Esquema de base de datos
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- TABLA: profiles (extiende auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'driver' CHECK (role IN ('driver', 'admin', 'business')),
  full_name   TEXT NOT NULL DEFAULT '',
  phone       TEXT,
  platform    TEXT CHECK (platform IN ('uber', 'indrive', 'pedidosya', 'multiple')),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'suspended')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-crear profile al registrarse.
-- Fase MVP: los conductores quedan verificados y con acceso activo de
-- inmediato (sin foto, sin aprobación manual) — ver free_access_migration.sql.
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

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────
-- TABLA: driver_verifications
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS driver_verifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url    TEXT NOT NULL,
  platform     TEXT NOT NULL CHECK (platform IN ('uber', 'indrive', 'pedidosya')),
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes  TEXT,
  reviewed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLA: partner_businesses
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partner_businesses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  category     TEXT,
  address      TEXT,
  phone        TEXT,
  logo_url     TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  access_code  TEXT UNIQUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLA: benefits
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS benefits (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id             UUID REFERENCES partner_businesses(id) ON DELETE CASCADE,
  title                   TEXT NOT NULL,
  description             TEXT NOT NULL,
  discount_type           TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_item', 'other')),
  discount_value          TEXT,
  applicable_platforms    TEXT[] NOT NULL DEFAULT '{uber,indrive,pedidosya}',
  terms                   TEXT,
  is_active               BOOLEAN NOT NULL DEFAULT TRUE,
  usage_limit_per_driver  INTEGER,
  image_url               TEXT,
  valid_from              DATE,
  valid_until             DATE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLA: subscriptions
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  plan_name         TEXT NOT NULL DEFAULT 'monthly',
  amount            DECIMAL(10,2),
  currency          TEXT NOT NULL DEFAULT 'USD',
  starts_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at        TIMESTAMPTZ NOT NULL,
  payment_method    TEXT CHECK (payment_method IN ('yappy', 'transfer', 'cash')),
  payment_reference TEXT,
  notes             TEXT,
  created_by        UUID REFERENCES profiles(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLA: qr_tokens
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS qr_tokens (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  benefit_id       UUID NOT NULL REFERENCES benefits(id) ON DELETE CASCADE,
  token            TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired')),
  expires_at       TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  used_at          TIMESTAMPTZ,
  used_by_business UUID REFERENCES partner_businesses(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLA: benefit_redemptions
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS benefit_redemptions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  benefit_id   UUID NOT NULL REFERENCES benefits(id) ON DELETE CASCADE,
  business_id  UUID REFERENCES partner_businesses(id),
  qr_token_id  UUID REFERENCES qr_tokens(id),
  redeemed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_redemptions ENABLE ROW LEVEL SECURITY;

-- profiles: cada usuario lee/edita su propio perfil; admin lee todos
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- benefits: todos los usuarios autenticados pueden ver beneficios activos
CREATE POLICY "Authenticated users can view active benefits" ON benefits
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);

CREATE POLICY "Admin can manage benefits" ON benefits
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- subscriptions: conductor ve sus propias; admin ve todas
CREATE POLICY "Driver can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "Admin can manage subscriptions" ON subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- qr_tokens: conductor genera y ve los suyos
CREATE POLICY "Driver can manage own qr tokens" ON qr_tokens
  FOR ALL USING (auth.uid() = driver_id);

-- benefit_redemptions: conductor ve los suyos; admin ve todos
CREATE POLICY "Driver can view own redemptions" ON benefit_redemptions
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "Admin can view all redemptions" ON benefit_redemptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- partner_businesses: visible para todos autenticados
CREATE POLICY "Authenticated users can view active businesses" ON partner_businesses
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);

CREATE POLICY "Admin can manage businesses" ON partner_businesses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- driver_verifications: conductor ve las suyas; admin ve todas
CREATE POLICY "Driver can view own verifications" ON driver_verifications
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "Driver can create verification" ON driver_verifications
  FOR INSERT WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Admin can manage verifications" ON driver_verifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─────────────────────────────────────────────
-- STORAGE BUCKETS
-- ─────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES
  ('driver-photos', 'driver-photos', false),
  ('benefit-images', 'benefit-images', true),
  ('business-logos', 'business-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: conductores pueden subir sus propias fotos
CREATE POLICY "Drivers upload own photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'driver-photos' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Drivers view own photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'driver-photos' AND auth.role() = 'authenticated'
  );

-- Policy: admin puede subir logos e imágenes
CREATE POLICY "Public can view benefit images" ON storage.objects
  FOR SELECT USING (bucket_id IN ('benefit-images', 'business-logos'));

CREATE POLICY "Admin can manage images" ON storage.objects
  FOR ALL USING (
    bucket_id IN ('benefit-images', 'business-logos') AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
