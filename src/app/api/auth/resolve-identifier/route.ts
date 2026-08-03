import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Login accepts either an email or a username. If the identifier isn't
// an email, this looks up the matching profile and returns the email
// tied to that account so the client can call signInWithPassword as usual.
export async function POST(request: Request) {
  const { identifier } = await request.json()
  const trimmed = (identifier ?? "").trim()

  if (!trimmed) {
    return NextResponse.json({ error: "Falta usuario o correo" }, { status: 400 })
  }

  if (trimmed.includes("@")) {
    return NextResponse.json({ email: trimmed })
  }

  const supabase = createAdminClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", trimmed)
    .maybeSingle()

  if (!profile) {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 404 })
  }

  const { data: userData, error } = await supabase.auth.admin.getUserById(profile.id)
  if (error || !userData.user?.email) {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 404 })
  }

  return NextResponse.json({ email: userData.user.email })
}
