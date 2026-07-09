import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Política de Privacidad — RidePerks",
}

const sections: { title: string; body: string[] }[] = [
  {
    title: "1. Qué datos recopilamos",
    body: [
      "Para operar tu cuenta de RidePerks recopilamos: nombre completo, teléfono, correo electrónico, la plataforma en la que trabajas (Uber, InDrive, PedidosYa u otra), una foto de verificación, y el historial de tu membresía y uso de beneficios (qué código QR se escaneó, en qué negocio y cuándo).",
      "No almacenamos datos de tarjetas de crédito ni cuentas bancarias. Los pagos se procesan directamente por Yappy; nosotros solo recibimos la confirmación de que un pago fue realizado.",
    ],
  },
  {
    title: "2. Para qué usamos tus datos",
    body: [
      "Usamos tu información para: verificar que eres un conductor activo, activar y administrar tu membresía, generar tu código QR personal, mostrarte los beneficios disponibles, contactarte por soporte o novedades importantes, y prevenir fraude o uso indebido de la plataforma.",
    ],
  },
  {
    title: "3. Con quién compartimos tus datos",
    body: [
      "No vendemos tu información a terceros.",
      "Compartimos datos mínimos con Yappy únicamente para procesar el cobro de tu membresía (por ejemplo, tu número de teléfono asociado a Yappy).",
      "Los negocios aliados que escanean tu código QR solo ven que tu membresía está activa y a qué beneficio corresponde; no tienen acceso a tu foto de verificación, correo ni demás datos de tu perfil.",
    ],
  },
  {
    title: "4. Cómo protegemos tu información",
    body: [
      "Tus datos se almacenan en Supabase, con acceso restringido y cifrado en tránsito y en reposo. Las fotos de verificación se guardan en un almacenamiento privado, accesible únicamente por el equipo de RidePerks para fines de verificación.",
    ],
  },
  {
    title: "5. Cuánto tiempo conservamos tus datos",
    body: [
      "Conservamos tu información mientras tu cuenta permanezca activa. Si deseas eliminar tu cuenta y tus datos, puedes solicitarlo escribiéndonos a soporte@rideperks.app.",
    ],
  },
  {
    title: "6. Tus derechos",
    body: [
      "Puedes solicitar acceder, corregir o eliminar tus datos personales en cualquier momento, de acuerdo con la Ley 81 de 2019 sobre Protección de Datos Personales de Panamá. Para ejercer estos derechos, escríbenos a soporte@rideperks.app.",
    ],
  },
  {
    title: "7. Menores de edad",
    body: [
      "RidePerks está dirigido a conductores mayores de edad. No recopilamos intencionalmente información de menores de edad.",
    ],
  },
  {
    title: "8. Cambios a esta política",
    body: [
      "Podemos actualizar esta política ocasionalmente. Si los cambios son importantes, te avisaremos dentro de la app o por WhatsApp.",
    ],
  },
  {
    title: "9. Contacto",
    body: [
      "Si tienes preguntas sobre el manejo de tus datos, escríbenos a soporte@rideperks.app o por WhatsApp al +507 6161-6360.",
    ],
  },
]

export default function PrivacidadPage() {
  return (
    <div className="min-h-dvh" style={{ backgroundColor: "var(--bone)" }}>
      <div className="max-w-2xl mx-auto px-5 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-8"
          style={{ color: "var(--mute)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>

        <h1
          className="font-bold mb-1"
          style={{ fontSize: "28px", letterSpacing: "-0.025em", color: "var(--midnight)" }}
        >
          Política de Privacidad
        </h1>
        <p className="text-sm mb-10" style={{ color: "var(--mute)" }}>
          Última actualización: 9 de julio de 2026
        </p>

        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2
                className="font-semibold mb-2"
                style={{ fontSize: "16px", color: "var(--midnight)", letterSpacing: "-0.01em" }}
              >
                {s.title}
              </h2>
              {s.body.map((p, i) => (
                <p
                  key={i}
                  className="text-sm mb-2 last:mb-0"
                  style={{ color: "var(--mute)", lineHeight: 1.7, maxWidth: "68ch" }}
                >
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
