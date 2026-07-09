import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Términos y Condiciones — RidePerks",
}

const sections: { title: string; body: string[] }[] = [
  {
    title: "1. Qué es RidePerks",
    body: [
      "RidePerks es un club de beneficios para conductores de plataformas como Uber, InDrive y PedidosYa en Panamá. A través de una membresía mensual, conectamos a conductores con negocios aliados que ofrecen descuentos y beneficios exclusivos.",
      "RidePerks no es una plataforma de transporte ni tiene relación con Uber, InDrive, PedidosYa u otras apps de movilidad. Tampoco es una entidad financiera ni procesa pagos directamente: los cobros de membresía se realizan a través de Yappy.",
    ],
  },
  {
    title: "2. Elegibilidad y registro",
    body: [
      "Para unirte a RidePerks debes ser mayor de edad y trabajar activamente como conductor de alguna plataforma de transporte o entrega en Panamá.",
      "Al registrarte, aceptas brindar información veraz (nombre, teléfono, plataforma en la que trabajas) y una foto de verificación. RidePerks revisa manualmente cada verificación antes de activar la cuenta; nos reservamos el derecho de rechazar registros con información falsa o incompleta.",
    ],
  },
  {
    title: "3. Membresía y pagos",
    body: [
      "El acceso a los beneficios requiere una membresía activa con un costo de $15.00 mensuales, pagadera a través de Yappy.",
      "La membresía se activa una vez se confirma el pago. Los beneficios y el código QR de tu cuenta solo están disponibles mientras tu membresía esté activa.",
      "Los pagos de membresía no son reembolsables una vez procesados, incluso si no llegas a usar los beneficios durante el periodo pagado.",
    ],
  },
  {
    title: "4. Beneficios de negocios aliados",
    body: [
      "Los descuentos y beneficios mostrados en la app son ofrecidos por negocios aliados independientes (por ejemplo, talleres de mantenimiento). RidePerks facilita la relación entre conductores y aliados, pero no es responsable por la calidad del producto o servicio que brinda cada negocio.",
      "Los aliados y sus beneficios pueden cambiar, pausarse o descontinuarse en cualquier momento sin previo aviso. RidePerks trabaja constantemente en sumar nuevos aliados y categorías.",
    ],
  },
  {
    title: "5. Código QR y uso indebido",
    body: [
      "El código QR de tu cuenta es personal e intransferible. Es la forma en que los negocios aliados validan que tienes una membresía activa.",
      "Compartir tu código con terceros, intentar falsificarlo o usarlo de forma fraudulenta puede resultar en la suspensión inmediata de tu cuenta, sin derecho a reembolso.",
    ],
  },
  {
    title: "6. Programa de referidos",
    body: [
      "Al invitar a otros conductores con tu código de referido, puedes acceder a recompensas (por ejemplo, un tanque de combustible) cuando esos conductores se registren y activen su membresía. Los términos exactos de cada recompensa se muestran dentro de la app.",
      "RidePerks se reserva el derecho de ajustar, pausar o descontinuar el programa de referidos en cualquier momento, así como de invalidar referidos obtenidos de forma fraudulenta.",
    ],
  },
  {
    title: "7. Suspensión de cuentas",
    body: [
      "RidePerks puede suspender o cancelar una cuenta en caso de información falsa, uso fraudulento del código QR, abuso del programa de referidos, o cualquier otra conducta que afecte la integridad de la plataforma o de nuestros aliados.",
    ],
  },
  {
    title: "8. Cambios a estos términos",
    body: [
      "Podemos actualizar estos términos ocasionalmente para reflejar cambios en el servicio. Te notificaremos los cambios importantes dentro de la app o por WhatsApp.",
    ],
  },
  {
    title: "9. Ley aplicable",
    body: [
      "Estos términos se rigen por las leyes de la República de Panamá.",
    ],
  },
  {
    title: "10. Contacto",
    body: [
      "Si tienes dudas sobre estos términos, escríbenos a soporte@rideperks.app o por WhatsApp al +507 6161-6360.",
    ],
  },
]

export default function TerminosPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bone)" }}>
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
          Términos y Condiciones
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
