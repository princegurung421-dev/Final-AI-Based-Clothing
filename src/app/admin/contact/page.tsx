import { prisma } from "@/lib/prisma"
import { ContactMessageRow } from "./ContactMessageRow"
import { Inbox } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminContactPage() {
  const [messages, counts] = await Promise.all([
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
      take: 100,
    }),
    prisma.contactMessage.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ])

  const byStatus = Object.fromEntries(counts.map(c => [c.status, c._count.status]))

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Contact messages</h1>
          <p className="text-[13px] text-muted mt-1">
            {messages.length} total
            {(byStatus.NEW ?? 0) > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                {byStatus.NEW} new
              </span>
            )}
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center">
          <Inbox className="w-10 h-10 text-muted/40 mx-auto mb-4" />
          <p className="text-[15px] font-medium mb-1">Inbox zero</p>
          <p className="text-[13px] text-muted">No contact messages yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map(m => (
            <ContactMessageRow
              key={m.id}
              msg={{
                id: m.id,
                name: m.name,
                email: m.email,
                topic: m.topic,
                message: m.message,
                status: m.status,
                internalNote: m.internalNote,
                createdAt: m.createdAt.toISOString(),
                user: m.user,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
