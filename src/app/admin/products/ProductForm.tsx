"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { cn } from "@/lib/utils"
import { X, Plus, Trash2, Star, ArrowLeft } from "lucide-react"
import { createProduct, updateProduct, deleteProduct } from "./actions"

const CATEGORIES = ["Outerwear", "Tops", "Trousers", "Dresses", "Footwear", "Accessories", "Knitwear", "Activewear", "Suits", "Loungewear"]
const OCCASIONS = ["Work", "Casual", "Weekend", "Date Night", "Formal", "Holiday", "Gym", "Brunch", "Evening", "Smart Casual", "Active"]
const WEATHER = ["Cold", "Mild", "Warm", "Hot", "Rainy"]
const SEASONS = ["Spring/Summer", "Autumn/Winter", "All year"]

type ImageInput = { url: string; isPrimary: boolean }
type StockInput = { size: string; quantity: number }

export interface ProductFormData {
  id?: string
  name: string
  description: string
  category: string
  price: number
  salePrice: number | null
  colourName: string
  colourHex: string
  occasions: string[]
  weather: string[]
  season: string[]
  isVisible: boolean
  images: ImageInput[]
  stock: StockInput[]
}

const defaultForm: ProductFormData = {
  name: "",
  description: "",
  category: "Tops",
  price: 0,
  salePrice: null,
  colourName: "",
  colourHex: "#000000",
  occasions: [],
  weather: [],
  season: [],
  isVisible: true,
  images: [],
  stock: [],
}

