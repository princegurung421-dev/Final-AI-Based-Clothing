import { NextResponse } from "next/server"
import { assertStripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import type Stripe from "stripe"

// Stripe needs the raw request body to verify the signature — never parse to JSON first.
export async function POST(req: Request) {
  const stripe = assertStripe()
  const signature = req.headers.get("stripe-signature")
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !secret) {
    return NextResponse.json(
      { error: "Missing Stripe signature or webhook secret" },
      { status: 400 }
    )
  }

  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret)
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent
        const orderId = pi.metadata?.orderId
        const userId = pi.metadata?.userId
        if (!orderId) break

        const existing = await prisma.order.findUnique({ where: { id: orderId } })
        if (!existing) break
        // Idempotency — Stripe will retry on our 5xx; we must not double-apply.
        if (existing.status !== "PENDING") break

        await prisma.$transaction(async tx => {
          await tx.order.update({
            where: { id: orderId },
            data: { status: "PROCESSING" },
          })
          if (userId) {
            await tx.cartItem.deleteMany({ where: { userId } })
            // Cart paid for — clear the applied promo so next order starts fresh
            await tx.user.update({
              where: { id: userId },
              data: { activePromoCode: null },
            })
          }
          const items = await tx.orderItem.findMany({ where: { orderId } })
          for (const item of items) {
            await tx.productStock.updateMany({
              where: { productId: item.productId, size: item.size },
              data: { quantity: { decrement: item.quantity } },
            })
          }
          if (existing.promoCodeId && userId) {
            await tx.promoCode.update({
              where: { id: existing.promoCodeId },
              data: { usesCount: { increment: 1 } },
            })
            await tx.promoRedemption.upsert({
              where: {
                promoCodeId_userId: {
                  promoCodeId: existing.promoCodeId,
                  userId,
                },
              },
              update: { orderId },
              create: {
                promoCodeId: existing.promoCodeId,
                userId,
                orderId,
              },
            })
          }
        })
        break
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent
        const orderId = pi.metadata?.orderId
        if (!orderId) break
        // Leave the Order as PENDING so the customer can retry. We just log.
        console.warn(
          `PaymentIntent failed for order ${orderId}: ${pi.last_payment_error?.message || "unknown"}`
        )
        break
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge
        const piId = typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id
        if (!piId) break
        const pi = await stripe.paymentIntents.retrieve(piId)
        const orderId = pi.metadata?.orderId
        if (!orderId) break
        // We don't have a REFUNDED status in the enum; leave it DELIVERED/whatever
        // it was and just mark notes. Extend the enum later if needed.
        await prisma.order.update({
          where: { id: orderId },
          data: {
            notes: `Refunded via Stripe on ${new Date().toISOString()}`,
          },
        }).catch(() => {})
        break
      }

      default:
        // Unhandled event types are fine — we just acknowledge them.
        break
    }
  } catch (err: any) {
    console.error(`Webhook handler error for ${event.type}:`, err)
    // Return 500 so Stripe retries — but NOT for signature errors.
    return NextResponse.json({ error: "Handler failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
