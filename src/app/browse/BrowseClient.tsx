"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/Card"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { cn } from "@/lib/utils"

const CATEGORIES = ["Tops", "Trousers", "Dresses", "Outerwear", "Footwear", "Accessories"]
const OCCASIONS = ["Work", "Casual", "Date Night", "Gym", "Smart Casual", "Weekend"]
const COLOURS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#111827" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Grey", hex: "#808080" },
  { name: "Sage", hex: "#4A7C59" },
  { name: "Brown", hex: "#8B4513" },
]

export default function BrowseClient({ initialProducts, initialCount }: { initialProducts: any[], initialCount: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false)
  
  // Real-time local state to avoid slow updates, syncs to URL
  const [filters, setFilters] = React.useState({
    q: searchParams.get("q") || "",
    category: searchParams.getAll("category"),
    occasion: searchParams.getAll("occasion"),
    colour: searchParams.getAll("colour"),
    inStock: searchParams.get("inStock") === "true",
    sort: searchParams.get("sort") || "newest"
  })

  // Debounced search and filter application
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams()
      
      if (filters.q) params.set("q", filters.q)
      filters.category.forEach(c => params.append("category", c))
      filters.occasion.forEach(o => params.append("occasion", o))
      filters.colour.forEach(c => params.append("colour", c))
      if (filters.inStock) params.set("inStock", "true")
      if (filters.sort !== "newest") params.set("sort", filters.sort)
      
      router.push(`/browse?${params.toString()}`, { scroll: false })
    }, 300)

    return () => clearTimeout(timer)
  }, [filters, router])

  const toggleArrayFilter = (key: keyof typeof filters, value: string) => {
    setFilters(prev => {
      const arr = prev[key] as string[];
      if (arr.includes(value)) {
        return { ...prev, [key]: arr.filter(v => v !== value) }
      } else {
        return { ...prev, [key]: [...arr, value] }
      }
    })
  }

  const clearAllFilters = () => {
    setFilters({
      q: "",
      category: [],
      occasion: [],
      colour: [],
      inStock: false,
      sort: "newest"
    })
  }

  const FilterContent = () => (
    <div className="flex flex-col gap-8 pb-20 md:pb-0">
      {/* Category */}
      <div>
        <h3 className="text-[13px] font-medium text-muted uppercase tracking-wider mb-4">Category</h3>
        <div className="flex flex-col gap-3">
          {CATEGORIES.map(category => (
            <label key={category} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 border-border rounded-sm text-primary focus:ring-primary focus:ring-offset-0"
                checked={filters.category.includes(category)}
                onChange={() => toggleArrayFilter("category", category)}
              />
              <span className="text-[14px] group-hover:text-primary transition-colors">{category}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="h-px bg-border w-full" />

      {/* Occasion */}
      <div>
        <h3 className="text-[13px] font-medium text-muted uppercase tracking-wider mb-4">Occasion</h3>
        <div className="flex flex-col gap-3">
          {OCCASIONS.map(occasion => (
            <label key={occasion} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 border-border rounded-sm text-primary focus:ring-primary focus:ring-offset-0"
                checked={filters.occasion.includes(occasion)}
                onChange={() => toggleArrayFilter("occasion", occasion)}
              />
              <span className="text-[14px] group-hover:text-primary transition-colors">{occasion}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="h-px bg-border w-full" />

      {/* Colour */}
      <div>
        <h3 className="text-[13px] font-medium text-muted uppercase tracking-wider mb-4">Colour</h3>
        <div className="flex flex-wrap gap-3">
          {COLOURS.map(colour => {
            const isSelected = filters.colour.includes(colour.name);
            return (
              <button
                key={colour.name}
                onClick={() => toggleArrayFilter("colour", colour.name)}
                className={cn(
                  "w-6 h-6 rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-center transition-all",
                  isSelected && "ring-2 ring-primary ring-offset-2"
                )}
                style={{ backgroundColor: colour.hex }}
                title={colour.name}
              >
                {isSelected && (
                  <div className={cn("w-2 h-2 rounded-full", colour.hex === "#FFFFFF" || colour.hex === "#F5F5DC" ? "bg-black" : "bg-white" )} />
                )}
              </button>
            )
          })}
        </div>
      </div>
      <div className="h-px bg-border w-full" />

      {/* Availability */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input 
            type="checkbox" 
            className="w-4 h-4 border-border rounded-sm text-primary focus:ring-primary focus:ring-offset-0"
            checked={filters.inStock}
            onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
          />
          <span className="text-[14px] group-hover:text-primary transition-colors font-medium">In stock only</span>
        </label>
      </div>

      <button 
        onClick={clearAllFilters}
        className="text-[13px] text-primary hover:underline text-left"
      >
        Clear all filters
      </button>
    </div>
  )

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col flex-grow">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-medium tracking-tight mb-2">Shop</h1>
        <p className="text-muted text-[15px]">{initialCount} items</p>
      </div>

      {/* Search Bar - Full width above layout */}
      <div className="w-full mb-8 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input 
          type="text"
          placeholder="Search products..."
          className="w-full h-12 bg-white border border-border pl-12 pr-4 outline-none focus:border-primary transition-colors rounded-none"
          value={filters.q}
          onChange={(e) => setFilters(prev => ({ ...prev, q: e.target.value }))}
        />
      </div>

      {filters.q && (
        <p className="mb-8 text-muted">
          {initialCount} results for '{filters.q}'
        </p>
      )}

      <div className="flex gap-12 relative flex-grow">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-[260px] shrink-0">
          <FilterContent />
        </aside>

        {/* Mobile Filter Drawer */}
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="absolute inset-0 bg-black/40 animate-in fade-in" onClick={() => setIsMobileFiltersOpen(false)} />
            <div className="relative w-[300px] bg-white h-full shadow-xl animate-in slide-in-from-left p-6 overflow-y-auto">
              <button 
                className="absolute right-4 top-4 text-muted"
                onClick={() => setIsMobileFiltersOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-medium mb-8 mt-2">Filters</h2>
              <FilterContent />
            </div>
          </div>
        )}

        {/* Main Grid Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Active clear + Sort */}
          <div className="flex justify-end items-center mb-6">
            <select
              value={filters.sort}
              onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
              className="bg-transparent border-none text-[14px] text-foreground focus:ring-0 outline-none cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {/* Grid */}
          {initialProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-12">
              {initialProducts.map((product) => {
                const primaryImage = product.images?.find((img: any) => img.isPrimary) || product.images?.[0];
                const secondaryImage = product.images?.find((img: any) => !img.isPrimary);
                const isSoldOut = !product.stock || product.stock.every((s: any) => s.quantity === 0);
                
                let parsedOccasions = [];
                try {
                  parsedOccasions = JSON.parse(product.occasions);
                } catch (e) {}

                return (
                  <Link key={product.id} href={`/product/${product.id}`} className="group block">
                    <Card className="border-none shadow-none bg-transparent relative h-full flex flex-col">
                      <div className="aspect-[4/5] relative mb-4 bg-[#F5F4F0] overflow-hidden">
                        {primaryImage && (
                          <img 
                            src={primaryImage.url} 
                            alt={product.name}
                            className={cn(
                              "absolute inset-0 w-full h-full object-cover transition-opacity duration-500 rounded-sm",
                              secondaryImage && "group-hover:opacity-0"
                            )}
                          />
                        )}
                        {secondaryImage && (
                          <img 
                            src={secondaryImage.url} 
                            alt={`${product.name} alternate view`}
                            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-sm"
                          />
                        )}
                        
                        {isSoldOut && (
                          <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[2px]">
                            <span className="bg-white px-4 py-2 text-[13px] font-medium tracking-wide shadow-sm">
                              SOLD OUT
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col flex-grow">
                        <h3 className="font-medium text-[15px] leading-tight mb-1">{product.name}</h3>
                        
                        {product.reviews && product.reviews.length > 0 && (
                          <div className="flex items-center gap-1.5 text-[13px] text-muted mb-2">
                            <span className="text-[#DEB887]">★</span>
                            <span>
                              {(product.reviews.reduce((a: any, c: any) => a + c.rating, 0) / product.reviews.length).toFixed(1)} 
                              <span className="ml-1 opacity-70">({product.reviews.length})</span>
                            </span>
                          </div>
                        )}

                        <p className="text-[15px] mb-2">£{Number(product.price).toFixed(2)}</p>
                        
                        <div className="mt-auto pt-2 flex flex-wrap gap-1">
                          {(parsedOccasions as string[]).slice(0, 2).map(tag => (
                            <span key={tag} className="text-muted bg-muted/10 px-2 py-0.5 rounded-full text-[11px]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-lg bg-surface/50 text-center">
              <p className="text-lg font-medium mb-2">No items match your filters.</p>
              <button 
                onClick={clearAllFilters}
                className="text-[14px] px-6 py-2 border border-border bg-white rounded-md hover:border-primary hover:text-primary transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Trigger Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden">
        <button 
          onClick={() => setIsMobileFiltersOpen(true)}
          className="bg-primary text-white rounded-full px-6 py-3 shadow-lg flex items-center gap-2 font-medium text-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filter & Sort
          {(filters.category.length > 0 || filters.occasion.length > 0) && (
            <span className="ml-1 bg-white text-primary w-5 h-5 rounded-full flex items-center justify-center text-[11px]">
              {filters.category.length + filters.occasion.length}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
