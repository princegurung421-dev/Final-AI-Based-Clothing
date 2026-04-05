"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { updateCartQuantity, removeCartItem, syncPendingCart } from "./actions"
import { useToast } from "@/components/ui/Toast"
import { Minus, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function CartClient({ initialItems, upsellProducts }: { initialItems: any[], upsellProducts: any[] }) {
  const [items, setItems] = React.useState(initialItems)
  const [promoCode, setPromoCode] = React.useState("")
  const [promoMessage, setPromoMessage] = React.useState("")
  const { addToast } = useToast()
  const router = useRouter()

  React.useEffect(() => {
    // Process pending items from before login
    const pending = localStorage.getItem('pendingCartItem')
    if (pending) {
      const { productId, size } = JSON.parse(pending)
      syncPendingCart(productId, size).then(() => {
        localStorage.removeItem('pendingCartItem')
        window.dispatchEvent(new Event("cart:updated"))
        router.refresh()
      })
    }
  }, [router])

  const handleUpdateQty = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    
    // Optimistic update
    setItems(items.map(item => item.id === itemId ? { ...item, quantity: newQty } : item))
    
    const res = await updateCartQuantity(itemId, newQty)
    if (res.error) {
      addToast(res.error, "error")
      router.refresh() // Restore state if failed
    } else {
      window.dispatchEvent(new Event("cart:updated"))
    }
  }

  const handleRemove = async (itemId: string) => {
    // Optimistic
    setItems(items.filter(item => item.id !== itemId))
    
    const res = await removeCartItem(itemId)
    if (res.success) {
      addToast("Item removed", "info")
      window.dispatchEvent(new Event("cart:updated"))
    } else {
      addToast(res.error || "Failed to remove", "error")
      router.refresh()
    }
  }

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!promoCode.trim()) return
    
    if (promoCode.toUpperCase() === "WEARWISE10") {
      setPromoMessage("Code applied — 10% off")
    } else {
      setPromoMessage("Code not recognised")
    }
  }

  const subtotal = items.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0)
  const isPromoApplied = promoMessage.includes("applied")
  const discountedSubtotal = isPromoApplied ? subtotal * 0.9 : subtotal
  const delivery = discountedSubtotal > 50 ? 0 : 3.99
  const total = discountedSubtotal + (items.length > 0 ? delivery : 0)

  if (items.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-24 flex flex-col items-center justify-center flex-grow text-center">
        <h1 className="text-3xl font-medium tracking-tight mb-4">Your bag is empty.</h1>
        <p className="text-muted mb-8">Sign in to save items across your devices or explore our new arrivals.</p>
        <Link href="/browse">
          <Button>Continue shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col flex-grow">
      <h1 className="text-3xl font-medium tracking-tight mb-12">Bag</h1>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        {/* Left Column - Items */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex flex-col border-t border-border">
            {items.map(item => {
              const primaryImage = item.product.images?.find((i: any) => i.isPrimary) || item.product.images?.[0];
              const isOutOfStock = !item.product.stock || item.product.stock.every((s: any) => s.size === item.size && s.quantity === 0);

              return (
                <div key={item.id} className="flex gap-6 py-6 border-b border-border items-start relative">
                  <Link href={`/product/${item.product.id}`} className="shrink-0">
                    <div className="w-20 h-24 bg-muted/5 relative overflow-hidden">
                      {primaryImage && (
                        <img src={primaryImage.url} alt={item.product.name} className="w-full h-full object-cover" />
                      )}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
                          <span className="text-[10px] font-bold tracking-widest text-error rotate-[-20deg]">N/A</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <Link href={`/product/${item.product.id}`} className={cn("text-[15px] font-medium block mb-1 hover:text-primary transition-colors", isOutOfStock && "text-muted")}>
                          {item.product.name}
                        </Link>
                        <p className="text-[14px] text-muted mb-2">Size: {item.size}</p>
                      </div>
                      <p className={cn("text-[15px] font-medium", isOutOfStock && "text-muted")}>£{Number(item.product.price).toFixed(2)}</p>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4">
                      {/* Quantity Selector Pill */}
                      <div className="flex items-center rounded-full border border-border overflow-hidden">
                        <button 
                          onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isOutOfStock}
                          className="w-8 h-8 flex items-center justify-center text-muted hover:text-foreground disabled:opacity-30 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-[14px] font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                          disabled={isOutOfStock}
                          className="w-8 h-8 flex items-center justify-center text-muted hover:text-foreground disabled:opacity-30 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button 
                        onClick={() => handleRemove(item.id)}
                        className="text-[13px] text-muted hover:text-error transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    
                    {isOutOfStock && (
                       <p className="text-[13px] text-error mt-2 font-medium">No longer available</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* AI Upsell Strip */}
          {upsellProducts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <h3 className="text-[13px] font-medium text-muted uppercase tracking-wider mb-6">Complete your order</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                {upsellProducts.map(upsell => {
                  const ui = upsell.images?.find((img: any) => img.isPrimary) || upsell.images?.[0];
                  return (
                    <Card key={upsell.id} className="w-[160px] shrink-0 border-none shadow-none flex flex-col bg-transparent group">
                      <Link href={`/product/${upsell.id}`}>
                        <div className="aspect-[4/5] bg-muted/5 relative overflow-hidden mb-3">
                          {ui && <img src={ui.url} alt={upsell.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                        </div>
                      </Link>
                      <Link href={`/product/${upsell.id}`} className="text-[13px] font-medium line-clamp-1 hover:text-primary transition-colors">{upsell.name}</Link>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[13px] text-muted">£{Number(upsell.price).toFixed(2)}</span>
                        <button 
                          className="w-6 h-6 rounded-full bg-muted/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                          // For MVP, just redirect to detail page instead of complex inline add
                          onClick={() => router.push(`/product/${upsell.id}`)}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Summary */}
        <div className="w-full lg:w-[380px] shrink-0">
          <div className="sticky top-24 flex flex-col gap-8">
            <div>
              <h2 className="text-xl font-medium tracking-tight mb-6">Order Summary</h2>
              
              <div className="flex flex-col gap-4 text-[15px] mb-6">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span>£{subtotal.toFixed(2)}</span>
                </div>
                {isPromoApplied && (
                  <div className="flex justify-between text-success">
                    <span>Discount (10%)</span>
                    <span>-£{(subtotal * 0.1).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted">
                  <span>Delivery</span>
                  <span>{delivery === 0 ? "Free" : `£${delivery.toFixed(2)}`}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-lg font-medium pt-6 border-t border-border mb-6">
                <span>Total</span>
                <span>£{total.toFixed(2)}</span>
              </div>

              <Link href="/checkout" className="block w-full">
                <Button 
                  size="lg" 
                  className="w-full"
                  disabled={items.some(i => !i.product.stock || i.product.stock.every((s:any) => s.size === i.size && s.quantity === 0))}
                >
                  Checkout Securely
                </Button>
              </Link>
              
              <p className="text-[13px] text-muted text-center mt-4 px-8 leading-relaxed">
                Free returns within 28 days.
              </p>
            </div>

            {/* Promo Code */}
            <div className="pt-8 border-t border-border">
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Promo Code" 
                  className="h-10 border border-border flex-1 px-3 text-[14px] focus:outline-none focus:border-primary uppercase tracking-wider"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value)
                    setPromoMessage("")
                  }}
                />
                <Button type="submit" variant="secondary">Apply</Button>
              </form>
              {promoMessage && (
                <p className={cn(
                  "text-[13px] mt-2 font-medium",
                  promoMessage.includes("applied") ? "text-success" : "text-error"
                )}>
                  {promoMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
