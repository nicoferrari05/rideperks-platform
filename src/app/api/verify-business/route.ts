import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { business_code } = await request.json()

  if (!business_code) {
    return NextResponse.json({ valid: false, error: "Código requerido" }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: business } = await supabase
    .from("partner_businesses")
    .select("id, name, is_active")
    .eq("access_code", business_code)
    .single()

  if (!business) {
    return NextResponse.json({ valid: false, error: "Código de comercio no encontrado" }, { status: 401 })
  }

  if (!business.is_active) {
    return NextResponse.json({ valid: false, error: "Este comercio no está activo en RidePerks" }, { status: 403 })
  }

  return NextResponse.json({ valid: true, business_name: business.name })
}
