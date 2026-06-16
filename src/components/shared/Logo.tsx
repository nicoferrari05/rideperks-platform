import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizes = {
  sm: "px-3 py-1.5 text-base",
  md: "px-4 py-2 text-xl",
  lg: "px-6 py-3 text-2xl",
}

export default function Logo({ size = "md", className }: LogoProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-extrabold tracking-tight select-none",
        sizes[size],
        className
      )}
      style={{
        background: "linear-gradient(135deg, rgba(245,241,234,0.11) 0%, rgba(245,241,234,0.05) 100%)",
        backdropFilter: "blur(16px) saturate(1.6)",
        WebkitBackdropFilter: "blur(16px) saturate(1.6)",
        border: "1px solid rgba(245,241,234,0.14)",
        boxShadow: "inset 0 1.5px 0 rgba(245,241,234,0.13), inset 0 -1px 0 rgba(245,241,234,0.04), 0 4px 20px rgba(0,0,0,0.28)",
        color: "var(--bone)",
      }}
    >
      RIDEPERKS
    </div>
  )
}
