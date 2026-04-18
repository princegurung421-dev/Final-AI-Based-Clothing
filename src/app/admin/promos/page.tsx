import { prisma } from "@/lib/prisma"
import { AdminPromosClient } from "./AdminPromosClient"
import type { PromoFormData } from "./PromoForm"

export const dynamic = "force-dynamic"

export default async function AdminPromosPage() {
  const rows = await prisma.promoCode.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
  })

  const promos: PromoFormData[] = rows.map((p) => ({
    id: p.id,
    code: p.code,
    description: p.description || "",
    discountType: p.discountType,
    discountValue: Number(p.discountValue),
    minSubtotal: p.minSubtotal ? Number(p.minSubtotal) : null,
    maxUses: p.maxUses,
    usesCount: p.usesCount,
    oncePerUser: p.oncePerUser,
    active: p.active,
    expiresAt: p.expiresAt ? p.expiresAt.toISOString() : null,
  }))

  return <AdminPromosClient promos={promos} />
}
