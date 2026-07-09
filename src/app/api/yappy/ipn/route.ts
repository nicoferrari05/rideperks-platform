import { NextResponse } from "next/server"
import crypto from "crypto"

// Yappy calls this endpoint when a payment is completed.
// status values: E=Executed, R=Rejected, C=Cancelled, X=Expired
// Membership activation is handled manually for now.

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

    // Activation is handled manually — respond 200 so Yappy stops retrying
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[Yappy IPN] unexpected error:", err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
