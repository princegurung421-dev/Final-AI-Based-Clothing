"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"

export function EmbedBackfillButton({
  missing,
  total,
}: {
  missing: number
  total: number
}) {
  const [pending, setPending] = React.useState(false)
  const [result, setResult] = React.useState<string | null>(null)

  const run = async (force: boolean) => {
    setPending(true)
    setResult(null)
    try {
      const res = await fetch("/api/admin/embed-backfill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      })
      const data = await res.json()
      if (!res.ok) {
        setResult(data.error || "Failed")
      } else {
        setResult(`Embedded ${data.embedded}/${data.processed} products${data.failed ? ` (${data.failed} failed)` : ""}`)
      }
    } catch (e: any) {
      setResult(e?.message || "Request failed")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex items-center gap-3 text-[12px]">
      <div className="flex items-center gap-1.5 text-muted">
        <Sparkles className="w-3.5 h-3.5" />
        <span>
          Semantic index: {total - missing}/{total}
        </span>
      </div>
      <button
        onClick={() => run(false)}
        disabled={pending || missing === 0}
        className="px-3 py-1 text-[12px] font-semibold border border-border rounded-lg hover:border-primary hover:text-primary disabled:opacity-40 transition-colors"
      >
        {pending ? "Embedding…" : missing > 0 ? `Embed ${missing} missing` : "All embedded"}
      </button>
      <button
        onClick={() => run(true)}
        disabled={pending}
        className="text-[11px] text-muted hover:text-foreground disabled:opacity-40 underline underline-offset-2"
      >
        Re-embed all
      </button>
      {result && <span className="text-[11px] text-muted">{result}</span>}
    </div>
  )
}
