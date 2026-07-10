// Offline fallback served by the service worker when a navigation fails.
// Fully self-contained (inline styles only) so it renders correctly even
// if no CSS or JS is cached.
export const metadata = {
  title: "Sin conexión — RidePerks",
}

export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "32px 24px",
        backgroundColor: "#0F1B3D",
        color: "#F5F1EA",
      }}
    >
      <p
        style={{
          fontWeight: 800,
          fontSize: "16px",
          letterSpacing: "-0.02em",
          marginBottom: "40px",
        }}
      >
        RIDEPERKS
      </p>
      <h1 style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "-0.025em", marginBottom: "12px" }}>
        Sin conexión
      </h1>
      <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(245,241,234,0.55)", maxWidth: "300px", marginBottom: "32px" }}>
        RidePerks necesita internet para mostrar tus beneficios. Revisa tu señal e intenta de nuevo.
      </p>
      <a
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "48px",
          padding: "0 28px",
          borderRadius: "14px",
          backgroundColor: "#E8502A",
          color: "#fff",
          fontWeight: 600,
          fontSize: "15px",
          textDecoration: "none",
        }}
      >
        Reintentar
      </a>
    </div>
  )
}