export function ProductForm({ initial }: { initial?: ProductFormData }) {
  const router = useRouter()
  const [form, setForm] = React.useState<ProductFormData>(initial || defaultForm)
  const [error, setError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [newImageUrl, setNewImageUrl] = React.useState("")
  const [newSize, setNewSize] = React.useState("")
  const [newQty, setNewQty] = React.useState(0)

  const isEdit = Boolean(initial?.id)

  const toggleArrayField = (field: "occasions" | "weather" | "season", value: string) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter(v => v !== value) : [...f[field], value],
    }))
  }

  const addImage = () => {
    const url = newImageUrl.trim()
    if (!url) return
    setForm(f => ({
      ...f,
      images: [...f.images, { url, isPrimary: f.images.length === 0 }],
    }))
    setNewImageUrl("")
  }

  const removeImage = (i: number) => {
    setForm(f => {
      const next = f.images.filter((_, idx) => idx !== i)
      if (!next.some(img => img.isPrimary) && next.length > 0) next[0].isPrimary = true
      return { ...f, images: next }
    })
  }

  const setPrimary = (i: number) => {
    setForm(f => ({ ...f, images: f.images.map((img, idx) => ({ ...img, isPrimary: idx === i })) }))
  }

  const addStock = () => {
    const size = newSize.trim()
    if (!size) return
    if (form.stock.some(s => s.size === size)) {
      setError(`Size "${size}" already exists.`)
      return
    }
    setForm(f => ({ ...f, stock: [...f.stock, { size, quantity: Number(newQty) || 0 }] }))
    setNewSize("")
    setNewQty(0)
    setError(null)
  }

  const updateStockQty = (i: number, qty: number) => {
    setForm(f => ({ ...f, stock: f.stock.map((s, idx) => (idx === i ? { ...s, quantity: qty } : s)) }))
  }

  const removeStock = (i: number) => {
    setForm(f => ({ ...f, stock: f.stock.filter((_, idx) => idx !== i) }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    setSaved(false)

    const fd = new FormData()
    fd.append("name", form.name)
    fd.append("description", form.description)
    fd.append("category", form.category)
    fd.append("price", String(form.price))
    if (form.salePrice !== null) fd.append("salePrice", String(form.salePrice))
    fd.append("colourName", form.colourName)
    fd.append("colourHex", form.colourHex)
    fd.append("occasions", JSON.stringify(form.occasions))
    fd.append("weather", JSON.stringify(form.weather))
    fd.append("season", JSON.stringify(form.season))
    fd.append("isVisible", String(form.isVisible))
    fd.append("images", JSON.stringify(form.images))
    fd.append("stock", JSON.stringify(form.stock))

    try {
      let res: any
      if (isEdit && initial?.id) {
        res = await updateProduct(initial.id, fd)
      } else {
        res = await createProduct(fd)
      }
      if (res?.error) {
        setError(res.error)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
        router.refresh()
      }
    } catch (e: any) {
      if (e?.message?.includes("NEXT_REDIRECT")) throw e
      setError(e?.message || "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async () => {
    if (!initial?.id) return
    if (!confirm(`Delete "${form.name}"? It will be hidden from the store.`)) return
    await deleteProduct(initial.id)
    router.push("/admin/products")
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 rounded-lg hover:bg-muted/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-medium tracking-tight">{isEdit ? `Edit: ${form.name || "Product"}` : "New Product"}</h1>
        </div>
        <div className="flex items-center gap-3">
          {isEdit && (
            <button type="button" onClick={onDelete} className="flex items-center gap-2 text-[13px] text-error hover:underline">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : saved ? "Saved" : isEdit ? "Save changes" : "Create product"}
          </Button>
        </div>
      </div>

      {error && <div className="p-3 text-[13px] text-error bg-error/5 rounded-lg">{error}</div>}
      {saved && !error && <div className="p-3 text-[13px] text-success bg-success/5 rounded-lg">Saved successfully.</div>}

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 space-y-5">
          <h2 className="text-[11px] uppercase tracking-widest font-semibold text-muted">Basics</h2>

          <Input label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />

          <div>
            <label className="text-[13px] font-medium text-foreground mb-1.5 block">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 text-[14px] border border-border rounded-lg bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-colors resize-y"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[13px] font-medium text-foreground mb-1.5 block">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full h-10 px-3 text-[14px] border border-border rounded-lg bg-white focus:border-primary outline-none"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="text-[13px] font-medium text-foreground mb-1.5 block">Colour name</label>
                <input
                  type="text"
                  value={form.colourName}
                  onChange={e => setForm(f => ({ ...f, colourName: e.target.value }))}
                  className="w-full h-10 px-3 text-[14px] border border-border rounded-lg focus:border-primary outline-none"
                  placeholder="e.g. Navy"
                />
              </div>
              <input
                type="color"
                value={form.colourHex}
                onChange={e => setForm(f => ({ ...f, colourHex: e.target.value }))}
                className="h-10 w-10 border border-border rounded-lg cursor-pointer shrink-0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[13px] font-medium text-foreground mb-1.5 block">Price (£)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                className="w-full h-10 px-3 text-[14px] border border-border rounded-lg focus:border-primary outline-none"
                required
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-foreground mb-1.5 block">Sale price (£) <span className="text-muted">(optional)</span></label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.salePrice ?? ""}
                onChange={e => setForm(f => ({ ...f, salePrice: e.target.value === "" ? null : Number(e.target.value) }))}
                className="w-full h-10 px-3 text-[14px] border border-border rounded-lg focus:border-primary outline-none"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-[14px]">
            <input
              type="checkbox"
              checked={form.isVisible}
              onChange={e => setForm(f => ({ ...f, isVisible: e.target.checked }))}
              className="w-4 h-4 accent-primary"
            />
            Visible in storefront
          </label>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-[11px] uppercase tracking-widest font-semibold text-muted">Attributes</h2>

          <div>
            <p className="text-[13px] font-medium mb-2">Occasions</p>
            <div className="flex flex-wrap gap-1.5">
              {OCCASIONS.map(o => (
                <button
                  type="button"
                  key={o}
                  onClick={() => toggleArrayField("occasions", o)}
                  className={cn(
                    "px-3 py-1.5 text-[12px] font-medium rounded-full border transition-colors",
                    form.occasions.includes(o)
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border hover:border-muted",
                  )}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[13px] font-medium mb-2">Weather</p>
            <div className="flex flex-wrap gap-1.5">
              {WEATHER.map(w => (
                <button
                  type="button"
                  key={w}
                  onClick={() => toggleArrayField("weather", w)}
                  className={cn(
                    "px-3 py-1.5 text-[12px] font-medium rounded-full border transition-colors",
                    form.weather.includes(w)
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border hover:border-muted",
                  )}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[13px] font-medium mb-2">Season</p>
            <div className="flex flex-wrap gap-1.5">
              {SEASONS.map(s => (
                <button
                  type="button"
                  key={s}
                  onClick={() => toggleArrayField("season", s)}
                  className={cn(
                    "px-3 py-1.5 text-[12px] font-medium rounded-full border transition-colors",
                    form.season.includes(s)
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border hover:border-muted",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] uppercase tracking-widest font-semibold text-muted">Images</h2>
            <span className="text-[12px] text-muted">{form.images.length} image{form.images.length === 1 ? "" : "s"}</span>
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={e => setNewImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/…"
              className="flex-1 h-10 px-3 text-[14px] border border-border rounded-lg focus:border-primary outline-none"
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addImage() } }}
            />
            <Button type="button" variant="secondary" onClick={addImage}>
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>

          {form.images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {form.images.map((img, i) => (
                <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted/5">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  {img.isPrimary && (
                    <span className="absolute top-1.5 left-1.5 text-[10px] font-bold uppercase tracking-wider bg-primary text-white px-2 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    {!img.isPrimary && (
                      <button type="button" onClick={() => setPrimary(i)} className="bg-white p-1.5 rounded-full shadow" title="Set as primary">
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button type="button" onClick={() => removeImage(i)} className="bg-white p-1.5 rounded-full shadow text-error" title="Remove">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-muted italic">No images yet. Paste an image URL above to add one.</p>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-[11px] uppercase tracking-widest font-semibold text-muted">Stock by size</h2>

          {form.stock.length > 0 ? (
            <div className="space-y-2">
              {form.stock.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-16 text-center px-2 py-1.5 text-[13px] font-bold uppercase border border-border rounded bg-muted/5">
                    {s.size}
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={s.quantity}
                    onChange={e => updateStockQty(i, Number(e.target.value) || 0)}
                    className="flex-1 h-9 px-3 text-[13px] border border-border rounded-lg focus:border-primary outline-none"
                  />
                  <button type="button" onClick={() => removeStock(i)} className="p-1.5 text-error hover:bg-error/5 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-muted italic">No sizes. Add one below.</p>
          )}

          <div className="flex items-end gap-2 pt-2 border-t border-border/50">
            <div className="w-20">
              <label className="text-[11px] text-muted block mb-1">Size</label>
              <input
                type="text"
                value={newSize}
                onChange={e => setNewSize(e.target.value)}
                placeholder="M"
                className="w-full h-9 px-2 text-[13px] border border-border rounded focus:border-primary outline-none text-center font-bold uppercase"
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addStock() } }}
              />
            </div>
            <div className="flex-1">
              <label className="text-[11px] text-muted block mb-1">Qty</label>
              <input
                type="number"
                min="0"
                value={newQty}
                onChange={e => setNewQty(Number(e.target.value) || 0)}
                className="w-full h-9 px-3 text-[13px] border border-border rounded focus:border-primary outline-none"
              />
            </div>
            <Button type="button" variant="secondary" onClick={addStock}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </form>
  )
}
