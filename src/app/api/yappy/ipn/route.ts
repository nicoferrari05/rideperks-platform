import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import crypto from "crypto"

// Yappy calls this endpoint as GET with query params:
// orderId, hash, status, domain
// status values: E=Executed, R=Rejected, C=Cancelled, X=Expired

function verifyHash(
  orderId: string,
  status: string,
  domain: string,
  hash: string
): boolean {
  try {
    const secretKey = process.env.YAPPY_SECRET_KEY!
    // Decode base64 secret, split by '.', use first part as HMAC key
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

    // Verify the hash signature to confirm the request is genuinely from Yappy
    if (!verifyHash(orderId, status, domain, hash)) {
      console.error("[Yappy IPN] invalid hash for orderId:", orderId)
      return NextResponse.json({ success: false }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Find the pending subscription by orderId (stored in payment_reference)
    const { data: subscription, error: findError } = await supabase
      .from("subscriptions")
      .select("id, driver_id, expires_at")
      .eq("payment_reference", orderId)
      .eq("status", "pending")
      .single()

    if (findError || !subscription) {
      // Order not found or already processed — return success to stop Yappy retries
      console.warn("[Yappy IPN] subscription not found for orderId:", orderId)
      return NextResponse.json({ success: true })
    }

    if (status === "E") {
      // Payment executed — activate subscription and mark profile as verified
      const now = new Date()
      const expiresAt = new Date(now)
      expiresAt.setMonth(expiresAt.getMonth() + 1)

      await Promise.all([
        supabase
          .from("subscriptions")
          .update({
            status: "active",
            starts_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
          })
          .eq("id", subscription.id),

        supabase
          .from("profiles")
          .update({ status: "verified" })
          .eq("id", subscription.driver_id),
      ])

      console.log("[Yappy IPN] subscription activated:", subscription.id)
    } else {
      // R=Rejected, C=Cancelled, X=Expired — mark subscription as cancelled
      await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("id", subscription.id)

      console.log("[Yappy IPN] subscription cancelled:", subscription.id, "reason:", status)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[Yappy IPN] unexpected error:", err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
