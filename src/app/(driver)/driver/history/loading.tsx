export default function HistoryLoading() {
  return (
    <div className="space-y-6 pt-2 animate-pulse">

      {/* Back + title skeleton */}
      <div>
        <div className="h-3 w-16 rounded-full mb-4" style={{ backgroundColor: "var(--ember-soft)" }} />
        <div className="h-8 w-32 rounded-xl" style={{ backgroundColor: "var(--line)" }} />
      </div>

      {/* Lifetime hero skeleton */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: "var(--midnight)", opacity: 0.85 }}>
        <div className="h-2 w-40 rounded-full mb-3" style={{ backgroundColor: "rgba(245,241,234,0.1)" }} />
        <div className="h-12 w-36 rounded-xl mb-2" style={{ backgroundColor: "rgba(245,241,234,0.12)" }} />
        <div className="h-3 w-28 rounded-full" style={{ backgroundColor: "rgba(245,241,234,0.08)" }} />
      </div>

      {/* Month group skeletons */}
      {[6, 4, 3].map((rows, gi) => (
        <div key={gi}>
          <div className="flex items-center justify-between mb-3">
            <div className="h-2.5 w-28 rounded-full" style={{ backgroundColor: "var(--line)" }} />
            <div className="h-2.5 w-14 rounded-full" style={{ backgroundColor: "var(--line)" }} />
          </div>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
          >
            {Array.from({ length: rows }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3.5"
                style={{ borderTop: i > 0 ? "1px solid var(--line)" : "none" }}
              >
                <div>
                  <div className="h-3.5 w-36 rounded-lg mb-1.5" style={{ backgroundColor: "var(--bone-2)" }} />
                  <div className="h-2.5 w-44 rounded-full" style={{ backgroundColor: "var(--line)" }} />
                </div>
                <div className="h-3.5 w-14 rounded-lg" style={{ backgroundColor: "var(--bone-2)" }} />
              </div>
            ))}
          </div>
        </div>
      ))}

    </div>
  )
}
