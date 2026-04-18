import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { assertStripe } from "@/lib/stripe"
import { validatePromo } from "@/lib/promo"
import { effectivePrice } from "@/lib/utils"
import { rateLimit } from "@/lib/ratelimit"

export async function POST(req: Request) {
  // 20 order-init attempts / minute — generous but caps a runaway retry loop.
  const rl = rateLimit(req, { namespace: "stripe-checkout", limit: 20, windowMs: 60_000 })
  if (rl) return rl

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 })
  }
  const userId = session.user.id

  const body = await req.json()
  const { addressLine1, addressLine2, city, postcode, country, fullName } = body || {}
  if (!addressLine1 || !city || !postcode) {
    return NextResponse.json({ error: "Missing address fields" }, { status: 400 })
  }

  // Read the applied promo code from the user row on the server — never trust
  // a client-sent value here since it's the basis of the discount.
  const userRow = await prisma.user.findUnique({
    where: { id: userId },
    select: { activePromoCode: true },
  })
  const promoCode = userRow?.activePromoCode || null

  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        include: { images: { where: { isPrimary: true }, take: 1 }, stock: true },
      },
    },
  })

  if (cartItems.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
  }

  for (const item of cartItems) {
    const stock = item.product.stock.find(s => s.size === item.size)
    if (!stock || stock.quantity < item.quantity) {
      return NextResponse.json(
        { error: `${item.product.name} (size ${item.size}) is out of stock.` },
        { status: 400 }
      )
    }
  }

  const subtotal = cartItems.reduce(
    (acc, item) => acc + effectivePrice(item.product) * item.quantity,
    0
  )

  // ── Promo code (optional, at most one) ─────────────────────
  let discountAmount = 0
  let promoCodeId: string | null = null
  const codeStr = typeof promoCode === "string" ? promoCode.trim() : ""
  if (codeStr) {
    const promo = await validatePromo({ code: codeStr, subtotal, userId })
    if (!promo.ok) {
      return NextResponse.json({ error: promo.reason }, { status: 400 })
    }
    discountAmount = promo.discount
    promoCodeId = promo.promo.id
  }

  const deliveryCost = subtotal - discountAmount > 50 ? 0 : 3.99
  const totalValue = Math.round((subtotal - discountAmount + deliveryCost) * 100) / 100
  if (totalValue <= 0) {
    return NextResponse.json(
      { error: "Discounted total must be greater than zero." },
      { status: 400 }
    )
  }

  const orderNumber =
    "WW" + Math.floor(Math.random() * 100000000).toString().padStart(8, "0")

  const deliveryAddress = JSON.stringify({
    fullName: fullName || session.user.name || "",
    addressLine1,
    addressLine2: addressLine2 || "",
    city,
    postcode,
    country: country || "United Kingdom",
  })

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId,
      status: "PENDING",
      totalValue,
      subtotal,
      deliveryCost,
      discountAmount,
      promoCodeId,
      deliveryAddress,
      items: {
        create: cartItems.map(item => ({
          productId: item.productId,
          productName: item.product.name,
          size: item.size,
          quantity: item.quantity,
          price: effectivePrice(item.product), // lock in sale price if one was active
          imageUrl: item.product.images?.[0]?.url || null,
        })),
      },
    },
  })

  try {
    const stripe = assertStripe()
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalValue * 100),
      currency: "gbp",
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId,
        promoCodeId: promoCodeId || "",
      },
      description: `WearWise order ${order.orderNumber}`,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderNumber: order.orderNumber,
      orderId: order.id,
    })
  } catch (e: any) {
    await prisma.order.delete({ where: { id: order.id } }).catch(() => {})
    console.error("Stripe PaymentIntent failed:", e?.message)
    return NextResponse.json(
      { error: e?.message || "Could not initialise payment." },
      { status: 500 }
    )
  }
}
