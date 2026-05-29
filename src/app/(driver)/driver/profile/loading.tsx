export default function ProfileLoading() {
  return (
    <div className="space-y-5 pt-2 animate-pulse">

      {/* Title */}
      <div className="h-8 w-28 rounded-xl" style={{ backgroundColor: "var(--line)" }} />

      {/* Identity card */}
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex-shrink-0" style={{ backgroundColor: "var(--bone-2)" }} />
          <div className="flex-1">
            <div className="h-4 w-36 rounded-lg mb-2" style={{ backgroundColor: "var(--line)" }} />
            <div className="h-3 w-44 rounded-full mb-2.5" style={{ backgroundColor: "var(--bone-2)" }} />
            <div className="h-6 w-32 rounded-full" style={{ backgroundColor: "var(--bone-2)" }} />
          </div>
        </div>
      </div>

      {/* Info rows card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
      >
        <div className="px-5 pt-4 pb-3">
          <div className="h-2.5 w-24 rounded-full" style={{ backgroundColor: "var(--line)" }} />
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-3.5"
            style={{ borderTop: "1px solid var(--line)" }}
          >
            <div className="w-8 h-8 rounded-xl flex-shrink-0" style={{ backgroundColor: "var(--bone-2)" }} />
            <div>
              <div className="h-2 w-16 rounded-full mb-1.5" style={{ backgroundColor: "var(--line)" }} />
              <div className="h-3.5 w-28 rounded-lg" style={{ backgroundColor: "var(--bone-2)" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Membership card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
      >
        <div className="px-5 pt-4 pb-3">
          <div className="h-2.5 w-20 rounded-full" style={{ backgroundColor: "var(--line)" }} />
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderTop: "1px solid var(--line)" }}
          >
            <div className="h-3 w-24 rounded-lg" style={{ backgroundColor: "var(--bone-2)" }} />
            <div className="h-3 w-20 rounded-lg" style={{ backgroundColor: "var(--bone-2)" }} />
          </div>
        ))}
      </div>

      {/* Logout button */}
      <div className="h-12 w-full rounded-2xl" style={{ backgroundColor: "var(--bone-2)" }} />
    </div>
  )
}
