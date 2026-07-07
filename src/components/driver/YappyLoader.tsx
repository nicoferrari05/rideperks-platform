"use client"

import { useEffect } from "react"

export default function YappyLoader() {
  useEffect(() => {
    if (document.querySelector("script[data-yappy-cdn]")) return
    const s = document.createElement("script")
    s.type = "module"
    s.src = "https://bt-cdn.yappy.cloud/v1/cdn/web-component-btn-yappy.js"
    s.dataset.yappyCdn = "true"
    document.head.appendChild(s)
  }, [])
  return null
}
