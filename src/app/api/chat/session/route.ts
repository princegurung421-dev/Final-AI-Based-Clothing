import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: list all chat sessions for the user (sidebar)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ sessions: [] });
  }

  const sessions = await prisma.chatSession.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      summary: true,
      updatedAt: true,
      createdAt: true,
    },
    take: 50,
  });

  return NextResponse.json({
    sessions: sessions.map(s => ({
      id: s.id,
      title: s.title || 'New chat',
      preview: s.summary?.slice(0, 80) || '',
      updatedAt: s.updatedAt.toISOString(),
    })),
  });
}

// POST: save messages to a chat session (creates if sessionId omitted)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const { messages, sessionId } = await req.json();

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
  }

  const userExists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!userExists) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  const messagesJson = JSON.stringify(messages);
  const summary = buildSummary(messages);
  const title = deriveTitle(messages);

  if (sessionId) {
    try {
      const updated = await prisma.chatSession.update({
        where: { id: sessionId, userId },
        data: {
          messages: messagesJson,
          summary,
          title,
          updatedAt: new Date(),
        },
      });
      return NextResponse.json({ sessionId: updated.id });
    } catch {
      // fall through to create
    }
  }

  const created = await prisma.chatSession.create({
    data: { userId, title, messages: messagesJson, summary },
  });
  return NextResponse.json({ sessionId: created.id });
}

// DELETE: wipe all chat sessions for this user
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.chatSession.deleteMany({ where: { userId: session.user.id } });
  return NextResponse.json({ success: true });
}

// ─── Helpers ─────────────────────────────────────────────────

function extractText(msg: any): string {
  if (msg?.parts && Array.isArray(msg.parts)) {
    return msg.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join(' ').trim();
  }
  if (typeof msg?.content === 'string') return msg.content;
  return '';
}

function deriveTitle(messages: any[]): string {
  const firstUser = messages.find(m => m.role === 'user');
  if (!firstUser) return 'New chat';
  const text = extractText(firstUser);
  if (!text) return 'New chat';
  return text.length > 60 ? text.slice(0, 60).trimEnd() + '…' : text;
}

function buildSummary(messages: any[]): string {
  const lines: string[] = [];
  for (const msg of messages) {
    const role = msg.role === 'user' ? 'User' : 'Assistant';
    const text = extractText(msg);
    if (text) {
      const truncated = text.length > 150 ? text.slice(0, 150) + '…' : text;
      lines.push(`${role}: ${truncated}`);
    }
  }
  return lines.slice(-20).join('\n');
}
