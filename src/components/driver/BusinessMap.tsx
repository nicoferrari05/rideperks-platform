"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

type Business = {
  id: string
  name: string
  category: string | null
  address: string | null
  latitude: number
  longitude: number
}

function createPin(initial: string) {
  return L.divIcon({
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;width:32px;">
        <div style="
          width:36px;height:36px;
          background:#E8502A;
          border-radius:50%;
          border:2.5px solid rgba(255,255,255,0.9);
          box-shadow:0 4px 16px rgba(232,80,42,0.5),0 2px 6px rgba(0,0,0,0.35);
          display:flex;align-items:center;justify-content:center;
          font-size:15px;font-weight:800;color:#fff;
          font-family:system-ui,sans-serif;
          letter-spacing:-0.02em;
        ">${initial}</div>
        <div style="
          width:0;height:0;
          border-left:6px solid transparent;
          border-right:6px solid transparent;
          border-top:8px solid #E8502A;
          margin-top:-1px;
        "></div>
      </div>
    `,
    className: "",
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -52],
  })
}

function FitBounds({ businesses }: { businesses: Business[] }) {
  const map = useMap()
  useEffect(() => {
    if (businesses.length === 0) return
    if (businesses.length === 1) {
      map.setView([businesses[0].latitude, businesses[0].longitude], 15)
      return
    }
    const bounds = L.latLngBounds(businesses.map((b) => [b.latitude, b.longitude]))
    map.fitBounds(bounds, { padding: [60, 60] })
  }, [map, businesses])
  return null
}

export default function BusinessMap({ businesses }: { businesses: Business[] }) {
  const center: [number, number] = businesses.length > 0
    ? [businesses[0].latitude, businesses[0].longitude]
    : [9.0, -79.5]

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ width: "100%", height: "100%", borderRadius: "inherit" }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <FitBounds businesses={businesses} />
      {businesses.map((b) => (
        <Marker
          key={b.id}
          position={[b.latitude, b.longitude]}
          icon={createPin(b.name.charAt(0).toUpperCase())}
        >
          <Popup
            closeButton={false}
            className="rp-popup"
          >
            <div style={{
              fontFamily: "system-ui, sans-serif",
              minWidth: "160px",
              padding: "4px 2px",
            }}>
              <p style={{
                fontWeight: 700,
                fontSize: "14px",
                color: "#0f1923",
                marginBottom: "2px",
                lineHeight: 1.3,
              }}>
                {b.name}
              </p>
              {b.category && (
                <p style={{
                  fontSize: "11px",
                  color: "#888",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                }}>
                  {b.category}
                </p>
              )}
              <a
                href={`https://waze.com/ul?ll=${b.latitude},${b.longitude}&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#E8502A",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "7px 14px",
                  borderRadius: "99px",
                  textDecoration: "none",
                  letterSpacing: "0.02em",
                }}
              >
                Abrir en Waze
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
