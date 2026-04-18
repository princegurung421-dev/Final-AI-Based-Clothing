"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { Plus, Edit2, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { PromoForm, type PromoFormData } from "./PromoForm"
import { togglePromoActive } from "./actions"
import { useRouter } from "next/navigation"

export function AdminPromosClient({ promos }: { promos: PromoFormData[] }) {
  const router = useRouter()
  const [creating, setCreating] = React.useState(false)
  const [editing, setEditing] = React.useState<string | null>(null)

  const onToggle = async (id: string, active: boolean) => {
    await togglePromoActive(id, active)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Promo codes</h1>
          <p className="text-[13px] text-muted mt-1">
            {promos.length} total · {promos.filter((p) => p.active).length} active
          </p>
        </div>
        {!creating && (
          <Button onClick={() => setCreating(true)}>
            <Plus className="w-4 h-4" /> New code
          </Button>
        )}
      </div>

      {creating && (
        <div>
          <h2 className="text-[11px] uppercase tracking-widest font-semibold text-muted mb-3">
            New code
          </h2>
          <PromoForm onDone={() => setCreating(false)} />
        </div>
      )}

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-muted/5 border-b border-border text-muted">
            <tr>
              <th className="px-5 py-3 font-medium uppercase tracking-wider text-[11px]">Code</th>
              <th className="px-5 py-3 font-medium uppercase tracking-wider text-[11px]">Discount</th>
              <th className="px-5 py-3 font-medium uppercase tracking-wider text-[11px]">Uses</th>
              <th className="px-5 py-3 font-medium uppercase tracking-wider text-[11px]">Rules</th>
              <th className="px-5 py-3 font-medium uppercase tracking-wider text-[11px]">Status</th>
              <th className="px-5 py-3 font-medium uppercase tracking-wider text-[11px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {promos.map((p) => (
              <React.Fragment key={p.id}>
                <tr className="hover:bg-muted/5">
                  <td className="px-5 py-3">
                    <p className="font-mono font-semibold tracking-wider">{p.code}</p>
                    {p.description && <p className="text-[11px] text-muted mt-0.5">{p.description}</p>}
                  </td>
                  <td className="px-5 py-3 font-medium">
                    {p.discountType === "PERCENTAGE"
                      ? `${Number(p.discountValue)}%`
                      : `£${Number(p.discountValue).toFixed(2)}`}
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {p.usesCount}
                    {p.maxUses !== null && ` / ${p.maxUses}`}
                  </td>
                  <td className="px-5 py-3 text-[12px] text-muted">
                    {p.oncePerUser ? "Once per user · " : ""}
                    {p.minSubtotal ? `Min £${Number(p.minSubtotal).toFixed(2)} · ` : ""}
                    {p.expiresAt ? `Ends ${new Date(p.expiresAt).toLocaleDateString("en-GB")}` : "No expiry"}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => p.id && onToggle(p.id, !p.active)}
                      className={cn(
                        "inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full",
                        p.active ? "bg-emerald-50 text-emerald-700" : "bg-muted/10 text-muted"
                      )}
                    >
                      {p.active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {p.active ? "Active" : "Paused"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => setEditing(editing === p.id ? null : (p.id || null))}
                      className="text-[13px] text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> {editing === p.id ? "Close" : "Edit"}
                    </button>
                  </td>
                </tr>
                {editing === p.id && (
                  <tr>
                    <td colSpan={6} className="bg-muted/5 p-5">
                      <PromoForm initial={p} onDone={() => setEditing(null)} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {promos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-muted">
                  No promo codes yet. Click <span className="font-medium">New code</span> to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
