import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  const supabaseUser = await createClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { data: profile } = await supabaseUser
    .from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const { business_id, email, password } = await request.json()
  if (!business_id || !email || !password) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: business } = await admin
    .from("partner_businesses").select("id, name, owner_user_id").eq("id", business_id).single()
  if (!business) {
    return NextResponse.json({ error: "Comercio no encontrado" }, { status: 404 })
  }
  if (business.owner_user_id) {
    return NextResponse.json({ error: "Este comercio ya tiene una cuenta de portal" }, { status: 409 })
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "business", full_name: business.name },
  })

  if (createError || !created.user) {
    const message = createError?.message?.includes("already been registered")
      ? "Ese email ya está registrado"
      : (createError?.message ?? "Error al crear la cuenta")
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const { error: linkError } = await admin
    .from("partner_businesses").update({ owner_user_id: created.user.id }).eq("id", business_id)

  if (linkError) {
    await admin.auth.admin.deleteUser(created.user.id)
    return NextResponse.json({ error: "Error al vincular la cuenta al comercio" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
