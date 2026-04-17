import type { Metadata } from "next"
import Link from "next/link"
import { Mail, MessageCircle, Clock, MapPin } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact | WearWise",
  description: "Get in touch with the WearWise team.",
}

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Get in touch</h1>
      <p className="text-[16px] text-muted leading-relaxed mb-14 max-w-xl">
        Questions about an order, a product, or the AI stylist? We reply to every
        message — usually within a working day.
      </p>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[15px] font-semibold mb-1">Email</p>
              <p className="text-[14px] text-muted">Most things land here fastest.</p>
              <a
                href="mailto:hello@wearwise.co.uk"
                className="text-[14px] text-primary hover:underline underline-offset-4 mt-1 inline-block"
              >
                hello@wearwise.co.uk
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[15px] font-semibold mb-1">AI stylist</p>
              <p className="text-[14px] text-muted">
                Need outfit help or to track an order? The assistant can do both.
              </p>
              <Link
                href="/assistant"
                className="text-[14px] text-primary hover:underline underline-offset-4 mt-1 inline-block"
              >
                Open the chat →
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[15px] font-semibold mb-1">Hours</p>
              <p className="text-[14px] text-muted leading-relaxed">
                Mon–Fri · 9:00–18:00 GMT
                <br />
                Sat–Sun · closed (the AI stylist is awake 24/7 though)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[15px] font-semibold mb-1">Studio</p>
              <p className="text-[14px] text-muted leading-relaxed">
                Shoreditch, London
                <br />
                By appointment only
              </p>
            </div>
          </div>
        </div>

        <form
          action="mailto:hello@wearwise.co.uk"
          method="post"
          encType="text/plain"
          className="bg-white border border-border rounded-2xl p-6 md:p-8 space-y-4"
        >
          <div>
            <label className="text-[13px] font-medium text-foreground mb-1.5 block">
              Your name
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full h-11 px-3 text-[14px] border border-border rounded-lg focus:border-primary outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-foreground mb-1.5 block">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full h-11 px-3 text-[14px] border border-border rounded-lg focus:border-primary outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-foreground mb-1.5 block">Topic</label>
            <select
              name="topic"
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
            <label className="text-[13px] font-medium text-foreground mb-1.5 block">
              Message
            </label>
            <textarea
              name="message"
              rows={5}
              required
              className="w-full px-3 py-2 text-[14px] border border-border rounded-lg focus:border-primary outline-none transition-colors resize-y"
            />
          </div>
          <button
            type="submit"
            className="w-full h-11 bg-primary text-white rounded-lg text-[14px] font-semibold hover:bg-primary/90 transition-colors"
          >
            Send message
          </button>
          <p className="text-[11px] text-muted">
            By submitting this form you agree to our{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              privacy policy
            </Link>
            .
          </p>
        </form>
      </div>
    </div>
  )
}
