import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
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

  // Simple email shape check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 })
  }

  if (message.length > 5000) {
    return NextResponse.json({ error: "Message is too long (max 5000 characters)." }, { status: 400 })
  }

  const session = await auth()

  try {
    const created = await prisma.contactMessage.create({
      data: {
        name,
        email,
        topic: topic || null,
        message,
        userId: session?.user?.id || null,
      },
    })
    return NextResponse.json({ success: true, id: created.id })
  } catch (e) {
    console.error("Contact form save failed:", e)
    return NextResponse.json({ error: "Could not send your message." }, { status: 500 })
  }
}
