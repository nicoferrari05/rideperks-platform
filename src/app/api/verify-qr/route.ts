import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { token, business_code } = await request.json()

  if (!token || !business_code) {
    return NextResponse.json({ valid: false, error: "Datos incompletos" }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Verify business access code
  const { data: business } = await supabase
    .from("partner_businesses")
    .select("id, name, is_active")
    .eq("access_code", business_code)
    .single()

  if (!business || !business.is_active) {
    return NextResponse.json({ valid: false, error: "Código de comercio inválido" }, { status: 401 })
  }

  // ── QR de membresía general (member:UUID) ──
  if (token.startsWith("member:")) {
    const driverId = token.replace("member:", "")

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, status, platform")
      .eq("id", driverId)
      .single()

    if (!profile) {
      return NextResponse.json({ valid: false, error: "Conductor no encontrado" }, { status: 404 })
    }

    if (profile.status !== "verified") {
      return NextResponse.json({ valid: false, error: "Conductor no verificado" }, { status: 403 })
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("id, expires_at")
      .eq("driver_id", driverId)
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .limit(1)
      .single()

    if (!subscription) {
      return NextResponse.json({ valid: false, error: "Membresía inactiva o vencida" }, { status: 403 })
    }

    return NextResponse.json({
      valid: true,
      type: "membership",
      driver_name: profile.full_name,
      platform: profile.platform,
      expires_at: subscription.expires_at,
      business_name: business.name,
    })
  }

  // ── QR de beneficio específico (token UUID) ──
  const { data: qrToken } = await supabase
    .from("qr_tokens")
    .select("*, benefits(id, title, discount_value, discount_type, usage_limit_per_driver), profiles(full_name, platform, status)")
    .eq("token", token)
    .single()

  if (!qrToken) {
    return NextResponse.json({ valid: false, error: "QR no encontrado" }, { status: 404 })
  }

  if (qrToken.status === "used") {
    return NextResponse.json({ valid: false, error: "Este QR ya fue utilizado" }, { status: 409 })
  }

  if (new Date(qrToken.expires_at) < new Date()) {
    await supabase.from("qr_tokens").update({ status: "expired" }).eq("id", qrToken.id)
    return NextResponse.json({ valid: false, error: "QR expirado" }, { status: 410 })
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("driver_id", qrToken.driver_id)
    .eq("status", "active")
    .gte("expires_at", new Date().toISOString())
    .limit(1)
    .single()

  if (!subscription) {
    return NextResponse.json({ valid: false, error: "El conductor no tiene membresía activa" }, { status: 403 })
  }

  if (qrToken.profiles?.status !== "verified") {
    return NextResponse.json({ valid: false, error: "Conductor no verificado" }, { status: 403 })
  }

  if (qrToken.benefits?.usage_limit_per_driver) {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from("benefit_redemptions")
      .select("*", { count: "exact", head: true })
      .eq("driver_id", qrToken.driver_id)
      .eq("benefit_id", qrToken.benefit_id)
      .gte("redeemed_at", startOfMonth.toISOString())

    if ((count ?? 0) >= qrToken.benefits.usage_limit_per_driver) {
      return NextResponse.json({
        valid: false,
        error: `Límite mensual alcanzado (${qrToken.benefits.usage_limit_per_driver} uso/mes)`,
      }, { status: 429 })
    }
  }

  await supabase.from("qr_tokens").update({
    status: "used",
    used_at: new Date().toISOString(),
    used_by_business: business.id,
  }).eq("id", qrToken.id)

  await supabase.from("benefit_redemptions").insert({
    driver_id: qrToken.driver_id,
    benefit_id: qrToken.benefit_id,
    business_id: business.id,
    qr_token_id: qrToken.id,
  })

  return NextResponse.json({
    valid: true,
    type: "benefit",
    driver_name: qrToken.profiles?.full_name,
    benefit_title: qrToken.benefits?.title,
    discount_value: qrToken.benefits?.discount_value,
    discount_type: qrToken.benefits?.discount_type,
    business_name: business.name,
  })
}
