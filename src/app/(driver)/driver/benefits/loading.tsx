export default function BenefitsLoading() {
  return (
    <div className="space-y-5 animate-pulse">

      {/* Title skeleton */}
      <div className="pt-2">
        <div className="h-8 w-36 rounded-xl mb-2" style={{ backgroundColor: "var(--line)" }} />
        <div className="h-2.5 w-44 rounded-full" style={{ backgroundColor: "var(--line)" }} />
      </div>

      {/* Benefit card skeletons */}
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-2xl p-5"
          style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl flex-shrink-0" style={{ backgroundColor: "var(--bone-2)" }} />
            <div className="flex-1 min-w-0">
              <div className="h-3.5 w-28 rounded-lg mb-2" style={{ backgroundColor: "var(--line)" }} />
              <div className="h-2.5 w-full rounded-full mb-1.5" style={{ backgroundColor: "var(--bone-2)" }} />
              <div className="h-2.5 w-3/4 rounded-full" style={{ backgroundColor: "var(--bone-2)" }} />
              <div className="flex items-center justify-between mt-4">
                <div className="h-6 w-20 rounded-full" style={{ backgroundColor: "var(--bone-2)" }} />
                <div className="h-9 w-28 rounded-xl" style={{ backgroundColor: "var(--bone-2)" }} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
