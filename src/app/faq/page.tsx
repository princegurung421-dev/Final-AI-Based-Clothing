import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQ | WearWise",
  description: "Answers to common questions about orders, returns, sizing, and the AI stylist.",
}

const FAQS = [
  {
    section: "Orders & delivery",
    items: [
      {
        q: "When will my order arrive?",
        a: "UK standard delivery is 2–4 working days. Free on orders over £50, otherwise a flat £3.99. You'll get an email with a tracking number as soon as your order ships.",
      },
      {
        q: "Can I change or cancel my order after placing it?",
        a: "If your order is still in the PENDING or PROCESSING state you can email us within 24 hours and we'll do our best. Once it's SHIPPED we can't recall it — you'd need to return it after delivery.",
      },
      {
        q: "Do you ship internationally?",
        a: "Not yet. We currently only deliver within the United Kingdom. International delivery is on our roadmap for 2026.",
      },
    ],
  },
  {
    section: "Returns & refunds",
    items: [
      {
        q: "What's your returns policy?",
        a: "Unworn items with tags can be returned within 30 days for a full refund. Send them back with the pre-paid label in your parcel. Refunds are issued to the original payment method within 5 working days of us receiving the return.",
      },
      {
        q: "Is it free to return something?",
        a: "Yes, for UK customers. Every order includes a pre-paid return label.",
      },
    ],
  },
  {
    section: "The AI stylist",
    items: [
      {
        q: "How does the AI stylist work?",
        a: "It's a Google Gemini model fine-tuned with tools that can read our live product catalogue, check your recent orders, and see the current weather where you are. It's built to suggest outfits, answer styling questions, and add items to your bag — all through conversation.",
      },
      {
        q: "Do you send my data to Google?",
        a: "Your chat messages and rough location (for weather) are sent to Google's Gemini API. We never share your payment details, email, or order history with them — only the context needed to help you style.",
      },
      {
        q: "Can I clear my chat history?",
        a: "Yes, in the chat sidebar hover over any conversation and click the trash icon. There's no 30-day purge — nothing is deleted unless you delete it.",
      },
    ],
  },
  {
    section: "Payments & security",
    items: [
      {
        q: "Which payment methods do you accept?",
        a: "All major credit and debit cards. Payments are processed by Stripe — we never see or store your card details on our servers.",
      },
      {
        q: "Is my card secure?",
        a: "Stripe is PCI-DSS Level 1 compliant (the highest standard in the industry) and all card data is encrypted in transit and at rest. We only ever store a reference to the payment on our side, never the card number.",
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Frequently asked questions</h1>
      <p className="text-[16px] text-muted leading-relaxed mb-12 max-w-xl">
        Can't find what you need?{" "}
        <a href="/contact" className="text-primary hover:underline underline-offset-4">
          Get in touch
        </a>
        .
      </p>

      <div className="flex flex-col gap-14">
        {FAQS.map(group => (
          <section key={group.section}>
            <h2 className="text-[13px] font-semibold uppercase tracking-widest text-muted mb-6">
              {group.section}
            </h2>
            <div className="flex flex-col divide-y divide-border/60">
              {group.items.map(item => (
                <details key={item.q} className="group py-5">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="text-[16px] font-medium pr-4">{item.q}</span>
                    <span className="text-muted text-[18px] transition-transform group-open:rotate-45 select-none">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-[15px] text-muted leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
