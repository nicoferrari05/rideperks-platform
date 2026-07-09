# MOBILE_GUIDELINES.md — Guía Mobile-First de RidePerks

> **Esta guía es normativa, no documentación pasiva.** Antes de cualquier cambio de UI, UX, layout, navegación, performance o componentes, hay que leerla y respetarla. Ningún cambio se considera terminado sin pasar el checklist de la sección 11. Si un cambio necesita violar una regla de aquí, se explica el porqué a Nico y se espera su OK antes de implementar.

---

## 1. Principios

1. **Mobile-first siempre.** RidePerks es una app que conductores usan desde el celular todos los días, muchas veces al sol, con una mano, entre viajes. El diseño se piensa primero para 320–430px de ancho; desktop es la adaptación, no al revés.
2. **Se comporta como app nativa, no como página web.** Instalada como PWA en el home screen debe sentirse rápida, táctil, estable: sin zooms accidentales, sin saltos de layout, sin elementos tapados por el notch o el home indicator, sin scroll horizontal jamás.
3. **La identidad visual es intocable.** Paleta (midnight/ember/bone/sol/verde en oklch, `globals.css`), tipografías (Geist, Fraunces italic, JetBrains Mono), glows, grano, radios y tono premium se mantienen. Se optimiza la técnica, nunca el look, salvo aprobación explícita de Nico.
4. **Los flujos de producción son sagrados** (sección 10). Pagos Yappy, QR, verificación y auth no se tocan en su lógica sin aprobación explícita.
5. **Estabilidad antes que novedad.** Cambio chico verificable > refactor grande. Cada cambio se deploya (git push → Vercel) y se confirma en el iPhone de Nico antes de darse por bueno.

## 2. Dispositivos y navegadores objetivo

| Objetivo | Detalle |
|---|---|
| iOS Safari | iPhone SE (375×667, sin notch) hasta iPhone Pro Max (notch/Dynamic Island) |
| Android Chrome | Compactos (~360px) hasta flagships |
| PWA standalone | Instalada desde Safari iOS y Chrome Android (`display: standalone`) |
| Desktop | Solo para el panel admin; el portal conductor debe verse bien pero se optimiza para móvil |

Anchos de prueba mínimos: **320px** (peor caso), **375px** (SE/mini), **390–430px** (moderno). Todo cambio de layout se razona en esos tres anchos.

## 3. Viewport y safe areas

- El viewport global se define **solo** en `src/app/layout.tsx` (`export const viewport`): `width: device-width`, `initialScale: 1`, `viewportFit: "cover"`, `themeColor: #0F1B3D`. **Nunca** añadir `maximumScale` ni `userScalable: false` (rompe accesibilidad).
- Con `viewportFit: cover` activo, `env(safe-area-inset-*)` funciona de verdad en iOS. Reglas:
  - **Todo elemento `position: fixed` o pantalla full-screen** debe declarar qué hace con las safe areas. Bordes inferiores: `calc(... + env(safe-area-inset-bottom, 0px))`. Bordes superiores: `env(safe-area-inset-top, 0px)`. Siempre con fallback `0px`.
  - Usar `max()` cuando hay un mínimo estético: `bottom: max(20px, calc(env(safe-area-inset-bottom, 0px) + 8px))`.
- **Alturas: nunca `100vh` / `min-h-screen` / `h-screen`.** Usar `min-h-dvh` / `h-dvh` (o `100dvh` inline). Para overlays fijos full-screen, `fixed inset-0` es correcto y preferible. `svh` solo si hace falta garantizar que algo quepa con la barra del navegador visible.
- Superficies fijas existentes y su contrato (mantener al editar):
  - `DriverNav.tsx` — nav inferior flotante: respeta `safe-area-inset-bottom/left/right`.
  - `(driver)/layout.tsx` — `<main>` con padding inferior = altura del nav + gap + `safe-area-inset-bottom`.
  - `AdminSidebar.tsx` — top bar móvil fija y drawer: respetan `safe-area-inset-top`.
  - `OnboardingSlides`, `SplashScreen`/`AppSplash`, sheet de `YappyPayButton`, `business/verify`: ya usan safe areas — no quitarlas.
- Teclado: no usamos `interactiveWidget`; el default del navegador está bien. No colocar CTAs críticos en posiciones que el teclado tape sin scroll posible.

## 4. Navegación y táctil

