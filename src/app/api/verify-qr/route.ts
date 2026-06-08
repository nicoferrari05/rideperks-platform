import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { token, business_code } = await request.json()

  if (!token || !business_code) {
    return NextResponse.json({ valid: false, error: "Datos incompletos" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const now = new Date().toISOString()

  // ── QR de membresía general (member:UUID) ──
  if (token.startsWith("member:")) {
    const driverId = token.replace("member:", "")

    // business + profile en paralelo: son independientes entre sí
    const [{ data: business }, { data: profile }] = await Promise.all([
      supabase.from("partner_businesses").select("id, name, is_active").eq("access_code", business_code).single(),
      supabase.from("profiles").select("full_name, status, platform").eq("id", driverId).single(),
    ])

    if (!business || !business.is_active)
      return NextResponse.json({ valid: false, error: "Código de comercio inválido" }, { status: 401 })
    if (!profile)
      return NextResponse.json({ valid: false, error: "Conductor no encontrado" }, { status: 404 })
    if (profile.status !== "verified")
      return NextResponse.json({ valid: false, error: "Conductor no verificado" }, { status: 403 })

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("id, expires_at")
      .eq("driver_id", driverId)
      .eq("status", "active")
      .gte("expires_at", now)
      .limit(1)
      .single()

    if (!subscription)
      return NextResponse.json({ valid: false, error: "Membresía inactiva o vencida" }, { status: 403 })

    return NextResponse.json({
      valid: true,
      type: "membership",
      driver_name: profile.full_name,
      platform: profile.platform,
      expires_at: subscription.expires_at,
      business_name: business.name,
    })
  }

  // ── QR de beneficio específico ──

  // business + qrToken en paralelo: son independientes entre sí
  const [{ data: business }, { data: qrToken }] = await Promise.all([
    supabase.from("partner_businesses").select("id, name, is_active").eq("access_code", business_code).single(),
    supabase.from("qr_tokens")
      .select("*, benefits(id, title, discount_value, discount_type, usage_limit_per_driver), profiles(full_name, platform, status)")
      .eq("token", token)
      .single(),
  ])

  if (!business || !business.is_active)
    return NextResponse.json({ valid: false, error: "Código de comercio inválido" }, { status: 401 })
  if (!qrToken)
    return NextResponse.json({ valid: false, error: "QR no encontrado" }, { status: 404 })
  if (qrToken.status === "used")
    return NextResponse.json({ valid: false, error: "Este QR ya fue utilizado" }, { status: 409 })
  if (qrToken.profiles?.status !== "verified")
    return NextResponse.json({ valid: false, error: "Conductor no verificado" }, { status: 403 })

  if (new Date(qrToken.expires_at) < new Date()) {
    await supabase.from("qr_tokens").update({ status: "expired" }).eq("id", qrToken.id)
    return NextResponse.json({ valid: false, error: "QR expirado" }, { status: 410 })
  }

  // subscription + benefitBusiness en paralelo: ambas son independientes
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [{ data: subscription }, { data: benefitBusiness }] = await Promise.all([
    supabase.from("subscriptions").select("id")
      .eq("driver_id", qrToken.driver_id)
      .eq("status", "active")
      .gte("expires_at", now)
      .limit(1)
      .single(),
    qrToken.benefit_id
      ? supabase.from("benefits").select("business_id").eq("id", qrToken.benefit_id).single()
      : Promise.resolve({ data: null, error: null }),
  ])

  if (!subscription)
    return NextResponse.json({ valid: false, error: "El conductor no tiene membresía activa" }, { status: 403 })
  if (benefitBusiness?.business_id && benefitBusiness.business_id !== business.id)
    return NextResponse.json({ valid: false, error: "Este QR no corresponde a tu comercio" }, { status: 403 })

  // Límite mensual (depende de qrToken, no se puede paralelizar antes)
  if (qrToken.benefits?.usage_limit_per_driver) {
    const { count } = await supabase
      .from("benefit_redemptions")
      .select("*", { count: "exact", head: true })
      .eq("driver_id", qrToken.driver_id)
      .eq("benefit_id", qrToken.benefit_id)
      .gte("redeemed_at", startOfMonth.toISOString())

    if ((count ?? 0) >= qrToken.benefits.usage_limit_per_driver)
      return NextResponse.json({
        valid: false,
        error: `Límite mensual alcanzado (${qrToken.benefits.usage_limit_per_driver} uso/mes)`,
      }, { status: 429 })
  }

  // update + insert en paralelo: son independientes entre sí
  await Promise.all([
    supabase.from("qr_tokens").update({
      status: "used",
      used_at: new Date().toISOString(),
      used_by_business: business.id,
    }).eq("id", qrToken.id),
    supabase.from("benefit_redemptions").insert({
      driver_id: qrToken.driver_id,
      benefit_id: qrToken.benefit_id,
      business_id: business.id,
      qr_token_id: qrToken.id,
    }),
  ])

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
