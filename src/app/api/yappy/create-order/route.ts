import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

const YAPPY_BASE_URL = "https://apipagosbg.bgeneral.cloud"
const YAPPY_DOMAIN = process.env.YAPPY_DOMAIN ?? "rideperks.app"
const SUBSCRIPTION_AMOUNT = 15.0

function generateOrderId(): string {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz"
  const rand = Array.from({ length: 13 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("")
  return "RP" + rand // "RP" + 13 chars = 15 chars max (Yappy limit)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, phone, platform, referralCode } = body

    if (!name || !email || !password || !phone) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const merchantId = process.env.YAPPY_MERCHANT_ID
    const secretKey = process.env.YAPPY_SECRET_KEY
    if (!merchantId || !secretKey) {
      console.error("[Yappy] YAPPY_MERCHANT_ID or YAPPY_SECRET_KEY not set")
      return NextResponse.json({ error: "Pago no disponible en este momento" }, { status: 503 })
    }

    const supabase = createAdminClient()

    // ── 1. Create auth user ────────────────────────────────────────────────
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
    })

    if (authError) {
      const alreadyExists =
        authError.message.toLowerCase().includes("already") ||
        authError.message.toLowerCase().includes("registered")
      if (alreadyExists) {
        return NextResponse.json(
          { error: "Este email ya tiene una cuenta. Inicia sesión para renovar." },
          { status: 409 }
        )
      }
      console.error("[Yappy] createUser error:", authError)
      return NextResponse.json({ error: "Error al crear la cuenta" }, { status: 500 })
    }

    const userId = authData.user.id

    // ── 2. Create profile ──────────────────────────────────────────────────
    const referralCode2 = "RP" + userId.replace(/-/g, "").substring(0, 6).toUpperCase()

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      role: "driver",
      full_name: name.trim(),
      phone: phone.trim(),
      platform: platform ?? null,
      status: "pending",
      referral_code: referralCode2,
    })

    if (profileError) {
      console.error("[Yappy] profile insert error:", profileError)
      await supabase.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: "Error al crear el perfil" }, { status: 500 })
    }

    // ── 3. Link referral if code provided ─────────────────────────────────
    if (referralCode) {
      const { data: referrer } = await supabase
        .from("profiles")
        .select("id")
        .eq("referral_code", referralCode.toUpperCase())
        .single()

      if (referrer) {
        await supabase.from("referrals").insert({
          referrer_id: referrer.id,
          referred_driver_id: userId,
          status: "active",
        })
      }
    }

    // ── 4. Create pending subscription ────────────────────────────────────
    const orderId = generateOrderId()
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setMonth(expiresAt.getMonth() + 1)

    const { error: subError } = await supabase.from("subscriptions").insert({
      driver_id: userId,
      status: "pending",
      plan_name: "Mensual",
      amount: SUBSCRIPTION_AMOUNT,
      currency: "USD",
      starts_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      payment_method: "yappy",
      payment_reference: orderId,
      created_by: userId,
    })

    if (subError) {
      console.error("[Yappy] subscription insert error:", subError)
      await supabase.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: "Error al registrar la suscripción" }, { status: 500 })
    }

    // ── 5. Yappy: validate merchant → get session token ────────────────────
    const validateRes = await fetch(`${YAPPY_BASE_URL}/payments/validate/merchant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchantId, urlDomain: YAPPY_DOMAIN }),
    })

    const validateData = await validateRes.json()

    if (!validateRes.ok || !validateData.body?.token) {
      console.error("[Yappy] validate merchant failed:", validateData)
      await supabase.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { error: "No se pudo conectar con Yappy. Intenta de nuevo." },
        { status: 502 }
      )
    }

    const yappyToken = validateData.body.token

    // ── 6. Yappy: create order ─────────────────────────────────────────────
    // aliasYappy = Panama phone number without prefix (last 7-8 digits)
    const phoneDigits = phone.replace(/\D/g, "").slice(-8)

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
      console.error("[Yappy] create order failed:", orderData)
      await supabase.auth.admin.deleteUser(userId)
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
    console.error("[Yappy] unexpected error:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
