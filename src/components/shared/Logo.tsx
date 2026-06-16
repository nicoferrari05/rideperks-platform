import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizes = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
}

export default function Logo({ size = "md", className }: LogoProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center font-extrabold tracking-tight select-none",
        sizes[size],
        className
      )}
      style={{
        background: "linear-gradient(155deg, rgba(245,241,234,0.97) 0%, rgba(245,241,234,0.50) 28%, rgba(205,225,250,0.84) 52%, rgba(245,241,234,0.93) 68%, rgba(245,241,234,0.46) 100%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        filter: "drop-shadow(0 1.5px 0 rgba(0,0,0,0.55)) drop-shadow(0 0 18px rgba(245,241,234,0.15))",
      }}
    >
      RIDEPERKS
    </div>
  )
}
