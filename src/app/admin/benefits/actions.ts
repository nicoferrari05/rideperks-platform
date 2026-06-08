"use server"

import { revalidatePath } from "next/cache"

export async function revalidateBenefitsCache() {
  revalidatePath("/driver/benefits", "page")
}
