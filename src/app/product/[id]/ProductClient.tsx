"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Modal } from "@/components/ui/Modal"
import { useToast } from "@/components/ui/Toast"
import { cn } from "@/lib/utils"
import { addCartItem } from "@/app/cart/actions"

export default function ProductClient({ 
  product, 
  relatedProducts, 
  user 
}: { 
  product: any, 
  relatedProducts: any[],
  user: any
}) {
  const router = useRouter()
  const { addToast } = useToast()
  
  // State
  const [activeImage, setActiveImage] = React.useState(product.images.find((i: any) => i.isPrimary) || product.images[0])
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null)
  const [sizeError, setSizeError] = React.useState(false)
  const [isLoginModalOpen, setLoginModalOpen] = React.useState(false)

  const parsedOccasions = (() => {
    try { return JSON.parse(product.occasions); } catch { return []; }
  })()

  // Calculate total stock remaining for this item across all sizes (for visual indicator logic)
  const getSelectedSizeStock = () => {
    if (!selectedSize) return null;
    const stockObj = product.stock.find((s: any) => s.size === selectedSize);
    return stockObj ? stockObj.quantity : 0;
  }

  const stockCount = getSelectedSizeStock();
  const isSelectedSizeOutOfStock = stockCount !== null && stockCount === 0;

  const handleAddToCart = async () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 500); // 150ms shake + reset
      return;
    }

    if (!user) {
      // Store pending in localStorage
      localStorage.setItem('pendingCartItem', JSON.stringify({
        productId: product.id,
        size: selectedSize
      }));
      setLoginModalOpen(true);
      return;
    }

    const result = await addCartItem(product.id, selectedSize)
    if (result.error) {
      addToast(result.error, "error")
      return
    }

    window.dispatchEvent(new Event("cart:updated"))
    addToast("Added to cart", "success")
  };

  const handleNotifyMe = () => {
    if (!user) {
      setLoginModalOpen(true);
      return;
    }
    addToast("We'll email you when this is back in stock.", "info");
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col flex-grow">
      {/* Breadcrumb */}
      <nav className="text-[13px] text-muted mb-8 flex gap-2">
        <Link href="/browse" className="hover:text-primary transition-colors">Shop</Link>
        <span>/</span>
        <Link href={`/browse?category=${product.category}`} className="hover:text-primary transition-colors">{product.category}</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 mb-24">
        
        {/* Left Column - Images */}
        <div className="flex flex-col gap-4 md:sticky md:top-24 self-start">
          <div className="aspect-square bg-muted/5 w-full relative">
            {activeImage && (
              <img 
                src={activeImage.url} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          {product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img: any) => (
                <button 
                  key={img.id}
                  onClick={() => setActiveImage(img)}
                  className={cn(
                    "w-20 h-20 shrink-0 bg-muted/5 border transition-all",
                    activeImage?.id === img.id ? "border-primary" : "border-transparent hover:border-muted/30"
                  )}
                >
                  <img src={img.url} alt="Thumbnail preview" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Info */}
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-medium tracking-tight mb-2">{product.name}</h1>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl text-primary font-medium">£{Number(product.price).toFixed(2)}</span>
            {product.salePrice && (
              <span className="text-lg text-muted line-through">£{Number(product.salePrice).toFixed(2)}</span>
            )}
          </div>

          <p className="text-[15px] leading-relaxed text-muted mb-8">
            {product.description}
          </p>

          {/* Occasion Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {parsedOccasions.map((tag: string) => (
              <span key={tag} className="text-muted bg-muted/10 px-3 py-1 rounded-full text-[13px]">
                {tag}
              </span>
            ))}
          </div>

          {/* AI Weather Tip - Simulated */}
          <div className="border border-border p-4 flex gap-3 mb-8 items-start bg-white">
            <div className="w-5 h-5 shrink-0 mt-0.5 text-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H11v1.81c-1.45.35-2.6 1.36-2.6 2.87 0 1.78 1.6 2.5 3.51 2.96 1.73.42 2.38 1.01 2.38 1.83 0 .84-.79 1.53-2.16 1.53-1.44 0-2.12-.76-2.17-1.8H8.25c.06 1.6 1.05 2.76 2.75 3.14V19h2v-1.82c1.65-.33 2.8-1.4 2.8-2.98 0-1.88-1.57-2.53-3.49-3.06z" /></svg>
            </div>
            <p className="text-[14px] leading-relaxed">
              <span className="font-medium text-primary block mb-1">Good for today</span>
              It's 11°C and overcast in your area. This item is suitable for current conditions.
            </p>
          </div>

          {/* Colour Info (If available) */}
          {product.colourName && (
            <div className="mb-8">
               <h3 className="text-[13px] font-medium text-muted uppercase tracking-wider mb-3">Colour: <span className="text-foreground capitalize normal-case">{product.colourName}</span></h3>
               <div 
                 className="w-8 h-8 rounded-full border border-border ring-2 ring-primary ring-offset-2"
                 style={{ backgroundColor: product.colourHex }}
                />
            </div>
          )}

          {/* Size Selector */}
          <div className="mb-8">
            <h3 className="text-[13px] font-medium text-muted uppercase tracking-wider mb-3 flex justify-between">
              <span>Select Size</span>
              {stockCount !== null && stockCount > 0 && stockCount <= 5 && (
                 <span className="text-error normal-case font-normal">Only {stockCount} left</span>
              )}
            </h3>
            
            <div className={cn("flex flex-wrap gap-3 transition-transform", sizeError && "animate-shake")}>
              {product.stock.map((stock: any) => {
                const isOutOfStock = stock.quantity === 0;
                const isSelected = selectedSize === stock.size;
                return (
                  <button
                    key={stock.id}
                    disabled={isOutOfStock}
                    onClick={() => {
                      setSelectedSize(stock.size);
                      setSizeError(false);
                    }}
                    className={cn(
                      "min-w-14 px-4 h-10 border text-[14px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      isSelected 
                        ? "border-primary bg-primary text-white" 
                        : "border-border bg-white text-foreground hover:border-muted",
                      isOutOfStock && "opacity-40 cursor-not-allowed bg-muted/10 text-muted line-through"
                    )}
                  >
                    {stock.size}
                  </button>
                )
              })}
            </div>
            {sizeError && (
              <p className="text-[13px] text-error mt-2 font-medium">Please select a size.</p>
            )}
          </div>

          {/* Add to Cart / Notify */}
          {isSelectedSizeOutOfStock ? (
            <Button size="lg" variant="secondary" className="w-full h-12" onClick={handleNotifyMe}>
              Notify me when back
            </Button>
          ) : (
            <Button size="lg" className="w-full h-12" onClick={handleAddToCart}>
              Add to Bag
            </Button>
          )}

          <p className="text-[13px] text-muted text-center mt-4">Free delivery on orders over £50.</p>
        </div>
      </div>

      {/* Complete the Outfit */}
      {relatedProducts.length > 0 && (
        <section className="mb-24 pt-12 border-t border-border">
          <h2 className="text-xl font-medium tracking-tight mb-8">Wear it with</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((relProduct) => {
              const primaryImage = relProduct.images?.find((img: any) => img.isPrimary) || relProduct.images?.[0];
              return (
                <Link key={relProduct.id} href={`/product/${relProduct.id}`} className="group block">
                  <div className="aspect-[4/5] relative mb-3 bg-muted/5 overflow-hidden">
                    {primaryImage && (
                      <img 
                        src={primaryImage.url} 
                        alt={relProduct.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 rounded-sm"
                      />
                    )}
                  </div>
                  <h3 className="font-medium text-[14px] mb-1">{relProduct.name}</h3>
                  <p className="text-[14px] text-muted">£{Number(relProduct.price).toFixed(2)}</p>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section className="pt-12 border-t border-border">
        <h2 className="text-xl font-medium tracking-tight mb-8">Reviews</h2>
        {product.reviews && product.reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {product.reviews.map((review: any) => (
              <div key={review.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1,2,3,4,5].map(star => (
                      <svg key={star} className={cn("w-4 h-4", star <= review.rating ? "text-primary" : "text-border")} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-[14px] font-medium">{review.reviewerName}</span>
                  <span className="text-[13px] text-muted ml-auto">
                    {new Date(review.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-[15px] leading-relaxed text-foreground mt-1">
                  "{review.text}"
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[15px] text-muted">No reviews yet.</p>
        )}
      </section>

      {/* Logic Modal */}
      <Modal 
        isOpen={isLoginModalOpen} 
        onClose={() => setLoginModalOpen(false)}
        title="Sign in to add items to your bag"
      >
        <div className="flex flex-col gap-4 mt-2">
          <Link href="/login" className="w-full">
            <Button className="w-full">Sign In</Button>
          </Link>
          <Link href="/register" className="w-full">
            <Button variant="secondary" className="w-full">Create an Account</Button>
          </Link>
        </div>
      </Modal>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.15s ease-in-out 3;
        }
      `}</style>
    </div>
  )
}
