import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { validatePromo } from "@/lib/promo"
import { effectivePrice } from "@/lib/utils"

// GET /api/promo/active
//   Returns the user's currently applied promo code (if any), re-validated
//   against the live cart. Automatically clears a code that's no longer valid.
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ applied: null })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { activePromoCode: true },
  })
  if (!user?.activePromoCode) return NextResponse.json({ applied: null })

  const cart = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  })
  const subtotal = cart.reduce(
    (acc, i) => acc + effectivePrice(i.product) * i.quantity,
    0
  )

  if (subtotal <= 0) {
    // Cart is empty — clear the stored code
    await prisma.user.update({
      where: { id: session.user.id },
      data: { activePromoCode: null },
    })
    return NextResponse.json({ applied: null })
  }

  const result = await validatePromo({
    code: user.activePromoCode,
    subtotal,
    userId: session.user.id,
  })

  if (!result.ok) {
    // Stored code no longer valid — clear it
    await prisma.user.update({
      where: { id: session.user.id },
      data: { activePromoCode: null },
    })
    return NextResponse.json({ applied: null, reason: result.reason })
  }

  return NextResponse.json({
    applied: {
      code: result.promo.code,
      discount: result.discount,
      discountType: result.promo.discountType,
      discountValue: Number(result.promo.discountValue),
      subtotal,
    },
  })
}

// DELETE /api/promo/active — remove the applied code
export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 })
  await prisma.user.update({
    where: { id: session.user.id },
    data: { activePromoCode: null },
  })
  return NextResponse.json({ ok: true })
}
