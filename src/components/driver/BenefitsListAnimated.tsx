"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import BenefitCard from "./BenefitCard"
import type { Benefit } from "@/types/database"

gsap.registerPlugin(useGSAP)

type BenefitWithBusiness = Benefit & {
  partner_businesses?: {
    id: string
    name: string
    logo_url: string | null
    category: string | null
    address: string | null
  } | null
}

interface Props {
  benefits: BenefitWithBusiness[]
  driverId: string
  canUse: boolean
}

export default function BenefitsListAnimated({ benefits, driverId, canUse }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".benefit-card", {
          autoAlpha: 0, y: 16, duration: 0.26, stagger: 0.05, ease: "power2.out",
        })
      })
      return () => mm.revert()
    },
    { scope: containerRef }
  )

  return (
    <div ref={containerRef} className="grid grid-cols-1 gap-4">
      {benefits.map((benefit) => (
        <div key={benefit.id} className="benefit-card">
          <BenefitCard benefit={benefit} driverId={driverId} canUse={canUse} />
        </div>
      ))}
    </div>
  )
}
