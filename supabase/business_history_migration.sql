-- ============================================================
-- PORTAL DE COMERCIOS — Historial de canjes
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Permite que un comercio (role = 'business') vea el nombre de los
-- conductores que canjearon beneficios en SU propio negocio — no en
-- otros. Ya se le muestra el nombre completo al comercio durante el
-- escaneo en vivo (/business/verify), esto solo extiende esa misma
-- información hacia una vista histórica.
CREATE POLICY "Business owner can view profiles of drivers who redeemed at their business" ON profiles
  FOR SELECT USING (
    id IN (
      SELECT driver_id FROM benefit_redemptions
      WHERE business_id IN (
        SELECT id FROM partner_businesses WHERE owner_user_id = auth.uid()
      )
    )
  );
