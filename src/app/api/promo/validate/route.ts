import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { validatePromo } from "@/lib/promo"
import { effectivePrice } from "@/lib/utils"
import { rateLimit } from "@/lib/ratelimit"

export async function POST(req: Request) {
  // 10 attempts / minute / IP — stops brute-force guessing of promo codes.
  const rl = rateLimit(req, { namespace: "promo-validate", limit: 10, windowMs: 60_000 })
  if (rl) return rl

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, reason: "Sign in to use promo codes." }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, reason: "Invalid body" }, { status: 400 })
  }

  const code = (body?.code || "").trim()
  if (!code) {
    return NextResponse.json({ ok: false, reason: "Enter a code." }, { status: 400 })
  }

  // Compute live subtotal from the user's cart so the client can't lie about it.
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  })
  const subtotal = cartItems.reduce(
    (acc, item) => acc + effectivePrice(item.product) * item.quantity,
    0
  )
  if (subtotal <= 0) {
    return NextResponse.json({ ok: false, reason: "Your bag is empty." }, { status: 400 })
  }

  const result = await validatePromo({ code, subtotal, userId: session.user.id })

  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 200 })
  }

  // Persist the applied code on the user so it follows them across devices.
  await prisma.user.update({
    where: { id: session.user.id },
    data: { activePromoCode: result.promo.code },
  })

  return NextResponse.json({
    ok: true,
    code: result.promo.code,
    discount: result.discount,
    discountType: result.promo.discountType,
    discountValue: Number(result.promo.discountValue),
    subtotal,
  })
}
