import { redirect } from "next/navigation"

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>
}) {
  const params = await searchParams
  const ref = params.ref
  redirect(ref ? `/register?ref=${encodeURIComponent(ref)}` : "/register")
}
