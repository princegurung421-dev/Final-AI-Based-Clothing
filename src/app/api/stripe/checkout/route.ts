import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { assertStripe } from "@/lib/stripe"

export async function POST(req: Request) {
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

  // Validate stock
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
    (acc, item) => acc + Number(item.product.price) * item.quantity,
    0
  )
  const deliveryCost = subtotal > 50 ? 0 : 3.99
  const totalValue = Math.round((subtotal + deliveryCost) * 100) / 100

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

  // 1. Snapshot the cart into a PENDING order
  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId,
      status: "PENDING",
      totalValue,
      subtotal,
      deliveryCost,
      deliveryAddress,
      items: {
        create: cartItems.map(item => ({
          productId: item.productId,
          productName: item.product.name,
          size: item.size,
          quantity: item.quantity,
          price: item.product.price,
          imageUrl: item.product.images?.[0]?.url || null,
        })),
      },
    },
  })

  // 2. Create the PaymentIntent — metadata carries the linkage the webhook
  //    needs to move the order forward.
  try {
    const stripe = assertStripe()
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalValue * 100), // pence
      currency: "gbp",
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId,
      },
      description: `WearWise order ${order.orderNumber}`,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderNumber: order.orderNumber,
      orderId: order.id,
    })
  } catch (e: any) {
    // Roll back the pending order if Stripe refused us.
    await prisma.order.delete({ where: { id: order.id } }).catch(() => {})
    console.error("Stripe PaymentIntent failed:", e?.message)
    return NextResponse.json(
      { error: e?.message || "Could not initialise payment." },
      { status: 500 }
    )
  }
}
