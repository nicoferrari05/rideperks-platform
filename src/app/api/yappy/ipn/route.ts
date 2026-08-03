import { NextResponse } from "next/server"
import crypto from "crypto"
import { createAdminClient } from "@/lib/supabase/admin"

// Yappy calls this endpoint when a payment is completed.
// status values: E=Executed, R=Rejected, C=Cancelled, X=Expired
//
// This is the one automatic hook in the whole payment flow: Yappy hits
// it server-to-server once the driver confirms payment in the Yappy
// app, so it's the only reliable place to (a) activate the $15 one-time
// membership and (b) record the referral that funded it — nothing else
// in the app currently marks a subscription "active".

function verifyHash(
  orderId: string,
  status: string,
  domain: string,
  hash: string
): boolean {
  try {
    const secretKey = process.env.YAPPY_SECRET_KEY!
    const decoded = Buffer.from(secretKey, "base64").toString("utf-8")
    const hmacKey = decoded.split(".")[0]
    const signature = crypto
      .createHmac("sha256", hmacKey)
      .update(orderId + status + domain)
      .digest("hex")
    return hash === signature
  } catch (err) {
    console.error("[Yappy IPN] hash verification error:", err)
    return false
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId") ?? ""
    const status = searchParams.get("status") ?? ""
    const hash = searchParams.get("hash") ?? ""
    const domain = searchParams.get("domain") ?? ""

    if (!orderId || !status || !hash || !domain) {
      return NextResponse.json({ success: false }, { status: 400 })
    }

    if (!verifyHash(orderId, status, domain, hash)) {
      console.error("[Yappy IPN] invalid hash for orderId:", orderId)
      return NextResponse.json({ success: false }, { status: 401 })
    }

    console.log("[Yappy IPN] received:", { orderId, status })

    const supabase = createAdminClient()

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("id, driver_id, status")
      .eq("payment_reference", orderId)
      .eq("status", "pending")
      .single()

    if (!subscription) {
      // Already processed, or an order we don't recognize — ack so Yappy stops retrying.
      return NextResponse.json({ success: true })
    }

    if (status === "E") {
      // Paid — one-time $15, so the membership never expires from here on.
      await supabase.from("subscriptions").update({
        status: "active",
        plan_name: "lifetime",
        expires_at: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      }).eq("id", subscription.id)

      await supabase.from("profiles").update({ status: "verified" }).eq("id", subscription.driver_id)

      const { data: driverProfile } = await supabase
        .from("profiles")
        .select("referred_by")
        .eq("id", subscription.driver_id)
        .single()

      if (driverProfile?.referred_by) {
        const { data: referrer } = await supabase
          .from("profiles")
          .select("id")
          .eq("referral_code", driverProfile.referred_by.toUpperCase())
          .single()

        if (referrer && referrer.id !== subscription.driver_id) {
          const { error: referralError } = await supabase.from("referrals").insert({
            referrer_id: referrer.id,
            referred_driver_id: subscription.driver_id,
            status: "active",
          })
          if (referralError) {
            console.error("[Yappy IPN] referral insert error:", referralError)
          }
        }
      }
    } else if (status === "R" || status === "C" || status === "X") {
      await supabase.from("subscriptions").update({ status: "cancelled" }).eq("id", subscription.id)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[Yappy IPN] unexpected error:", err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
