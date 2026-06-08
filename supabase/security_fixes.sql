-- ============================================================
-- RIDEPERK — Security fixes (aplicar en Supabase SQL Editor)
-- Idempotente: seguro ejecutar más de una vez.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- FIX 1: Revocar acceso al campo access_code para conductores
-- Un conductor logueado no puede leer access_code de ningún comercio.
-- El service_role (admin) lo sigue leyendo porque bypasea RLS.
-- ─────────────────────────────────────────────────────────────
REVOKE SELECT (access_code) ON partner_businesses FROM authenticated;

-- ─────────────────────────────────────────────────────────────
-- FIX 2: Storage — fotos de conductores solo accesibles
--         por el dueño de la foto y por el admin.
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Drivers upload own photos" ON storage.objects;
DROP POLICY IF EXISTS "Drivers view own photos"   ON storage.objects;

-- Subida: solo a la carpeta propia ({user_id}/...)
CREATE POLICY "driver_upload_own_photo" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'driver-photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Lectura: dueño de la foto o admin
CREATE POLICY "driver_select_own_photo" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'driver-photos'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );
