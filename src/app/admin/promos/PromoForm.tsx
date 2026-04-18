"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { createPromo, updatePromo, deletePromo } from "./actions"
import { Trash2 } from "lucide-react"

export type PromoFormData = {
  id?: string
  code: string
  description: string
  discountType: "PERCENTAGE" | "FIXED"
  discountValue: number
  minSubtotal: number | null
  maxUses: number | null
  usesCount: number
  oncePerUser: boolean
  active: boolean
  expiresAt: string | null
}

export function PromoForm({
  initial,
  onDone,
}: {
  initial?: PromoFormData
  onDone?: () => void
}) {
  const router = useRouter()
  const isEdit = Boolean(initial?.id)
  const [form, setForm] = React.useState<PromoFormData>(
    initial || {
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: 5,
      minSubtotal: null,
      maxUses: null,
      usesCount: 0,
      oncePerUser: true,
      active: true,
      expiresAt: null,
    }
  )
  const [error, setError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const fd = new FormData()
    fd.append("code", form.code)
    fd.append("description", form.description)
    fd.append("discountType", form.discountType)
    fd.append("discountValue", String(form.discountValue))
    if (form.minSubtotal !== null) fd.append("minSubtotal", String(form.minSubtotal))
    if (form.maxUses !== null) fd.append("maxUses", String(form.maxUses))
    fd.append("oncePerUser", String(form.oncePerUser))
    fd.append("active", String(form.active))
    if (form.expiresAt) fd.append("expiresAt", form.expiresAt)

    try {
      const res = isEdit && initial?.id
        ? await updatePromo(initial.id, fd)
        : await createPromo(fd)
      if (res?.error) {
        setError(res.error)
      } else {
        router.refresh()
        onDone?.()
      }
    } catch (e: any) {
      setError(e?.message || "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async () => {
    if (!initial?.id) return
    if (!confirm(`Delete code "${form.code}"? Redemptions will be kept but the code won't work anymore.`)) return
    await deletePromo(initial.id)
    router.refresh()
    onDone?.()
  }

  return (
    <form onSubmit={submit} className="space-y-4 bg-white border border-border rounded-xl p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[13px] font-medium mb-1.5 block">Code</label>
          <input
            type="text"
            required
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            placeholder="FIRSTORDER"
            className="w-full h-10 px-3 text-[14px] font-mono tracking-wider border border-border rounded-lg focus:border-primary outline-none uppercase"
          />
        </div>
        <div>
          <label className="text-[13px] font-medium mb-1.5 block">Description <span className="text-muted">(internal)</span></label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full h-10 px-3 text-[14px] border border-border rounded-lg focus:border-primary outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-[13px] font-medium mb-1.5 block">Type</label>
          <select
            value={form.discountType}
            onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as any }))}
            className="w-full h-10 px-3 text-[14px] border border-border rounded-lg bg-white focus:border-primary outline-none"
          >
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED">Flat (£)</option>
          </select>
        </div>
        <div>
          <label className="text-[13px] font-medium mb-1.5 block">
            {form.discountType === "PERCENTAGE" ? "Off %" : "Off £"}
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={form.discountValue}
            onChange={(e) => setForm((f) => ({ ...f, discountValue: Number(e.target.value) }))}
            className="w-full h-10 px-3 text-[14px] border border-border rounded-lg focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="text-[13px] font-medium mb-1.5 block">Min. subtotal £</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.minSubtotal ?? ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                minSubtotal: e.target.value === "" ? null : Number(e.target.value),
              }))
            }
            placeholder="none"
            className="w-full h-10 px-3 text-[14px] border border-border rounded-lg focus:border-primary outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[13px] font-medium mb-1.5 block">
            Max uses <span className="text-muted">(total, blank = unlimited)</span>
          </label>
          <input
            type="number"
            min="1"
            value={form.maxUses ?? ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                maxUses: e.target.value === "" ? null : Number(e.target.value),
              }))
            }
            placeholder="unlimited"
            className="w-full h-10 px-3 text-[14px] border border-border rounded-lg focus:border-primary outline-none"
          />
          {isEdit && (
            <p className="text-[11px] text-muted mt-1">
              Used {form.usesCount} time{form.usesCount === 1 ? "" : "s"} so far
            </p>
          )}
        </div>
        <div>
          <label className="text-[13px] font-medium mb-1.5 block">Expires on</label>
          <input
            type="date"
            value={form.expiresAt ? form.expiresAt.slice(0, 10) : ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                expiresAt: e.target.value ? new Date(e.target.value).toISOString() : null,
              }))
            }
            className="w-full h-10 px-3 text-[14px] border border-border rounded-lg focus:border-primary outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-5 pt-2">
        <label className="flex items-center gap-2 text-[14px]">
          <input
            type="checkbox"
            checked={form.oncePerUser}
            onChange={(e) => setForm((f) => ({ ...f, oncePerUser: e.target.checked }))}
            className="w-4 h-4 accent-primary"
          />
          Once per user
        </label>
        <label className="flex items-center gap-2 text-[14px]">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            className="w-4 h-4 accent-primary"
          />
          Active
        </label>
      </div>

      {error && <div className="text-[13px] text-error bg-error/5 p-3 rounded-lg">{error}</div>}

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/50">
        {isEdit ? (
          <button
            type="button"
            onClick={onDelete}
            className="text-[13px] text-error hover:underline inline-flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-3">
          {onDone && (
            <button
              type="button"
              onClick={onDone}
              className="text-[13px] text-muted hover:text-foreground"
            >
              Cancel
            </button>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create code"}
          </Button>
        </div>
      </div>
    </form>
  )
}
