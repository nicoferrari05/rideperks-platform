# RidePerks Platform — Guía de Setup y Deploy

## ¿Qué hace cada parte?

| URL | Qué es |
|-----|--------|
| `/` | Landing page pública |
| `/register` | Registro de conductores |
| `/login` | Login (conductores y admin) |
| `/driver/dashboard` | App del conductor |
| `/driver/benefits` | Lista de beneficios + generar QR |
| `/driver/verify` | Subir foto de verificación |
| `/driver/profile` | Perfil del conductor |
| `/admin` | Panel de administración (solo vos) |
| `/business/verify` | Portal para que los comercios escaneen QR |

---

## Paso 1 — Crear cuenta en Supabase

1. Ir a [supabase.com](https://supabase.com) y crear cuenta gratis
2. Crear un proyecto nuevo (cualquier nombre, región "South America" o "US East")
3. Esperar que el proyecto se cree (~2 minutos)

---

## Paso 2 — Configurar la base de datos

1. En el panel de Supabase, ir a **SQL Editor**
2. Copiar todo el contenido del archivo `supabase/schema.sql`
3. Pegar y ejecutar (botón **Run**)

---

## Paso 3 — Obtener las credenciales

En Supabase: **Settings → API**

Copiar:
- `Project URL` → va en `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → va en `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → va en `SUPABASE_SERVICE_ROLE_KEY`

Editar el archivo `.env.local` con esos valores.

---

## Paso 4 — Crear tu cuenta de admin

1. En Supabase: **Authentication → Users → Add user**
2. Crear usuario con tu email y contraseña
3. En **Table Editor → profiles**, encontrar tu fila
4. Cambiar el campo `role` de `driver` a `admin`
5. Cambiar el campo `status` de `pending` a `verified`

---

## Paso 5 — Correr la plataforma localmente

```bash
cd rideperk-platform
npm run dev
```

Abrir: http://localhost:3000

---

## Paso 6 — Deploy en Vercel (gratis)

1. Subir el código a GitHub
2. Ir a [vercel.com](https://vercel.com) → **New Project** → importar el repo
3. En **Environment Variables**, agregar las 3 variables de `.env.local`
4. Deploy → en ~2 minutos tenés tu plataforma en vivo

---

## Flujo de uso

### Para vos (admin):
1. `/admin/businesses` → Crear un comercio aliado con su código de acceso
2. `/admin/benefits` → Crear un beneficio asociado a ese comercio
3. `/admin/drivers` → Aprobar la verificación de un conductor
4. `/admin/subscriptions` → Activar manualmente la membresía del conductor

### Para el conductor:
1. Se registra en `/register`
2. Sube foto de verificación en `/driver/verify`
3. Vos aprobás desde el admin
4. Recibe pago (Yappy/efectivo) → vos activás su membresía desde el admin
5. Puede usar beneficios con QR desde `/driver/benefits`

### Para el comercio aliado:
1. Entra a `/business/verify`
2. Ingresa su código de acceso (el que vos le asignaste en el admin)
3. Escanea el QR del conductor con la cámara del celular
4. Ve si es válido o no → aplica el descuento

---

## Actualizar el número de WhatsApp

En los archivos del proyecto, buscar `50760000000` y reemplazar con tu número real de WhatsApp.
