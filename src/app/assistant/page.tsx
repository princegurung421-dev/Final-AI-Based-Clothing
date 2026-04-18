// @ts-nocheck
"use client"

import * as React from "react"
import { useChat } from '@ai-sdk/react'
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowUp,
  Cloud,
  Sparkles,
  ShoppingBag,
  Package,
  TrendingUp,
  MessageCircle,
  X,
  Star,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  PanelLeftOpen,
  PanelLeftClose,
  Trash2,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const SESSION_API = '/api/chat/session'

// ─── Tool part state helpers (AI SDK v6) ─────────────────────

function toolOutput(part: any): any | null {
  if (!part) return null
  // v6 UIMessage: state progresses input-streaming → input-available → output-available
  if (part.state === 'output-available') return part.output ?? null
  // fallback for older shapes that used `result`
  if (part.state === 'result') return part.result ?? null
  return null
}

function isToolPending(part: any): boolean {
  if (!part) return false
  return ['input-streaming', 'input-available'].includes(part.state)
}

// ─── Size Picker ─────────────────────────────────────────────

function SizePicker({ sizes, productId, productName, onAdd }: {
  sizes: string[]
  productId: string
  productName: string
  onAdd: (productId: string, size: string, productName: string) => void
}) {
  const [open, setOpen] = React.useState(false)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-auto block w-full text-center text-[11px] font-bold uppercase tracking-wider py-2.5 bg-primary/5 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
      >
        Add to Bag
      </button>
    )
  }

  return (
    <div className="mt-auto">
      <p className="text-[10px] uppercase tracking-wider text-muted mb-1.5">Select size</p>
      <div className="flex flex-wrap gap-1">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => { onAdd(productId, size, productName); setOpen(false) }}
            className="text-[11px] font-medium px-2.5 py-1.5 border border-border rounded-md hover:border-primary hover:text-primary transition-colors"
          >
            {size}
          </button>
        ))}
      </div>
      <button onClick={() => setOpen(false)} className="text-[10px] text-muted mt-1.5 hover:text-foreground">Cancel</button>
    </div>
  )
}

// ─── Status Badge ────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: any }> = {
    PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock },
    PROCESSING: { bg: 'bg-blue-50', text: 'text-blue-700', icon: Package },
    SHIPPED: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: Truck },
    DELIVERED: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle },
  }
  const c = config[status] || config.PENDING
  const Icon = c.icon
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full', c.bg, c.text)}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  )
}

// ─── Main Page ───────────────────────────────────────────────

