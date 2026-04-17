"use client"

import * as React from "react"
import { Download, X } from "lucide-react"

// BeforeInstallPromptEvent is not in the standard TS lib yet.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

const DISMISSED_KEY = "wearwise:pwa-install-dismissed"

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    React.useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = React.useState(false)
  const [visible, setVisible] = React.useState(false)

  // Register the service worker once.
  React.useEffect(() => {
    if (!("serviceWorker" in navigator)) return
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // swallow — install eligibility is a nice-to-have
    })
  }, [])

  // Listen for Chrome's install prompt + detect already-installed state.
  React.useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY) === "true"

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      const evt = e as BeforeInstallPromptEvent
      setDeferredPrompt(evt)
      if (!dismissed) setVisible(true)
    }

    const onInstalled = () => {
      setInstalled(true)
      setVisible(false)
      setDeferredPrompt(null)
    }

    // Already running as an installed PWA?
    const mq = window.matchMedia("(display-mode: standalone)")
    if (mq.matches || (window.navigator as any).standalone === true) {
      setInstalled(true)
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  const install = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === "accepted") {
      setInstalled(true)
    }
    setDeferredPrompt(null)
    setVisible(false)
  }

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true")
    setVisible(false)
  }

  if (installed || !visible || !deferredPrompt) return null

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
            onClick={install}
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
