"use client"

import * as React from "react"
import { CldUploadWidget } from 'next-cloudinary'
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import { useToast } from "@/components/ui/Toast"
import { ImagePlus, Edit2, Trash2, X } from "lucide-react"
import { addWardrobeItem, deleteWardrobeItem } from "./actions"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const CATEGORIES = ["All", "Tops", "Trousers", "Dresses", "Outerwear", "Footwear", "Accessories"]
const OCCASIONS = ["Work", "Casual", "Date Night", "Gym", "Smart Casual"]

export default function WardrobeClient({ initialItems }: { initialItems: any[] }) {
  const router = useRouter()
  const { addToast } = useToast()

  // State
  const [items, setItems] = React.useState(initialItems)
  const [filter, setFilter] = React.useState("All")
  const [isTaggingModalOpen, setIsTaggingModalOpen] = React.useState(false)
  const [isDeletingModalOpen, setIsDeletingModalOpen] = React.useState(false)
  const [pendingItemUrl, setPendingItemUrl] = React.useState<string | null>(null)
  const [itemToDelete, setItemToDelete] = React.useState<string | null>(null)
  const [isDismissedAIInfo, setIsDismissedAIInfo] = React.useState(false)

  // Tagging Form State
  const [taggingForm, setTaggingForm] = React.useState({
    category: "Tops",
    colour: "",
    occasions: [] as string[]
  })

  // Filter the grid
  const displayedItems = filter === "All" 
    ? items 
    : items.filter(item => item.category === filter)

  // Upload handler
  const handleUploadSuccess = (result: any) => {
    if (result.info && result.info.secure_url) {
      setPendingItemUrl(result.info.secure_url)
      setIsTaggingModalOpen(true)
    }
  }

  const handleTagToggle = (occ: string) => {
    setTaggingForm(prev => ({
      ...prev,
      occasions: prev.occasions.includes(occ) 
        ? prev.occasions.filter(o => o !== occ)
        : [...prev.occasions, occ]
    }))
  }

  const saveTaggedItem = async () => {
    if (!pendingItemUrl) return
    
    // Optimistic or waiting UI
    const res = await addWardrobeItem({
      imageUrl: pendingItemUrl,
      category: taggingForm.category,
      colour: taggingForm.colour,
      occasions: taggingForm.occasions
    })

    if (res.success && res.item) {
      addToast("Added to wardrobe", "success")
      setItems([res.item, ...items])
      setIsTaggingModalOpen(false)
      setPendingItemUrl(null)
      // Reset form
      setTaggingForm({ category: "Tops", colour: "", occasions: [] })
      router.refresh() // To ensure server state matches nicely if needed
    } else {
      addToast(res.error || "Upload failed", "error")
    }
  }

  const skipTaggingAndSave = async () => {
    if (!pendingItemUrl) return
    const res = await addWardrobeItem({ imageUrl: pendingItemUrl })
    if (res.success && res.item) {
      addToast("Image saved without tags", "info")
      setItems([res.item, ...items])
      setIsTaggingModalOpen(false)
      setPendingItemUrl(null)
    }
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    const res = await deleteWardrobeItem(itemToDelete)
    if (res.success) {
      setItems(items.filter(i => i.id !== itemToDelete))
      addToast("Item removed", "success")
      setIsDeletingModalOpen(false)
      setItemToDelete(null)
    } else {
      addToast("Failed to remove item", "error")
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col flex-grow">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-medium tracking-tight mb-2">My Wardrobe</h1>
        <p className="text-muted text-[15px]">The AI uses your wardrobe to give personalised outfit suggestions.</p>
      </div>

      {/* Upload Zone */}
      <div className="mb-12">
        <CldUploadWidget 
          uploadPreset="wearwise_unsigned" // For FMP, using an unsigned preset or we can use signed uploads
          onSuccess={handleUploadSuccess}
          options={{ maxFiles: 1, maxFileSize: 5000000, clientAllowedFormats: ["jpg", "png", "jpeg"] }}
        >
          {({ open }) => (
            <div 
              onClick={() => open()}
              className="w-full border-2 border-dashed border-border rounded-lg p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/5 hover:border-primary/50 transition-colors"
            >
              <ImagePlus className="w-8 h-8 text-muted mb-4" />
              <p className="text-[15px] font-medium text-foreground">Drop a photo here, or click to browse</p>
              <p className="text-[13px] text-muted mt-1">Accepts JPG and PNG up to 5MB.</p>
            </div>
          )}
        </CldUploadWidget>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto pb-4 mb-4 gap-2 no-scrollbar border-b border-border">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 shrink-0 text-[14px] font-medium transition-colors border-b-2 ${filter === cat ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Banner */}
      {!isDismissedAIInfo && items.some(i => !i.tags || i.tags === "{}") && (
        <div className="bg-muted/5 border border-border p-4 rounded flex justify-between items-center mb-6">
          <p className="text-[13px]">
            <span className="font-medium text-primary mr-2">Information</span>
            Items without occasion tags won't be suggested by the AI.
          </p>
          <button onClick={() => setIsDismissedAIInfo(true)}>
            <X className="w-4 h-4 text-muted hover:text-foreground" />
          </button>
        </div>
      )}

      {/* Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {displayedItems.map(item => {
            let parsedTags: string[] = [];
            try { parsedTags = JSON.parse(item.tags); } catch(e) {}
            const hasTags = parsedTags.length > 0;

            return (
              <Card key={item.id} className="group relative overflow-hidden flex flex-col h-full bg-transparent border-none">
                <div className="relative aspect-[3/4] bg-muted/5 mb-3 rounded-sm border border-border overflow-hidden">
                  <img src={item.imageUrl} alt="Wardrobe item" className="w-full h-full object-cover" />
                  
                  {/* Hover Actions */}
                  <div className="absolute inset-x-0 bottom-0 bg-white/90 translate-y-full group-hover:translate-y-0 transition-transform flex p-2 border-t border-border">
                    <button 
                      className="flex-1 flex items-center justify-center gap-2 text-[13px] font-medium text-muted hover:text-primary transition-colors py-1 border-r border-border"
                      // onClick={() => openEditModal(item)} // Mock for MVP
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button 
                      className="flex-1 flex items-center justify-center gap-2 text-[13px] font-medium text-error hover:text-error/80 transition-colors py-1"
                      onClick={() => {
                        setItemToDelete(item.id)
                        setIsDeletingModalOpen(true)
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                  
                  {/* Untagged Overlay Badge */}
                  {!hasTags && (
                    <div className="absolute top-2 left-2 bg-white/90 px-2 py-0.5 rounded text-[10px] font-medium text-error uppercase tracking-wide">
                      Missing tags
                    </div>
                  )}
                </div>
                
                <h3 className="text-[14px] font-medium mb-1">{item.category || "Uncategorised"}</h3>
                <div className="flex flex-wrap gap-1 flex-grow">
                  {hasTags ? parsedTags.map(tag => (
                    <span key={tag} className="text-muted bg-muted/10 px-2 py-0.5 rounded text-[11px]">
                      {tag}
                    </span>
                  )) : (
                    <span className="text-muted text-[12px] italic">Not tagged for AI</span>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/5 border border-dashed border-border rounded-lg mt-4">
          <p className="text-[15px] font-medium text-muted max-w-[300px] mx-auto">
            Add your first item and the AI will start building outfit suggestions around what you already own.
          </p>
        </div>
      )}

      {/* Tagging Modal */}
      <Modal isOpen={isTaggingModalOpen} onClose={() => setIsTaggingModalOpen(false)} title="Tag your item">
        <div className="flex gap-6 mt-4">
          <div className="w-1/3 shrink-0">
            <div className="aspect-[3/4] bg-muted/5 rounded border border-border">
              {pendingItemUrl && <img src={pendingItemUrl} alt="Preview" className="w-full h-full object-cover" />}
            </div>
          </div>
          <div className="w-2/3 flex flex-col gap-4">
            <div>
              <label className="text-[13px] text-muted block mb-1">Category</label>
              <select 
                className="w-full h-10 border border-border bg-transparent px-3 text-[14px] focus:outline-none focus:border-primary"
                value={taggingForm.category}
                onChange={e => setTaggingForm({...taggingForm, category: e.target.value})}
              >
                {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <Input 
              label="Colour (Optional)" 
              placeholder="e.g. Navy Blue" 
              value={taggingForm.colour}
              onChange={e => setTaggingForm({...taggingForm, colour: e.target.value})}
            />

            <div>
              <label className="text-[13px] text-muted block mb-2">Occasions</label>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map(occ => (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => handleTagToggle(occ)}
                    className={cn(
                      "px-3 py-1 border text-[12px] rounded-full transition-colors",
                      taggingForm.occasions.includes(occ) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted"
                    )}
                  >
                    {occ}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Button onClick={saveTaggedItem}>Save tags</Button>
              <button 
                onClick={skipTaggingAndSave}
                className="text-[13px] text-muted hover:text-primary transition-colors py-2"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeletingModalOpen} onClose={() => setIsDeletingModalOpen(false)} title="Remove item">
        <p className="text-[15px] text-muted mb-6">Remove this item from your wardrobe? The AI will no longer reference it after deletion.</p>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="secondary" onClick={() => setIsDeletingModalOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={confirmDelete}>Remove</Button>
        </div>
      </Modal>
    </div>
  )
}
