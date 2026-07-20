-- ============================================================
-- PORTAL DE COMERCIOS — Migración
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Vincula cada comercio a una cuenta real de Supabase Auth (dueño del portal).
-- Sigue siendo NULL para comercios que solo usan el flujo de código/PIN en /business/verify.
ALTER TABLE partner_businesses
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id);

-- El comercio ve únicamente su propia fila.
CREATE POLICY "Business owner can view own business" ON partner_businesses
  FOR SELECT USING (owner_user_id = auth.uid());

-- El comercio ve únicamente los canjes hechos en su propio negocio.
CREATE POLICY "Business owner can view own redemptions" ON benefit_redemptions
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM partner_businesses WHERE owner_user_id = auth.uid()
    )
  );
