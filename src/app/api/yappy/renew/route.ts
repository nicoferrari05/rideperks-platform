import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const YAPPY_BASE_URL = "https://apipagosbg.bgeneral.cloud"
const YAPPY_DOMAIN = process.env.YAPPY_DOMAIN ?? "rideperks.app"
const SUBSCRIPTION_AMOUNT = 15.0

function generateOrderId(): string {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz"
  const rand = Array.from({ length: 13 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("")
  return "RP" + rand
}

export async function POST(request: Request) {
  try {
    const merchantId = process.env.YAPPY_MERCHANT_ID
    const secretKey = process.env.YAPPY_SECRET_KEY
    if (!merchantId || !secretKey) {
      return NextResponse.json({ error: "Pago no disponible en este momento" }, { status: 503 })
    }

    // ── 1. Get current user from session ──────────────────────────────────
    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Optional phone override from request body
    let bodyPhone: string | undefined
    try {
      const body = await request.json()
      bodyPhone = body?.phone
    } catch { /* no body is fine */ }

    const supabase = createAdminClient()

    // ── 2. Get profile (need phone for aliasYappy) ─────────────────────────
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("phone, full_name")
      .eq("id", user.id)
      .single()

    if (profileError || (!profile?.phone && !bodyPhone)) {
      return NextResponse.json({ error: "No se encontró tu perfil o número de teléfono" }, { status: 400 })
    }

    const phoneToUse = bodyPhone?.trim() || profile!.phone

    // ── 3. Create pending subscription ────────────────────────────────────
    const orderId = generateOrderId()
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setMonth(expiresAt.getMonth() + 1)

    const { error: subError } = await supabase.from("subscriptions").insert({
      driver_id: user.id,
      status: "pending",
      plan_name: "Mensual",
      amount: SUBSCRIPTION_AMOUNT,
      currency: "USD",
      starts_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      payment_method: "yappy",
      payment_reference: orderId,
      created_by: user.id,
    })

    if (subError) {
      console.error("[Yappy renew] subscription insert error:", subError)
      return NextResponse.json({ error: "Error al registrar la suscripción" }, { status: 500 })
    }

    // ── 4. Yappy: validate merchant ────────────────────────────────────────
    const validateRes = await fetch(`${YAPPY_BASE_URL}/payments/validate/merchant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchantId, urlDomain: YAPPY_DOMAIN }),
    })

    const validateData = await validateRes.json()

    if (!validateRes.ok || !validateData.body?.token) {
      console.error("[Yappy renew] validate merchant failed:", validateData)
      await supabase.from("subscriptions").delete().eq("payment_reference", orderId)
      return NextResponse.json({ error: "No se pudo conectar con Yappy. Intenta de nuevo." }, { status: 502 })
    }

    const yappyToken = validateData.body.token

    // ── 5. Yappy: create order ─────────────────────────────────────────────
    const phoneDigits = phoneToUse.replace(/\D/g, "").slice(-8)

    const orderRes = await fetch(`${YAPPY_BASE_URL}/payments/payment-wc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: yappyToken,
      },
      body: JSON.stringify({
        merchantId,
        orderId,
        domain: YAPPY_DOMAIN,
        paymentDate: Date.now(),
        aliasYappy: phoneDigits,
        ipnUrl: `https://${YAPPY_DOMAIN}/api/yappy/ipn`,
        discount: "0.00",
        taxes: "0.00",
        subtotal: SUBSCRIPTION_AMOUNT.toFixed(2),
        total: SUBSCRIPTION_AMOUNT.toFixed(2),
      }),
    })

    const orderData = await orderRes.json()

    if (!orderRes.ok || !orderData.body?.transactionId) {
      console.error("[Yappy renew] create order failed:", orderData)
      await supabase.from("subscriptions").delete().eq("payment_reference", orderId)
      return NextResponse.json(
        { error: orderData.status?.description ?? "Error al crear la orden de pago" },
        { status: 502 }
      )
    }

    return NextResponse.json({
      transactionId: orderData.body.transactionId,
      token: orderData.body.token,
      documentName: orderData.body.documentName,
    })
  } catch (err) {
    console.error("[Yappy renew] unexpected error:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
