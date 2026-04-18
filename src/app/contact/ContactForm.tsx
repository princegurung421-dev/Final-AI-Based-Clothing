"use client"

import * as React from "react"
import Link from "next/link"
import { Check } from "lucide-react"

export function ContactForm() {
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent" | "error">("idle")
  const [error, setError] = React.useState<string | null>(null)
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    topic: "Order question",
    message: "",
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("sending")
    setError(null)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Could not send your message.")
        setStatus("error")
        return
      }
      setStatus("sent")
    } catch (err: any) {
      setError(err?.message || "Network error")
      setStatus("error")
    }
  }

  if (status === "sent") {
    return (
      <div className="bg-white border border-border rounded-2xl p-8 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
          <Check className="w-7 h-7 text-emerald-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Message received</h3>
        <p className="text-[14px] text-muted leading-relaxed max-w-sm">
          Thanks — we've logged your message and will reply within one working day. Check the
          inbox you used above.
        </p>
        <button
          onClick={() => {
            setStatus("idle")
            setForm({ name: "", email: "", topic: "Order question", message: "" })
          }}
          className="mt-6 text-[13px] font-semibold text-primary hover:underline underline-offset-4"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-border rounded-2xl p-6 md:p-8 space-y-4"
    >
      <div>
        <label className="text-[13px] font-medium text-foreground mb-1.5 block">Your name</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full h-11 px-3 text-[14px] border border-border rounded-lg focus:border-primary outline-none transition-colors"
        />
      </div>
      <div>
        <label className="text-[13px] font-medium text-foreground mb-1.5 block">Email</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="w-full h-11 px-3 text-[14px] border border-border rounded-lg focus:border-primary outline-none transition-colors"
        />
      </div>
      <div>
        <label className="text-[13px] font-medium text-foreground mb-1.5 block">Topic</label>
        <select
          value={form.topic}
          onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
          className="w-full h-11 px-3 text-[14px] border border-border rounded-lg focus:border-primary outline-none bg-white"
        >
          <option>Order question</option>
          <option>Return / refund</option>
          <option>Product enquiry</option>
          <option>Press / partnerships</option>
          <option>Something else</option>
        </select>
      </div>
      <div>
        <label className="text-[13px] font-medium text-foreground mb-1.5 block">Message</label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className="w-full px-3 py-2 text-[14px] border border-border rounded-lg focus:border-primary outline-none transition-colors resize-y"
        />
      </div>
      {error && <div className="text-[13px] text-error bg-error/5 p-3 rounded-lg">{error}</div>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full h-11 bg-primary text-white rounded-lg text-[14px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
      <p className="text-[11px] text-muted">
        By submitting this form you agree to our{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          privacy policy
        </Link>
        .
      </p>
    </form>
  )
}
