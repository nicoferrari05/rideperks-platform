export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">

      {/* Page header skeleton */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="h-8 w-40 rounded-xl mb-2" style={{ backgroundColor: "var(--line)" }} />
          <div className="h-2.5 w-28 rounded-full" style={{ backgroundColor: "var(--line)" }} />
        </div>
        <div className="h-10 w-36 rounded-xl" style={{ backgroundColor: "var(--bone-2)" }} />
      </div>

      {/* List rows skeleton */}
      <div>
        <div className="h-2.5 w-20 rounded-full mb-4" style={{ backgroundColor: "var(--line)" }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-3 py-3.5 border-b"
            style={{ borderColor: "var(--line)" }}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--bone-2)" }} />
              <div>
                <div className="h-3.5 w-36 rounded-lg mb-2" style={{ backgroundColor: "var(--line)" }} />
                <div className="h-2.5 w-52 rounded-full" style={{ backgroundColor: "var(--bone-2)" }} />
              </div>
            </div>
            <div className="h-8 w-20 rounded-xl" style={{ backgroundColor: "var(--bone-2)" }} />
          </div>
        ))}
      </div>
    </div>
  )
}