- **Mínimo táctil: 44×44px efectivos** en todo elemento interactivo. El tamaño *visual* puede ser menor usando el patrón de hit-area ampliada: padding extra + margen negativo equivalente (no altera el layout) o `min-h-[44px]` + centrado.
- `.pressable` (globals.css) es obligatorio en todo elemento interactivo custom: da feedback táctil (scale 0.97) y quita el tap-highlight.
- La navegación principal del conductor vive abajo (zona del pulgar). Acciones primarias de una pantalla: mitad inferior siempre que sea posible.
- Botones de icono siempre con `aria-label`.
- Los primitivos `ui/button.tsx` y `ui/input.tsx` usan alturas mobile-first (más altos en móvil, compactos en `md:`). No crear botones nuevos por fuera sin razón.
- Gestos: el carrusel de onboarding tiene swipe propio — no añadir gestos que compitan con los del navegador (back-swipe del borde izquierdo en iOS).

## 5. Tipografía

- **Piso absoluto: 10px** (solo micro-labels mono uppercase con tracking). Cuerpo legible: ≥13px. Metadatos: 11–12px.
- Escala actual del producto (mantener consistencia): micro 10–11px mono · meta 12–13px · cuerpo 13–14px · subtítulo 22px · h1 de página 28px · display (contadores) 40–52px.
- `.eyebrow` / `.eyebrow-muted` para labels de sección; no inventar variantes nuevas.
- **Inputs: ≥16px en móvil, siempre** (ver sección 6). Es la única forma de evitar el zoom-on-focus de iOS.
- Truncamiento: textos de una línea con `truncate` y contenedor flexible; nunca dejar que un texto largo empuje el layout (nombres de comercios, emails).

## 6. Formularios móviles

- **Font-size del control: 16px en móvil** (`text-base md:text-sm` o `fontSize: "16px"`). Sin excepciones — 14px causa zoom en iOS.
- Cada campo declara su teclado y autofill:

| Dato | type | inputMode | autoComplete |
|---|---|---|---|
| Email | `email` | `email` | `email` |
| Contraseña (login) | `password` | — | `current-password` |
| Contraseña (registro) | `password` | — | `new-password` |
| Nombre | `text` | — | `name` |
| Teléfono | `tel` | `tel` | `tel` |
| Código/token | `text` | `text` | `off` (+ `autoCapitalize`/`autoCorrect` según el caso) |
| Montos/números | `text` | `decimal`/`numeric` | — |

- Errores: **inline bajo el campo** (`aria-invalid` + borde + mensaje) con toast como refuerzo; nunca solo toast.
- `enterKeyHint` cuando mejora el flujo (`next`, `go`, `done`).
- Labels siempre asociados; nunca placeholder como único label.

## 7. PWA

- **Manifest**: `src/app/manifest.ts` — `display: standalone`, `orientation: portrait-primary`, `theme_color`/`background_color` = midnight `#0F1B3D`. Íconos estáticos en `public/` con `sizes` reales y `purpose` correcto (uno `maskable` con zona segura ≥20% de padding).
- **iOS**: `appleWebApp` en metadata (`capable`, `title`, `statusBarStyle`). `apple-touch-icon.png` con fondo sólido (iOS no soporta transparencia ahí). El splash nativo de iOS se omite a propósito: la app tiene su propio splash canvas (`AppSplash`/`SplashScreen`).
- **Service worker (`public/sw.js`)** — política estricta:
  - Cache-first **solo** para `/_next/static/` y fuentes.
  - **NUNCA cachear**: `/api/**`, cualquier request a Supabase, el CDN de Yappy, ni HTML de páginas autenticadas.
  - Navegación sin red → fallback a página estática `/offline`. Nada de servir páginas viejas.
  - Cambios en el SW = bump de la versión de cache. Kill-switch: deploy con versión nueva + `skipWaiting`/`clients.claim`.
- Cambios en manifest/íconos/SW se prueban **reinstalando la PWA** (borrar del home screen y volver a añadir), en iOS y Android.

## 8. Performance móvil

- **Animar solo `transform` y `opacity`.** Nunca `left/top/width/height/margin` (fuerzan layout). Barras de progreso: `scaleX` con `transform-origin`.
- **Todo GSAP dentro de `useGSAP` + `gsap.matchMedia()` con guard `prefers-reduced-motion`.** Sin excepciones.
- Efectos caros con presupuesto: `filter: blur()` grande y `backdrop-filter` solo en elementos únicos y estáticos (héroes, splash), jamás en elementos repetidos de lista ni durante scroll/animación. Recordar el bug de iOS: blur dentro de contenedor `overflow-hidden` + radio necesita `transform: translateZ(0)` en el padre.
- Librerías pesadas siempre con import dinámico (`html5-qrcode`, Leaflet ya lo hacen — es el patrón).
- Server components por defecto; `"use client"` solo con interactividad real. Datos en paralelo (`Promise.all`); cada ruta del portal con `loading.tsx` skeleton.
- Imágenes: lazy (`loading="lazy"`, `decoding="async"`) salvo above-the-fold; dimensiones fijadas para evitar CLS.

