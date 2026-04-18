import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/ratelimit"

export async function POST(req: Request) {
  // 5 messages / minute / IP — stops form spam without blocking real users
  const rl = rateLimit(req, { namespace: "contact", limit: 5, windowMs: 60_000 })
  if (rl) return rl

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const name = (body?.name || "").trim()
  const email = (body?.email || "").trim()
  const topic = (body?.topic || "").trim()
  const message = (body?.message || "").trim()

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email and message are required." },
      { status: 400 }
    )
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 })
  }
  if (name.length > 120) {
    return NextResponse.json({ error: "Name is too long." }, { status: 400 })
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: "Message is too long (max 5000 characters)." }, { status: 400 })
  }

  // Do NOT let a bad session cookie crash the request. If auth() throws, we
  // treat it as an unauthenticated submission.
  let userId: string | null = null
  try {
    const session = await auth()
    userId = session?.user?.id || null
  } catch (e) {
    console.warn("contact: auth() failed (treating as guest):", (e as any)?.message)
  }

  try {
    const created = await prisma.contactMessage.create({
      data: {
        name,
        email,
        topic: topic || null,
        message,
        userId,
      },
    })
    return NextResponse.json({ success: true, id: created.id })
  } catch (e: any) {
    console.error("contact save failed:", {
      code: e?.code,
      name: e?.name,
      message: e?.message,
    })
    const detail =
      process.env.NODE_ENV === "production"
        ? "Could not send your message."
        : `Could not send: ${e?.message || "unknown"}`
    return NextResponse.json({ error: detail }, { status: 500 })
  }
}
