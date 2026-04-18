"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")
}

type PromoInput = {
  code: string
  description: string
  discountType: "PERCENTAGE" | "FIXED"
  discountValue: number
  minSubtotal: number | null
  maxUses: number | null
  oncePerUser: boolean
  active: boolean
  expiresAt: string | null // ISO date
}

function parse(formData: FormData): PromoInput {
  return {
    code: ((formData.get("code") as string) || "").trim().toUpperCase(),
    description: ((formData.get("description") as string) || "").trim(),
    discountType: (formData.get("discountType") as any) || "PERCENTAGE",
    discountValue: Number(formData.get("discountValue") || 0),
    minSubtotal: formData.get("minSubtotal")
      ? Number(formData.get("minSubtotal"))
      : null,
    maxUses: formData.get("maxUses") ? Number(formData.get("maxUses")) : null,
    oncePerUser: formData.get("oncePerUser") === "true",
    active: formData.get("active") === "true",
    expiresAt: (formData.get("expiresAt") as string) || null,
  }
}

export async function createPromo(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin()
  const input = parse(formData)
  if (!input.code) return { error: "Code is required." }
  if (!input.discountValue || input.discountValue <= 0)
    return { error: "Discount value must be positive." }
  if (input.discountType === "PERCENTAGE" && input.discountValue > 100)
    return { error: "Percentage discount can't exceed 100." }

  const existing = await prisma.promoCode.findUnique({ where: { code: input.code } })
  if (existing) return { error: `Code "${input.code}" already exists.` }

  await prisma.promoCode.create({
    data: {
      code: input.code,
      description: input.description || null,
      discountType: input.discountType,
      discountValue: input.discountValue,
      minSubtotal: input.minSubtotal ?? null,
      maxUses: input.maxUses ?? null,
      oncePerUser: input.oncePerUser,
      active: input.active,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    },
  })

  revalidatePath("/admin/promos")
  return { success: true }
}

export async function updatePromo(id: string, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin()
  const input = parse(formData)
  if (!input.code) return { error: "Code is required." }
  if (!input.discountValue || input.discountValue <= 0)
    return { error: "Discount value must be positive." }
  if (input.discountType === "PERCENTAGE" && input.discountValue > 100)
    return { error: "Percentage discount can't exceed 100." }

  await prisma.promoCode.update({
    where: { id },
    data: {
      code: input.code,
      description: input.description || null,
      discountType: input.discountType,
      discountValue: input.discountValue,
      minSubtotal: input.minSubtotal ?? null,
      maxUses: input.maxUses ?? null,
      oncePerUser: input.oncePerUser,
      active: input.active,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    },
  })

  revalidatePath("/admin/promos")
  return { success: true }
}

export async function deletePromo(id: string) {
  await requireAdmin()
  await prisma.promoCode.delete({ where: { id } })
  revalidatePath("/admin/promos")
  return { success: true }
}

export async function togglePromoActive(id: string, active: boolean) {
  await requireAdmin()
  await prisma.promoCode.update({ where: { id }, data: { active } })
  revalidatePath("/admin/promos")
  return { success: true }
}
