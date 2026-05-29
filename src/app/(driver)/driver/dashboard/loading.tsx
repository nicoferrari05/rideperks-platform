export default function DashboardLoading() {
  return (
    <div className="space-y-5 animate-pulse">

      {/* Greeting skeleton */}
      <div className="pt-2">
        <div className="h-3 w-36 rounded-full mb-2" style={{ backgroundColor: "var(--line)" }} />
        <div className="h-8 w-44 rounded-xl" style={{ backgroundColor: "var(--line)" }} />
      </div>

      {/* Hero card skeleton */}
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: "var(--midnight)", opacity: 0.85 }}
      >
        <div className="h-2.5 w-40 rounded-full mb-4" style={{ backgroundColor: "rgba(245,241,234,0.12)" }} />
        <div className="h-12 w-32 rounded-xl mb-2" style={{ backgroundColor: "rgba(245,241,234,0.1)" }} />
        <div className="h-3 w-48 rounded-full" style={{ backgroundColor: "rgba(245,241,234,0.08)" }} />
        <div className="flex items-end justify-between mt-6">
          <div>
            <div className="h-2 w-28 rounded-full mb-2" style={{ backgroundColor: "rgba(245,241,234,0.08)" }} />
            <div className="h-3 w-20 rounded-full" style={{ backgroundColor: "rgba(245,241,234,0.1)" }} />
          </div>
          <div className="h-11 w-36 rounded-full" style={{ backgroundColor: "rgba(245,241,234,0.1)" }} />
        </div>
      </div>

      {/* Recent rows skeleton */}
      <div>
        <div className="h-2.5 w-24 rounded-full mb-3" style={{ backgroundColor: "var(--line)" }} />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between py-3 border-b"
            style={{ borderColor: "var(--line)" }}
          >
            <div>
              <div className="h-3.5 w-32 rounded-lg mb-1.5" style={{ backgroundColor: "var(--bone-2)" }} />
              <div className="h-2.5 w-44 rounded-full" style={{ backgroundColor: "var(--line)" }} />
            </div>
            <div className="h-3.5 w-14 rounded-lg" style={{ backgroundColor: "var(--bone-2)" }} />
          </div>
        ))}
      </div>
    </div>
  )
}
