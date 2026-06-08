-- ============================================================
-- RIDEPERK — Performance: índices + limpieza de tokens
-- Pegar en: Supabase Dashboard → SQL Editor → Run
-- Idempotente: seguro ejecutar más de una vez.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- P0: ÍNDICES
-- ─────────────────────────────────────────────────────────────

-- qr_tokens: cada escaneo busca por token (TEXT) y por driver_id
CREATE INDEX IF NOT EXISTS idx_qr_tokens_token     ON qr_tokens(token);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_driver_id ON qr_tokens(driver_id);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_status    ON qr_tokens(status);

-- subscriptions: consultada en cada page load del conductor (dashboard, benefits, profile)
CREATE INDEX IF NOT EXISTS idx_subscriptions_driver_id     ON subscriptions(driver_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_driver_status ON subscriptions(driver_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at    ON subscriptions(expires_at);

-- benefit_redemptions: crece con cada escaneo; filtrada por driver y por mes
CREATE INDEX IF NOT EXISTS idx_redemptions_driver_id      ON benefit_redemptions(driver_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_driver_benefit ON benefit_redemptions(driver_id, benefit_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_redeemed_at    ON benefit_redemptions(redeemed_at);

-- partner_businesses: buscada por access_code en cada escaneo QR
CREATE INDEX IF NOT EXISTS idx_businesses_access_code ON partner_businesses(access_code);
CREATE INDEX IF NOT EXISTS idx_businesses_is_active   ON partner_businesses(is_active);

-- profiles: filtrada por role en el admin dashboard
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- driver_verifications: listada por status (pendientes) y por driver
CREATE INDEX IF NOT EXISTS idx_verifications_driver_id ON driver_verifications(driver_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status    ON driver_verifications(status);

-- ─────────────────────────────────────────────────────────────
-- P1: LIMPIEZA AUTOMÁTICA DE TOKENS EXPIRADOS
-- ─────────────────────────────────────────────────────────────

-- Función que elimina tokens usados o expirados con más de 24 horas
CREATE OR REPLACE FUNCTION cleanup_expired_qr_tokens()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM qr_tokens
  WHERE status IN ('expired', 'used')
    AND created_at < NOW() - INTERVAL '24 hours';
$$;

-- ── Activar el cron en Supabase Dashboard ──────────────────────
-- Ir a: Database → Extensions → habilitar "pg_cron" (si no está activo)
-- Luego ejecutar:
SELECT cron.schedule(
  'cleanup-expired-qr-tokens',   -- nombre del job
  '0 3 * * *',                   -- todos los días a las 3am UTC
  'SELECT cleanup_expired_qr_tokens()'
);

-- Para verificar que quedó registrado:
-- SELECT * FROM cron.job;

-- Para eliminar el job si necesitas recrearlo:
-- SELECT cron.unschedule('cleanup-expired-qr-tokens');
