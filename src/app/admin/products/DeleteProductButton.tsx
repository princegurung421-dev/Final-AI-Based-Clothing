"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { deleteProduct } from "./actions"

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [pending, setPending] = React.useState(false)

  const onClick = async () => {
    if (!confirm(`Delete "${name}"? It will be hidden from the store but not permanently removed.`)) return
    setPending(true)
    try {
      await deleteProduct(id)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="text-[13px] text-error hover:underline flex items-center gap-1 disabled:opacity-50"
    >
      <Trash2 className="w-3.5 h-3.5" /> {pending ? "…" : "Delete"}
    </button>
  )
}
