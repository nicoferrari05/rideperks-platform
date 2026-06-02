-- ============================================================
-- RIDEPERK — RLS fix completo
-- Pegar y ejecutar en: Supabase Dashboard > SQL Editor
-- Es seguro ejecutar múltiples veces (idempotente).
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. HABILITAR RLS EN TODAS LAS TABLAS
-- ─────────────────────────────────────────────
ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_verifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_businesses    ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefits              ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_tokens             ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_redemptions   ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- 2. BORRAR POLÍTICAS ANTIGUAS (para evitar conflictos)
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own profile"                     ON profiles;
DROP POLICY IF EXISTS "Users can update own profile"                   ON profiles;
DROP POLICY IF EXISTS "Admin can view all profiles"                    ON profiles;

DROP POLICY IF EXISTS "Driver can view own verifications"              ON driver_verifications;
DROP POLICY IF EXISTS "Driver can create verification"                 ON driver_verifications;
DROP POLICY IF EXISTS "Admin can manage verifications"                 ON driver_verifications;

DROP POLICY IF EXISTS "Authenticated users can view active businesses" ON partner_businesses;
DROP POLICY IF EXISTS "Admin can manage businesses"                    ON partner_businesses;

DROP POLICY IF EXISTS "Authenticated users can view active benefits"   ON benefits;
DROP POLICY IF EXISTS "Admin can manage benefits"                      ON benefits;

DROP POLICY IF EXISTS "Driver can view own subscription"               ON subscriptions;
DROP POLICY IF EXISTS "Admin can manage subscriptions"                 ON subscriptions;

DROP POLICY IF EXISTS "Driver can manage own qr tokens"                ON qr_tokens;

DROP POLICY IF EXISTS "Driver can view own redemptions"                ON benefit_redemptions;
DROP POLICY IF EXISTS "Admin can view all redemptions"                 ON benefit_redemptions;

-- ─────────────────────────────────────────────
-- 3. FUNCIÓN HELPER (evita recursión en chequeos de admin)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ─────────────────────────────────────────────
-- 4. POLÍTICAS: profiles
-- ─────────────────────────────────────────────
-- Conductor: solo ve y edita su propio perfil
CREATE POLICY "driver_select_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "driver_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin: acceso total
CREATE POLICY "admin_all_profiles" ON profiles
  FOR ALL USING (is_admin());

-- ─────────────────────────────────────────────
-- 5. POLÍTICAS: driver_verifications
-- ─────────────────────────────────────────────
-- Conductor: ve y crea sus propias verificaciones
CREATE POLICY "driver_select_own_verifications" ON driver_verifications
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "driver_insert_own_verification" ON driver_verifications
  FOR INSERT WITH CHECK (auth.uid() = driver_id);

-- Admin: acceso total
CREATE POLICY "admin_all_verifications" ON driver_verifications
  FOR ALL USING (is_admin());

-- ─────────────────────────────────────────────
-- 6. POLÍTICAS: partner_businesses
-- ─────────────────────────────────────────────
-- Usuarios autenticados: solo ven comercios activos (lectura)
CREATE POLICY "auth_select_active_businesses" ON partner_businesses
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);

-- Admin: acceso total
CREATE POLICY "admin_all_businesses" ON partner_businesses
  FOR ALL USING (is_admin());

-- ─────────────────────────────────────────────
-- 7. POLÍTICAS: benefits
-- ─────────────────────────────────────────────
-- Usuarios autenticados: solo ven beneficios activos (lectura)
CREATE POLICY "auth_select_active_benefits" ON benefits
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);

-- Admin: acceso total
CREATE POLICY "admin_all_benefits" ON benefits
  FOR ALL USING (is_admin());

-- ─────────────────────────────────────────────
-- 8. POLÍTICAS: subscriptions
-- ─────────────────────────────────────────────
-- Conductor: solo ve sus propias suscripciones
CREATE POLICY "driver_select_own_subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = driver_id);

-- Admin: acceso total
CREATE POLICY "admin_all_subscriptions" ON subscriptions
  FOR ALL USING (is_admin());

-- ─────────────────────────────────────────────
-- 9. POLÍTICAS: qr_tokens
-- ─────────────────────────────────────────────
-- Conductor: crea y ve sus propios tokens
CREATE POLICY "driver_select_own_qr_tokens" ON qr_tokens
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "driver_insert_own_qr_token" ON qr_tokens
  FOR INSERT WITH CHECK (auth.uid() = driver_id);

-- Admin: acceso total
CREATE POLICY "admin_all_qr_tokens" ON qr_tokens
  FOR ALL USING (is_admin());

-- Nota: el endpoint /api/verify-qr usa el cliente admin (service_role)
-- que bypasea RLS. Los UPDATE de status a "used"/"expired" van por ahí.

-- ─────────────────────────────────────────────
-- 10. POLÍTICAS: benefit_redemptions
-- ─────────────────────────────────────────────
-- Conductor: solo ve sus propias redenciones
CREATE POLICY "driver_select_own_redemptions" ON benefit_redemptions
  FOR SELECT USING (auth.uid() = driver_id);

-- Admin: acceso total
CREATE POLICY "admin_all_redemptions" ON benefit_redemptions
  FOR ALL USING (is_admin());

-- Nota: los INSERT en benefit_redemptions solo ocurren desde /api/verify-qr
-- usando el cliente admin. Los conductores nunca insertan directamente.
