import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizes = {
  sm: { pill: "px-3 py-1.5 gap-1.5 text-sm", icon: 14 },
  md: { pill: "px-4 py-2 gap-2 text-base", icon: 16 },
  lg: { pill: "px-6 py-3 gap-3 text-xl", icon: 20 },
}

export default function Logo({ size = "md", className }: LogoProps) {
  const s = sizes[size]
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-extrabold tracking-tight select-none",
        s.pill,
        className
      )}
      style={{ backgroundColor: "var(--midnight)", color: "var(--bone)" }}
    >
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 22 22"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="10" stroke="var(--ember)" strokeWidth="1.5" />
        <path
          d="M6.5 11.5 L10 14 L15.5 8"
          stroke="var(--ember)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        <span style={{ color: "var(--bone)" }}>RIDE</span>
        <span style={{ color: "var(--ember)" }}>PERKS</span>
      </span>
    </div>
  )
}
