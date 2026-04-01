"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroInput() {
  const [query, setQuery] = React.useState("")
  const [focused, setFocused] = React.useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/assistant?q=${encodeURIComponent(query)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-[500px] mt-8">
      <div className={`relative flex items-center bg-white rounded-full border transition-all duration-300 shadow-lg ${
        focused
          ? "border-primary shadow-xl shadow-primary/10"
          : "border-border/80 shadow-black/5 hover:shadow-lg"
      }`}>
        <Sparkles className="w-4 h-4 text-primary/50 absolute left-5" />
        <input
          type="text"
          placeholder="I need an outfit for..."
          className="w-full h-13 bg-transparent pl-12 pr-14 text-[15px] outline-none placeholder:text-muted/50 text-foreground rounded-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="absolute right-2 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center transition-all duration-300 hover:bg-primary-dark hover:scale-105 active:scale-95 disabled:opacity-30 disabled:scale-100 shadow-md shadow-primary/20"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}
