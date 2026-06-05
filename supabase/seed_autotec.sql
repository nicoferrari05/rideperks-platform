-- ============================================================
-- AUTOTEC SERVICE — Insertar comercio y beneficios
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Comercio aliado
INSERT INTO partner_businesses (name, description, category, address, phone, access_code, is_active)
VALUES (
  'AutoTec Service',
  'Taller automotriz con más de 10 años de experiencia en diagnóstico, mantenimiento y reparación de vehículos Ford, americanos, japoneses y coreanos.',
  'Taller',
  'Parque Lefevre, vía Cincuentenario, detrás de Popeyes, al lado del Centro de Salud, Ciudad de Panamá',
  '+507 6944-0956',
  'ATSERVICERP001',
  true
);

-- 2. Beneficios (referencia el comercio por su access_code)
INSERT INTO benefits (business_id, title, description, discount_type, discount_value, savings_value, applicable_platforms, terms, is_active)
VALUES
(
  (SELECT id FROM partner_businesses WHERE access_code = 'ATSERVICERP001'),
  'Mantenimiento básico',
  'Aceite de motor 10W30 semi-sintético, filtro de aceite, mano de obra e inspección general. Precio regular $60, precio RidePerks $40.',
  'fixed',
  '$20 de descuento',
  20.00,
  ARRAY['uber','indrive','pedidosya'],
  'Válido para KIA, Hyundai, Toyota y Suzuki (sedán, motor 3-4 cilindros, año 2013-2020). Solo autos de gasolina. Precios no incluyen ITBMS.',
  true
),
(
  (SELECT id FROM partner_businesses WHERE access_code = 'ATSERVICERP001'),
  'Mantenimiento completo',
  'Aceite de motor semi-sintético, filtro de aceite, filtro de aire, filtro de cabina, mano de obra e inspección general. Precio regular $90, precio RidePerks $80.',
  'fixed',
  '$10 de descuento',
  10.00,
  ARRAY['uber','indrive','pedidosya'],
  'Válido para KIA, Hyundai, Toyota y Suzuki (sedán, motor 3-4 cilindros, año 2013-2020). Solo autos de gasolina. Precios no incluyen ITBMS.',
  true
),
(
  (SELECT id FROM partner_businesses WHERE access_code = 'ATSERVICERP001'),
  'Chapistería y pintura',
  '10% a 15% de descuento en servicios de chapistería y pintura, previa evaluación del servicio requerido.',
  'percentage',
  '10-15% de descuento',
  null,
  ARRAY['uber','indrive','pedidosya'],
  'Descuento sujeto a evaluación previa. Precios no incluyen ITBMS.',
  true
);
