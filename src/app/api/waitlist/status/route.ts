import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { computeWaitlistPosition } from "@/lib/waitlist"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = (searchParams.get("code") ?? "").trim().toUpperCase()

  if (!code) {
    return NextResponse.json({ error: "Código requerido" }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data } = await supabase
    .from("waitlist_signups")
    .select("full_name, referral_code, referral_count, created_at")
    .eq("referral_code", code)
    .single()

  if (!data) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  }

  const position = await computeWaitlistPosition(supabase, data.referral_count, data.created_at)

  return NextResponse.json({
    full_name: data.full_name,
    referral_code: data.referral_code,
    referral_count: data.referral_count,
    position,
  })
}