export default function AssistantPage() {
  const searchParams = useSearchParams()
  const [typingValue, setTypingValue] = React.useState("")
  const [currentCoordinates, setCurrentCoordinates] = React.useState<{ latitude: number; longitude: number } | null>(null)
  const [addingToCart, setAddingToCart] = React.useState<string | null>(null)
  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [sessions, setSessions] = React.useState<any[]>([])
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [loadingSession, setLoadingSession] = React.useState(false)
  const [hasLoadedSessions, setHasLoadedSessions] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null)
  const hasSentInitialQuery = React.useRef(false)
  const saveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const { messages, sendMessage, status, setMessages } = useChat({
    id: "wearwise-assistant",
    api: '/api/chat',
    onError: (err) => console.error("AI Chat Error:", err),
  })

  const isLoading = status !== 'ready' && status !== 'error'
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ── Load sessions list ──────────────────────────────────
  const refreshSessions = React.useCallback(async () => {
    try {
      const res = await fetch(SESSION_API, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions || [])
      }
    } catch { /* ignore */ }
  }, [])

  React.useEffect(() => {
    (async () => {
      await refreshSessions()
      setHasLoadedSessions(true)
    })()

    // Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentCoordinates({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => { /* ignore */ },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      )
    }
  }, [refreshSessions])

  // ── Load specific session by id ─────────────────────────
  const loadSession = async (id: string) => {
    if (id === sessionId) { setSidebarOpen(false); return }
    setLoadingSession(true)
    try {
      const res = await fetch(`${SESSION_API}/${id}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
        setSessionId(id)
        setSidebarOpen(false)
      }
    } catch { /* ignore */ } finally {
      setLoadingSession(false)
    }
  }

  // ── Start new chat ──────────────────────────────────────
  const newChat = () => {
    setMessages([])
    setSessionId(null)
    setTypingValue("")
    setSidebarOpen(false)
    hasSentInitialQuery.current = false
  }

  // ── Delete a session (two-step — no browser confirm dialog) ─
  const askDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmDelete(id)
  }

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmDelete(null)
  }

  const confirmDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmDelete(null)
    try {
      await fetch(`${SESSION_API}/${id}`, { method: 'DELETE' })
      if (id === sessionId) newChat()
      await refreshSessions()
    } catch { /* ignore */ }
  }

  // ── Debounced save after each assistant turn ────────────
  React.useEffect(() => {
    if (!hasLoadedSessions || messages.length === 0) return
    // Only save after an assistant response lands (status back to ready)
    if (status !== 'ready') return
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(SESSION_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages, sessionId }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.sessionId && data.sessionId !== sessionId) {
            setSessionId(data.sessionId)
          }
          await refreshSessions()
        }
      } catch { /* ignore */ }
    }, 800)
  }, [messages, status, hasLoadedSessions, sessionId, refreshSessions])

  // ── Auto-send from ?q= param ────────────────────────────
  React.useEffect(() => {
    if (!hasLoadedSessions || hasSentInitialQuery.current) return
    const q = searchParams.get('q')
    if (q && q.trim()) {
      hasSentInitialQuery.current = true
      setTimeout(() => {
        const body: any = {}
        if (currentCoordinates) Object.assign(body, currentCoordinates)
        sendMessage({ text: q.trim() }, Object.keys(body).length > 0 ? { body } : undefined)
      }, 300)
    }
  }, [hasLoadedSessions, searchParams])

  // ── Dispatch cart:updated on cart mutations ─────────────
  React.useEffect(() => {
    const lastMsg = messages[messages.length - 1]
    if (!lastMsg || lastMsg.role !== 'assistant') return
    const hasCartAction = lastMsg.parts?.some((p: any) => {
      if (!p.type?.startsWith?.('tool-')) return false
      const out = toolOutput(p)
      return out?.type === 'cartAction'
    })
    if (hasCartAction) {
      window.dispatchEvent(new Event("cart:updated"))
    }
  }, [messages])

  const QUICK_PROMPTS = [
    { text: "Show me what's trending right now", icon: <TrendingUp className="w-4 h-4 text-primary" /> },
    { text: "Find me a date night outfit under £200", icon: <Sparkles className="w-4 h-4 text-primary" /> },
    { text: "What should I wear based on today's weather?", icon: <Cloud className="w-4 h-4 text-primary" /> },
    { text: "Show me what's in my bag", icon: <ShoppingBag className="w-4 h-4 text-primary" /> },
    { text: "I need a smart casual outfit for work", icon: <Package className="w-4 h-4 text-primary" /> },
    { text: "Track my recent orders", icon: <Truck className="w-4 h-4 text-primary" /> },
  ]

  const onSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const content = typingValue.trim()
    if (!content || isLoading) return
    setTypingValue("")
    try {
      const body: any = {}
      if (currentCoordinates) Object.assign(body, currentCoordinates)
      await sendMessage({ text: content }, Object.keys(body).length > 0 ? { body } : undefined)
    } catch (error) {
      console.error("Failed to send:", error)
      setTypingValue(content)
    }
  }

  const handleAddToCart = async (productId: string, size: string, productName: string) => {
    setAddingToCart(productId + size)
    try {
      const res = await fetch('/api/chat/cart-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', productId, size }),
      })
      const data = await res.json()
      if (data.success) {
        window.dispatchEvent(new Event("cart:updated"))
        await sendMessage({ text: `I just added ${productName} (size ${size}) to my bag.` })
      } else {
        await sendMessage({ text: `I tried to add ${productName} to my bag but got an error: ${data.error}` })
      }
    } catch { /* ignore */ } finally {
      setAddingToCart(null)
    }
  }

  // ─── Tool result renderers ─────────────────────────────

  const renderProductGrid = (items: any[], heading?: string) => {
    if (!items || items.length === 0) return <p className="text-muted text-[13px] italic my-4">No matching items found.</p>

    return (
      <div className="my-6">
        {heading && <p className="text-[12px] uppercase tracking-widest font-bold text-muted/60 mb-4">{heading}</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((item: any) => (
            <div key={item.id} className="group flex flex-col bg-white border border-border/60 rounded-xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300">
              <Link href={`/product/${item.id}`} className="aspect-[4/5] bg-[#f5f5f3] relative overflow-hidden block">
                {item.image && <img src={item.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={item.name} />}
              </Link>
              <div className="p-3 flex flex-col flex-grow">
                <Link href={`/product/${item.id}`} className="text-[13px] font-medium text-foreground truncate mb-0.5 hover:text-primary transition-colors">{item.name}</Link>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[13px] text-muted">£{Number(item.price).toFixed(2)}</span>
                  {item.rating > 0 && (
                    <span className="flex items-center gap-0.5 text-[11px] text-muted">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {item.rating}
                    </span>
                  )}
                </div>
                {item.sizes && item.sizes.length > 0 ? (
                  <SizePicker
                    sizes={item.sizes}
                    productId={item.id}
                    productName={item.name}
                    onAdd={handleAddToCart}
                  />
                ) : (
                  <Link
                    href={`/product/${item.id}`}
                    className="mt-auto block text-center text-[11px] font-bold uppercase tracking-wider py-2.5 bg-primary/5 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                  >
                    View Details
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderCartSummary = (cart: any) => {
    if (!cart.items || cart.items.length === 0) {
      return <p className="text-muted text-[14px] my-4">Your bag is empty. Ask me to find something for you.</p>
    }
    return (
      <div className="my-6 border border-border/60 rounded-xl overflow-hidden">
        <div className="bg-[#f9f8f6] px-4 py-3 border-b border-border/40">
          <p className="text-[12px] uppercase tracking-widest font-bold text-muted/60">Your Bag ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})</p>
        </div>
        <div className="divide-y divide-border/30">
          {cart.items.map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              {item.image && <img src={item.image} className="w-12 h-12 rounded-lg object-cover bg-[#f5f5f3]" alt={item.name} />}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate">{item.name}</p>
                <p className="text-[12px] text-muted">Size {item.size} x {item.quantity}</p>
              </div>
              <p className="text-[13px] font-medium">£{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 bg-[#f9f8f6] border-t border-border/40 space-y-1">
          <div className="flex justify-between text-[12px] text-muted">
            <span>Subtotal</span><span>£{cart.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[12px] text-muted">
            <span>Delivery</span><span>{cart.deliveryCost === 0 ? 'Free' : `£${cart.deliveryCost.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between text-[14px] font-semibold pt-1 border-t border-border/30">
            <span>Total</span><span>£{cart.total.toFixed(2)}</span>
          </div>
        </div>
        <div className="px-4 py-3">
          <Link href="/checkout" className="block w-full text-center text-[12px] font-bold uppercase tracking-wider py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    )
  }

  const renderOrderList = (data: any) => {
    if (!data.orders || data.orders.length === 0) {
      return <p className="text-muted text-[14px] my-4">No orders yet. Let me help you find something.</p>
    }
    return (
      <div className="my-6 space-y-3">
        <p className="text-[12px] uppercase tracking-widest font-bold text-muted/60">Your Orders</p>
        {data.orders.map((order: any) => (
          <div key={order.orderNumber} className="border border-border/60 rounded-xl overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold">{order.orderNumber}</p>
                <p className="text-[12px] text-muted">{order.date} · {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-[14px] font-semibold">£{Number(order.total).toFixed(2)}</p>
                <StatusBadge status={order.status} />
              </div>
            </div>
            {order.trackingNumber && (
              <div className="px-4 pb-3">
                <p className="text-[11px] text-muted">Tracking: <span className="font-medium text-foreground">{order.trackingNumber}</span></p>
              </div>
            )}
            <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
              {order.items.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-2 shrink-0 bg-[#f9f8f6] rounded-lg px-3 py-2">
                  {item.image && <img src={item.image} className="w-8 h-8 rounded object-cover" alt={item.name} />}
                  <div>
                    <p className="text-[11px] font-medium truncate max-w-[120px]">{item.name}</p>
                    <p className="text-[10px] text-muted">Size {item.size} x{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderCartAction = (data: any) => (
    <div className={cn("my-4 flex items-center gap-3 p-4 rounded-xl border", data.action === 'added' ? 'bg-emerald-50/50 border-emerald-200/60' : 'bg-amber-50/50 border-amber-200/60')}>
      {data.action === 'added' ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> : <X className="w-5 h-5 text-amber-600 shrink-0" />}
      <div className="flex-1">
        <p className="text-[13px] font-medium">{data.message}</p>
        {data.product && (
          <div className="flex items-center gap-2 mt-2">
            {data.product.image && <img src={data.product.image} className="w-10 h-10 rounded-lg object-cover" alt="" />}
            <div>
              <p className="text-[12px]">{data.product.name}</p>
              <p className="text-[11px] text-muted">Size {data.product.size} · £{data.product.price?.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
      <Link href="/cart" className="text-[11px] font-bold uppercase tracking-wider text-primary hover:text-primary/80">View Bag</Link>
    </div>
  )

  const renderAuthRequired = (data: any) => (
    <div className="my-4 flex items-center gap-3 p-4 rounded-xl bg-amber-50/50 border border-amber-200/60">
      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
      <p className="text-[13px] flex-1">{data.error}</p>
      <Link href="/login" className="text-[11px] font-bold uppercase tracking-wider text-primary hover:text-primary/80">Sign In</Link>
    </div>
  )

  const renderError = (data: any) => (
    <div className="my-3 text-[12px] text-error bg-error/5 p-3 rounded-xl">{data.error}</div>
  )

  // ─── Tool part dispatcher ────────────────────────────────

  const renderToolPart = (part: any) => {
    if (isToolPending(part)) {
      return (
        <div className="flex items-center gap-3 py-3 text-muted/60 italic text-[13px]">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
          Looking that up…
        </div>
      )
    }

    const output = toolOutput(part)
    if (!output) return null

    switch (output.type) {
      case 'products':        return renderProductGrid(output.items, 'From the Store')
      case 'trending':        return renderProductGrid(output.items, 'Trending Now')
      case 'recommendations': return renderProductGrid(output.items, 'Recommended for You')
      case 'productDetail':   return renderProductGrid([output.product], 'Product Details')
      case 'cart':            return renderCartSummary(output)
      case 'cartAction':      return renderCartAction(output)
      case 'orders':          return renderOrderList(output)
      case 'orderDetail':     return renderOrderList({ orders: [output.order] })
      case 'authRequired':    return renderAuthRequired(output)
      case 'error':           return renderError(output)
      case 'styleContext':    return null
      default:                return null
    }
  }

  const renderMessageParts = (message: any) => {
    const parts = message.parts
    if (parts && parts.length > 0) {
      return parts.map((part: any, index: number) => {
        if (part.type === 'text') {
          const paragraphs = (part.text || '').split('\n\n').filter(Boolean)
          if (paragraphs.length <= 1) {
            return <span key={index} className="whitespace-pre-wrap">{part.text}</span>
          }
          return (
            <div key={index} className="space-y-2">
              {paragraphs.map((p: string, i: number) => (
                <p key={i} className="whitespace-pre-wrap">{p}</p>
              ))}
            </div>
          )
        }
        if (typeof part.type === 'string' && part.type.startsWith('tool-')) {
          return <div key={index} className="w-full">{renderToolPart(part)}</div>
        }
        return null
      })
    }
    if (message.content) {
      return <span className="whitespace-pre-wrap">{message.content}</span>
    }
    return null
  }

  // ─── Render ──────────────────────────────────────────────

  const activeSessionBadge = sessions.find(s => s.id === sessionId)?.title

  return (
    <div className="flex h-full min-h-0 max-h-[calc(100dvh-64px)] md:max-h-[calc(100dvh-92px)] bg-[#FAFAF9] text-[#1C1C1A]">

      {/* ── Sidebar backdrop (mobile) ── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "shrink-0 bg-white border-r border-border/50 flex flex-col min-h-0",
          "w-[280px]",
          "fixed lg:static top-0 left-0 bottom-0 z-50 h-full",
          "transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <p className="text-[11px] uppercase tracking-widest font-semibold text-muted">Chats</p>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-muted/10"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 border-b border-border/40">
          <button
            onClick={newChat}
            className="flex items-center justify-center gap-2 w-full h-10 bg-primary text-white rounded-xl text-[13px] font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {sessions.length === 0 && (
            <p className="px-3 py-6 text-[12px] text-muted italic text-center">
              No conversations yet.
              <br />Start chatting to build history.
            </p>
          )}
          {sessions.map(s => {
            const active = s.id === sessionId
            const isConfirming = confirmDelete === s.id
            return (
              <div
                key={s.id}
                className={cn(
                  "group w-full rounded-lg transition-colors",
                  active ? "bg-primary/10" : "hover:bg-muted/5",
                )}
              >
                {isConfirming ? (
                  <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                    <p className="text-[12px] font-medium text-foreground truncate flex-1">Delete this chat?</p>
                    <button
                      onClick={(e) => cancelDelete(e)}
                      className="text-[11px] px-2 py-1 text-muted hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={(e) => confirmDeleteSession(s.id, e)}
                      className="text-[11px] px-2 py-1 bg-error text-white rounded hover:bg-error/90 transition-colors font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => loadSession(s.id)}
                    className="w-full text-left px-3 py-2.5 flex items-start gap-2"
                  >
                    <MessageCircle className={cn("w-3.5 h-3.5 shrink-0 mt-0.5", active ? "text-primary" : "text-muted")} />
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-[13px] truncate", active ? "font-semibold text-primary" : "font-medium text-foreground")}>{s.title}</p>
                      {s.preview && (
                        <p className="text-[11px] text-muted truncate mt-0.5">{s.preview}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => askDelete(s.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-error/10 rounded text-muted hover:text-error shrink-0"
                      aria-label="Delete chat"
                      type="button"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Mobile toolbar */}
        <div className="lg:hidden shrink-0 flex items-center gap-2 px-4 py-2 border-b border-border/40 bg-white">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded hover:bg-muted/10"
            aria-label="Open sidebar"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
          <p className="text-[13px] font-medium truncate flex-1">
            {activeSessionBadge || "New chat"}
          </p>
          <button
            onClick={newChat}
            className="p-1.5 rounded hover:bg-muted/10"
            aria-label="New chat"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Messages (the ONLY scroll container) */}
        <main className="flex-1 min-h-0 overflow-y-auto pt-6 no-scrollbar flex flex-col items-center">
          <div className="w-full max-w-2xl px-6 flex flex-col gap-8">
            {loadingSession && (
              <div className="flex items-center justify-center py-12 text-muted text-[13px] gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading conversation…
              </div>
            )}

            {!loadingSession && messages.length === 0 && (
              <div className="mt-8 mb-12 px-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold uppercase tracking-wider mb-5">
                  <Sparkles className="w-3 h-3" />
                  AI Stylist
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1] mb-4">
                  Your personal stylist.
                </h1>
                <p className="text-[16px] text-muted leading-relaxed max-w-lg mb-10">
                  Shop, get outfit ideas, and track orders — all through conversation.
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  {QUICK_PROMPTS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTypingValue(p.text)}
                      className="flex items-center justify-between group p-4 border border-border/60 bg-white rounded-xl hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 text-left"
                    >
                      <span className="text-[13px] font-medium group-hover:text-primary transition-colors">{p.text}</span>
                      <div className="opacity-30 group-hover:opacity-100 transition-opacity ml-2 shrink-0">{p.icon}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex flex-col group",
                  m.role === 'user' ? 'items-end' : 'items-start'
                )}
              >
                {m.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 pl-1">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[12px] font-medium text-muted">WearWise AI</span>
                  </div>
                )}
                <div className={cn(
                  "max-w-[95%] md:max-w-[90%] text-[15px] leading-[1.7]",
                  m.role === 'user'
                    ? "bg-gradient-to-br from-primary to-primary-dark text-white px-5 py-3.5 rounded-2xl rounded-tr-[4px] shadow-lg shadow-primary/15"
                    : "bg-white text-foreground relative px-5 py-4 rounded-2xl rounded-tl-[4px] border border-border/40 shadow-sm"
                )}>
                  {renderMessageParts(m)}
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shrink-0">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <div className="px-5 py-4 bg-white rounded-2xl rounded-tl-[4px] border border-border/40 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-6" />
          </div>
        </main>

        {/* Input (stays put — not sticky, the flex layout pins it) */}
        <footer className="shrink-0 px-6 py-4 md:px-10 md:pb-6 border-t border-border/40 bg-[#FAFAF9]">
          <div className="max-w-2xl mx-auto relative">
            <form
              onSubmit={onSendMessage}
              className="relative flex items-center bg-white border border-border/60 rounded-full h-14 pl-6 pr-14 shadow-lg shadow-black/[0.03] focus-within:border-primary/40 focus-within:shadow-xl focus-within:shadow-primary/5 transition-all duration-300"
            >
              <input
                className="w-full bg-transparent border-none text-[15px] outline-none placeholder:text-muted/40 text-foreground"
                placeholder="Ask me anything about fashion..."
                value={typingValue}
                onChange={(e) => setTypingValue(e.target.value)}
                autoComplete="off"
                suppressHydrationWarning
              />
              <button
                type="submit"
                disabled={!typingValue.trim() || isLoading}
                className="absolute right-2 w-10 h-10 bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center rounded-full disabled:opacity-0 disabled:scale-90 transition-all duration-500 hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </form>
          </div>
        </footer>
      </div>
    </div>
  )
}