## 9. Accesibilidad móvil

- Contraste AA mínimo sobre los fondos de marca (cuidado con texto bone al 38–50% de opacidad sobre midnight en textos importantes).
- `aria-label` en todo botón de solo-icono; `aria-invalid` en campos con error.
- `prefers-reduced-motion` respetado en GSAP, CSS y View Transitions (ya configurado en globals.css — mantener).
- Focus visible (`focus-visible:ring`) en elementos interactivos; no eliminar outlines sin reemplazo.
- No bloquear zoom del navegador (regla de viewport, sección 3).

## 10. Flujos críticos que NUNCA se rompen

Regresión mínima tras cualquier cambio transversal: abrir cada flujo en device real.

| Flujo | Archivos clave | Prohibido sin OK de Nico |
|---|---|---|
| Splash + onboarding | `AppSplash`, `SplashScreen`, `OnboardingSlides`, `app/page.tsx` | Cambiar el gate de sesión/`rp_onboarded` |
| Login / registro | `(auth)/login`, `(auth)/register`, `auth/callback` | Cambiar `signInWithPassword`/`signUp` o el hard-redirect post-login |
| Verificación conductor | `driver/verify`, bucket `driver-photos` | Cambiar estados de `profiles.status` |
| Guard de rutas | `src/proxy.ts` (middleware Next 16) + gates en layouts | Tocar `proxy.ts` |
| Dashboard/hero | `dashboard/page.tsx`, `DashboardHero` | — |
| Beneficios + QR conductor | `benefits/page.tsx`, `BenefitCard.tsx` | Tocar `qr_tokens` (2 min), canal realtime `redemption-*` |
| Escáner comercio | `business/verify/page.tsx`, `api/verify-qr` | Cambiar validaciones (límites mensuales, token usado) |
| Historial / perfil / membresía | `history`, `profile` | — |
| **Pagos Yappy** | `YappyPayButton`, `YappyLoader`, `api/yappy/renew`, `api/yappy/ipn` | Tocar `eventPayment`/`eventSuccess`, el flujo del sheet, o los endpoints. La activación es manual (IPN solo loguea) — no "arreglarla" sin OK |

Nota: `api/yappy/create-order` existe pero NO está cableado a la UI (camino alterno de signup+pago). No borrar ni cablear sin decisión explícita.

## 11. Checklist de aceptación (obligatorio antes de dar por terminado)

**Layout**
- [ ] Sin scroll horizontal en 320px en las pantallas tocadas.
- [ ] Nada tapado por notch/Dynamic Island/home indicator (browser y PWA standalone).
- [ ] Sin `100vh`/`min-h-screen` nuevos (usar dvh); sin saltos al aparecer/desaparecer la barra del navegador.
- [ ] Elementos fixed nuevos declaran safe areas.

**Interacción**
- [ ] Ningún input nuevo con font-size < 16px en móvil; teclado y autoComplete correctos.
- [ ] Interactivos nuevos ≥44px efectivos, con `.pressable` y `aria-label` si son de icono.
- [ ] Estados de error visibles inline.

**Performance / animación**
- [ ] Solo transform/opacity animados; GSAP con guard reduced-motion.
- [ ] Sin blur/backdrop-filter nuevos en listas o elementos animados.
- [ ] Server component salvo necesidad real de client.

**Verificación**
- [ ] `npm run build` sin errores.
- [ ] Commit + push (Vercel deploya) y **confirmación visual de Nico en su iPhone** para cambios visuales.
- [ ] Si el cambio fue transversal (viewport, CSS global, SW, primitivos ui/): regresión rápida de los flujos de la sección 10; si tocó manifest/SW/íconos: reinstalar la PWA.

## 12. Cómo verificar

1. `npm run build` local — cero errores.
2. `git add` + `commit` + `push origin main` → Vercel deploya a producción automáticamente (regla del proyecto: nunca Vercel CLI).
3. Nico prueba en su iPhone (Safari y/o PWA). Claude no tiene browser: la confirmación visual on-device es de Nico y se pide explícitamente.
4. Para QR end-to-end hacen falta dos dispositivos (conductor muestra, comercio escanea).
5. Matriz mínima para cambios grandes: iPhone chico o simulador 320px + iPhone moderno + un Android Chrome.
