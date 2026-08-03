import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = (searchParams.get("u") ?? "").trim()

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return NextResponse.json({ available: false, reason: "format" })
  }

  const supabase = createAdminClient()
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", username)
    .maybeSingle()

  return NextResponse.json({ available: !data })
}
