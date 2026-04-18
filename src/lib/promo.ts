import { prisma } from "@/lib/prisma"
import type { PromoCode } from "@prisma/client"

export type PromoApplicability =
  | { ok: true; promo: PromoCode; discount: number }
  | { ok: false; reason: string }

// Round monetary values to 2 decimals.
const money = (n: number) => Math.round(n * 100) / 100

/**
 * Validate a promo code against a given subtotal and (optionally) user.
 * Returns the discount amount (£) and the PromoCode record on success.
 */
export async function validatePromo(opts: {
  code: string
  subtotal: number
  userId: string | null
}): Promise<PromoApplicability> {
  const code = opts.code.trim().toUpperCase()
  if (!code) return { ok: false, reason: "Enter a promo code." }

  const promo = await prisma.promoCode.findUnique({ where: { code } })
  if (!promo) return { ok: false, reason: "That code isn't recognised." }
  if (!promo.active) return { ok: false, reason: "That code is no longer active." }
  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return { ok: false, reason: "That code has expired." }
  }
  if (promo.maxUses !== null && promo.usesCount >= promo.maxUses) {
    return { ok: false, reason: "That code has reached its usage limit." }
  }
  if (promo.minSubtotal && opts.subtotal < Number(promo.minSubtotal)) {
    return {
      ok: false,
      reason: `Minimum order of £${Number(promo.minSubtotal).toFixed(2)} required.`,
    }
  }
  if (promo.oncePerUser && opts.userId) {
    const already = await prisma.promoRedemption.findUnique({
      where: { promoCodeId_userId: { promoCodeId: promo.id, userId: opts.userId } },
    })
    if (already) return { ok: false, reason: "You've already used this code." }
  }

  let discount = 0
  if (promo.discountType === "PERCENTAGE") {
    discount = money(opts.subtotal * (Number(promo.discountValue) / 100))
  } else {
    // FIXED
    discount = money(Math.min(Number(promo.discountValue), opts.subtotal))
  }

  return { ok: true, promo, discount }
}
