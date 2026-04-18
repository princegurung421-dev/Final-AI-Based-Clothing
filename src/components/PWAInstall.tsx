"use client"

import * as React from "react"
import { Download, X } from "lucide-react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

const DISMISSED_KEY = "wearwise:pwa-install-dismissed"

// Module-scoped cache so the banner AND the footer button see the same event.
let cachedPrompt: BeforeInstallPromptEvent | null = null
const listeners = new Set<() => void>()

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault()
    cachedPrompt = e as BeforeInstallPromptEvent
    listeners.forEach((fn) => fn())
  })
  window.addEventListener("appinstalled", () => {
    cachedPrompt = null
    listeners.forEach((fn) => fn())
  })
  // Register the service worker once for the whole app.
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {})
  }
}

function useInstallPrompt() {
  const [, forceUpdate] = React.useReducer((n) => n + 1, 0)
  const [installed, setInstalled] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)")
    if (mq.matches || (window.navigator as any).standalone === true) {
      setInstalled(true)
    }
    const onInstalled = () => setInstalled(true)
    window.addEventListener("appinstalled", onInstalled)
    listeners.add(forceUpdate)
    return () => {
      window.removeEventListener("appinstalled", onInstalled)
      listeners.delete(forceUpdate)
    }
  }, [])

  const install = React.useCallback(async () => {
    if (!cachedPrompt) return false
    await cachedPrompt.prompt()
    const choice = await cachedPrompt.userChoice
    const accepted = choice.outcome === "accepted"
    cachedPrompt = null
    listeners.forEach((fn) => fn())
    if (accepted) setInstalled(true)
    return accepted
  }, [])

  return { available: !!cachedPrompt, installed, install }
}

// ─── Floating banner (shown on first capture) ────────────────

export function PWAInstall() {
  const { available, installed, install } = useInstallPrompt()
  const [dismissed, setDismissed] = React.useState(false)

  React.useEffect(() => {
    setDismissed(localStorage.getItem(DISMISSED_KEY) === "true")
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true")
    setDismissed(true)
  }

  if (installed || dismissed || !available) return null

  return (
    <div className="fixed bottom-5 left-5 right-5 md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-50 bg-foreground text-white rounded-2xl shadow-2xl p-5 flex items-start gap-4 animate-fade-in">
      <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
        <Download className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold mb-1">Install WearWise</p>
        <p className="text-[13px] text-white/70 leading-relaxed mb-3">
          Add to your home screen for quicker access to the AI stylist and your bag.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => install()}
            className="h-9 px-4 bg-primary text-white rounded-lg text-[13px] font-semibold hover:bg-primary/90 transition-colors"
          >
            Install
          </button>
          <button
            onClick={dismiss}
            className="h-9 px-3 text-[13px] text-white/60 hover:text-white transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
      <button
        onClick={dismiss}
        className="p-1 -mt-1 -mr-1 text-white/40 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── Footer button (manual trigger, hidden once installed) ───

export function PWAInstallButton() {
  const { available, installed, install } = useInstallPrompt()

  if (installed) return null
  if (!available) return null // Safari/FF or not yet eligible — hide rather than offer a dead button

  return (
    <button
      onClick={() => install()}
      className="inline-flex items-center gap-2 text-[13px] text-white/70 hover:text-primary transition-colors"
    >
      <Download className="w-3.5 h-3.5" />
      Install app
    </button>
  )
}
