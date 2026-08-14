import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { computeWaitlistPosition } from "@/lib/waitlist"

export async function POST(request: Request) {
  const body = await request.json()
  const full_name = (body.full_name ?? "").trim()
  const email = (body.email ?? "").trim().toLowerCase()
  const phone = (body.phone ?? "").trim() || null
  const platform = body.platform || null
  const ref = (body.ref ?? "").trim().toUpperCase() || null

  if (!full_name || !email) {
    return NextResponse.json({ error: "Nombre y email son requeridos" }, { status: 400 })
  }

  const supabase = createAdminClient()

  let { data: record, error } = await supabase
    .from("waitlist_signups")
    .insert({ full_name, email, phone, platform, referred_by: ref })
    .select("full_name, referral_code, referral_count, created_at")
    .single()

  // Código de referido inválido/typo: reintenta sin él en vez de bloquear el registro.
  if (error?.code === "23503" && ref) {
    ;({ data: record, error } = await supabase
      .from("waitlist_signups")
      .insert({ full_name, email, phone, platform })
      .select("full_name, referral_code, referral_count, created_at")
      .single())
  }

  // Email ya registrado: devuelve su estado actual en vez de un error.
  if (error?.code === "23505") {
    const { data: existing } = await supabase
      .from("waitlist_signups")
      .select("full_name, referral_code, referral_count, created_at")
      .eq("email", email)
      .single()
    if (existing) record = existing
  }

  if (!record) {
    return NextResponse.json({ error: "Error al procesar tu registro" }, { status: 500 })
  }

  const position = await computeWaitlistPosition(supabase, record.referral_count, record.created_at)

  return NextResponse.json({
    full_name: record.full_name,
    referral_code: record.referral_code,
    referral_count: record.referral_count,
    position,
  })
}
