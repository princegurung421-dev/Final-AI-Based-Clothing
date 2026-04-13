import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes

// GET: Load the active chat session (or previous session summary for context)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // Find the most recent session
  const latestSession = await prisma.chatSession.findFirst({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });

  if (!latestSession) {
    return NextResponse.json({ messages: [], previousSummary: null, sessionId: null });
  }

  const now = new Date();
  const isExpired = now > latestSession.expiresAt;

  if (isExpired) {
    // Session expired - return empty messages but pass the summary for context
    return NextResponse.json({
      messages: [],
      previousSummary: latestSession.summary || buildSummary(latestSession.messages),
      sessionId: null,
    });
  }

  // Active session - return messages
  let messages = [];
  try {
    messages = JSON.parse(latestSession.messages);
  } catch { /* ignore */ }

  return NextResponse.json({
    messages,
    previousSummary: null,
    sessionId: latestSession.id,
  });
}

// POST: Save messages to the chat session
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const { messages, sessionId } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
  }

  // Verify user exists in DB (JWT may outlive a DB reset/reseed)
  const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!userExists) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const messagesJson = JSON.stringify(messages);
  const summary = buildSummary(messagesJson);

  if (sessionId) {
    // Update existing session
    try {
      await prisma.chatSession.update({
        where: { id: sessionId, userId },
        data: { messages: messagesJson, summary, expiresAt, updatedAt: new Date() },
      });
      return NextResponse.json({ sessionId });
    } catch {
      // Session not found or doesn't belong to user - create new one
    }
  }

  // Create new session
  try {
    const newSession = await prisma.chatSession.create({
      data: { userId, messages: messagesJson, summary, expiresAt },
    });
    return NextResponse.json({ sessionId: newSession.id });
  } catch {
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
  }
}

// DELETE: Clear chat and start fresh
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Mark current sessions as expired (keep them for history but don't load)
  await prisma.chatSession.updateMany({
    where: { userId: session.user.id, expiresAt: { gt: new Date() } },
    data: { expiresAt: new Date() },
  });

  return NextResponse.json({ success: true });
}

// Build a brief text summary from messages JSON for context carry-forward
function buildSummary(messagesJson: string): string {
  try {
    const msgs = typeof messagesJson === 'string' ? JSON.parse(messagesJson) : messagesJson;
    if (!Array.isArray(msgs) || msgs.length === 0) return '';

    const textParts: string[] = [];
    for (const msg of msgs) {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      // Extract text from parts or content
      let text = '';
      if (msg.parts) {
        text = msg.parts
          .filter((p: any) => p.type === 'text')
          .map((p: any) => p.text)
          .join(' ');
      } else if (msg.content) {
        text = msg.content;
      }
      if (text) {
        // Truncate long messages
        const truncated = text.length > 150 ? text.slice(0, 150) + '...' : text;
        textParts.push(`${role}: ${truncated}`);
      }
    }

    // Keep last 10 exchanges max
    const recent = textParts.slice(-20);
    return recent.join('\n');
  } catch {
    return '';
  }
}
