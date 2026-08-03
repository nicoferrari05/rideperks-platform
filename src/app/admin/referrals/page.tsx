import { createAdminClient } from "@/lib/supabase/admin"
import { Gift } from "lucide-react"
import StaggerEntrance from "@/components/shared/StaggerEntrance"
import ReferralRewardAction from "@/components/admin/ReferralRewardAction"

const REWARD_GROUP_SIZE = 3
const REWARD_AMOUNT = 20

type ReferralRow = {
  id: string
  referrer_id: string
  status: "active" | "rewarded"
  created_at: string
  referrer: { id: string; full_name: string | null; phone: string | null; referral_code: string | null } | null
  referred: { id: string; full_name: string | null } | null
}

export default async function ReferralsAdminPage() {
  const supabase = createAdminClient()

  const { data: referrals } = await supabase
    .from("referrals")
    .select("id, referrer_id, status, created_at, referrer:profiles!referrer_id(id, full_name, phone, referral_code), referred:profiles!referred_driver_id(id, full_name)")
    .order("created_at", { ascending: true })

  const rows = (referrals ?? []) as unknown as ReferralRow[]

  const byReferrer = new Map<string, ReferralRow[]>()
  for (const r of rows) {
    const list = byReferrer.get(r.referrer_id) ?? []
    list.push(r)
    byReferrer.set(r.referrer_id, list)
  }

  const referrers = Array.from(byReferrer.entries()).map(([referrerId, refs]) => {
    const total = refs.length
    const rewarded = refs.filter((r) => r.status === "rewarded").length
    const pending = total - rewarded
    const eligibleGroups = Math.floor(pending / REWARD_GROUP_SIZE)
    return {
      referrerId,
      referrer: refs[0].referrer,
      total,
      rewarded,
      pending,
      eligibleGroups,
      owedAmount: eligibleGroups * REWARD_AMOUNT,
      referred: refs.map((r) => r.referred?.full_name).filter(Boolean) as string[],
    }
  }).sort((a, b) => b.owedAmount - a.owedAmount || b.total - a.total)

  const totalOwed = referrers.reduce((sum, r) => sum + r.owedAmount, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-bold" style={{ fontSize: "28px", letterSpacing: "-0.025em", color: "var(--midnight)" }}>
          Referidos
        </h1>
        <p className="eyebrow-muted mt-1">
          {rows.length} REFERIDOS TOTALES · ${totalOwed.toFixed(2)} PENDIENTES DE PAGO
        </p>
      </div>

      <div>
        <p className="eyebrow-muted mb-4 flex items-center gap-2">
          <Gift className="w-3.5 h-3.5" />
          CONDUCTORES CON REFERIDOS
        </p>
        {referrers.length === 0 ? (
          <p className="text-sm py-8 text-center" style={{ color: "var(--mute)" }}>
            Todavía no hay referidos confirmados. Un referido se confirma cuando el conductor invitado paga su membresía.
          </p>
        ) : (
          <StaggerEntrance selector=".list-row" stagger={0.05} y={14} duration={0.4}>
            <div>
              {referrers.map((r) => (
                <div
                  key={r.referrerId}
                  className="list-row row-interactive flex items-start justify-between gap-3 py-3.5 border-b flex-wrap"
                  style={{ borderColor: "var(--line)" }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: "var(--midnight)", color: "var(--bone)" }}
                    >
                      {r.referrer?.full_name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="font-medium text-sm" style={{ color: "var(--midnight)" }}>
                          {r.referrer?.full_name ?? "—"}
                        </p>
                        <span
                          className="font-mono-brand"
                          style={{ fontSize: "10px", color: "var(--mute)", letterSpacing: "0.06em" }}
                        >
                          {r.referrer?.referral_code}
                        </span>
                      </div>
                      <p className="font-mono-brand" style={{ fontSize: "11px", color: "var(--mute)", letterSpacing: "0.04em" }}>
                        {r.total} {r.total === 1 ? "referido" : "referidos"} · {r.rewarded} premiados
                        {r.owedAmount > 0 ? ` · $${r.owedAmount.toFixed(2)} pendiente` : ""}
                      </p>
                    </div>
                  </div>
                  <ReferralRewardAction
                    referrerId={r.referrerId}
                    eligibleGroups={r.eligibleGroups}
                    rewardAmount={REWARD_AMOUNT}
                    groupSize={REWARD_GROUP_SIZE}
                  />
                </div>
              ))}
            </div>
          </StaggerEntrance>
        )}
      </div>
    </div>
  )
}
