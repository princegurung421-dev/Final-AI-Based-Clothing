"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Clock, CheckCircle, Loader2, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { updateContactStatus, saveContactNote, deleteContactMessage } from "./actions"

type Message = {
  id: string
  name: string
  email: string
  topic: string | null
  message: string
  status: "NEW" | "IN_PROGRESS" | "RESOLVED"
  internalNote: string | null
  createdAt: string
  user: { name: string | null; email: string } | null
}

const STATUS_META: Record<Message["status"], { label: string; bg: string; text: string; icon: any }> = {
  NEW: { label: "New", bg: "bg-amber-50", text: "text-amber-700", icon: Clock },
  IN_PROGRESS: { label: "In progress", bg: "bg-blue-50", text: "text-blue-700", icon: Loader2 },
  RESOLVED: { label: "Resolved", bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle },
}

export function ContactMessageRow({ msg }: { msg: Message }) {
  const router = useRouter()
  const [expanded, setExpanded] = React.useState(false)
  const [status, setStatus] = React.useState(msg.status)
  const [note, setNote] = React.useState(msg.internalNote || "")
  const [saving, setSaving] = React.useState(false)
  const meta = STATUS_META[status]
  const Icon = meta.icon

  const onStatusChange = async (next: Message["status"]) => {
    const prev = status
    setStatus(next)
    try {
      await updateContactStatus(msg.id, next)
      router.refresh()
    } catch {
      setStatus(prev)
    }
  }

  const onSaveNote = async () => {
    setSaving(true)
    try {
      await saveContactNote(msg.id, note)
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async () => {
    if (!confirm("Delete this message? It can't be recovered.")) return
    await deleteContactMessage(msg.id)
    router.refresh()
  }

  const date = new Date(msg.createdAt).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-muted/5 transition-colors"
      >
        <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shrink-0 mt-0.5", meta.bg, meta.text)}>
          <Icon className="w-3 h-3" />
          {meta.label}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[14px] font-semibold truncate">{msg.name}</p>
            <span className="text-[12px] text-muted truncate">{msg.email}</span>
            {msg.user && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                Account
              </span>
            )}
          </div>
          <p className="text-[13px] text-muted truncate">
            {msg.topic && <span className="font-medium text-foreground/80">{msg.topic} · </span>}
            {msg.message}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <p className="text-[11px] text-muted">{date}</p>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-2 border-t border-border/40 bg-muted/5 space-y-5">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted mb-2">Message</p>
            <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.message}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted mb-2">Status</p>
              <select
                value={status}
                onChange={(e) => onStatusChange(e.target.value as Message["status"])}
                className="w-full h-10 px-3 text-[14px] border border-border rounded-lg bg-white focus:border-primary outline-none"
              >
                <option value="NEW">New</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted mb-2">Reply by email</p>
              <a
                href={`mailto:${msg.email}?subject=${encodeURIComponent("Re: " + (msg.topic || "your enquiry"))}`}
                className="inline-flex items-center h-10 px-3 bg-primary text-white rounded-lg text-[13px] font-semibold hover:bg-primary/90 transition-colors"
              >
                Open in mail client
              </a>
            </div>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted mb-2">Internal note (admin only)</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Notes for other admins — e.g. 'replied 2026-04-18', 'refund issued'"
              className="w-full px-3 py-2 text-[14px] border border-border rounded-lg focus:border-primary outline-none resize-y"
            />
            <div className="flex items-center justify-end mt-2">
              <button
                onClick={onSaveNote}
                disabled={saving || note === (msg.internalNote || "")}
                className="h-9 px-4 bg-foreground text-white rounded-lg text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save note"}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-border/40">
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 text-[12px] text-error hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete message
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
