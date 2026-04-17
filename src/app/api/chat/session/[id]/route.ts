import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const chatSession = await prisma.chatSession.findUnique({
    where: { id, userId: session.user.id } as any,
  })

  if (!chatSession || chatSession.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  let messages: any[] = []
  try {
    messages = JSON.parse(chatSession.messages)
  } catch { /* ignore */ }

  return NextResponse.json({
    id: chatSession.id,
    title: chatSession.title,
    messages,
    summary: chatSession.summary,
    updatedAt: chatSession.updatedAt.toISOString(),
  })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const existing = await prisma.chatSession.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.chatSession.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
