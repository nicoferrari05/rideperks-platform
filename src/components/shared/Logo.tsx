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
      style={{ backgroundColor: "var(--midnight)", color: "var(--bone)" }}
    >
      RIDEPERKS
    </div>
  )
}
