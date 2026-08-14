import type { SupabaseClient } from "@supabase/supabase-js"

export async function computeWaitlistPosition(
  supabase: SupabaseClient,
  referralCount: number,
  createdAt: string
): Promise<number> {
  const { count } = await supabase
    .from("waitlist_signups")
    .select("id", { count: "exact", head: true })
    .or(`referral_count.gt.${referralCount},and(referral_count.eq.${referralCount},created_at.lt.${createdAt})`)
  return (count ?? 0) + 1
}
