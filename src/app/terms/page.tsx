import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | WearWise",
  description: "The terms that govern your use of the WearWise platform.",
}

export default function TermsPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-16 md:py-24">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Terms of Service</h1>
      <p className="text-[13px] text-muted mb-12">Last updated: 1 April 2026</p>

      <div className="space-y-10 text-[15px] leading-relaxed text-foreground/90">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Agreement</h2>
          <p className="text-muted">
            By creating an account or placing an order, you agree to these terms. If you
            don't agree, please don't use the service. These terms form a binding contract
            between you and WearWise Ltd. (a company registered in England and Wales).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Account</h2>
          <p className="text-muted">
            You must be 18+ to place an order. You are responsible for keeping your account
            credentials confidential and for all activity under your account. Tell us
            immediately if you suspect unauthorised access.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Orders & payment</h2>
          <p className="text-muted">
            An order is a binding contract only once we confirm it (status <em>PROCESSING</em>
            after successful payment). Prices include VAT where applicable. If an item is
            mispriced or out of stock after you order, we'll refund the difference or the
            full amount and cancel that line. Payment is taken at checkout via Stripe.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Delivery & returns</h2>
          <p className="text-muted">
            Delivery estimates are indicative, not guaranteed. Risk passes to you on delivery.
            You may return unworn items with tags within 30 days for a refund; details in the
            FAQ. Where the goods are damaged on arrival, contact us within 72 hours.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. The AI stylist</h2>
          <p className="text-muted">
            Outfit suggestions are provided on a "best effort" basis and are not professional
            advice. The assistant may occasionally make mistakes — always double-check sizes,
            prices, and availability before placing an order.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Acceptable use</h2>
          <p className="text-muted">You agree not to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-muted">
            <li>misuse the service, including attempting to disrupt it or access other users' data;</li>
            <li>reverse engineer, scrape, or bulk-extract product data;</li>
            <li>use the AI stylist for anything other than styling-related conversation;</li>
            <li>place orders with fraudulent intent.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Intellectual property</h2>
          <p className="text-muted">
            All content on this site — product photography, copy, design, code — is owned by
            WearWise or its licensors. You may not reproduce it without permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Liability</h2>
          <p className="text-muted">
            Nothing in these terms limits our liability for death, personal injury, or fraud.
            Otherwise, our total liability for any order is capped at the amount you paid for
            that order.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Termination</h2>
          <p className="text-muted">
            You can close your account at any time from the profile page. We may suspend or
            close accounts that breach these terms, abuse the service, or where required by
            law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Governing law</h2>
          <p className="text-muted">
            These terms are governed by the laws of England and Wales, and disputes are
            subject to the exclusive jurisdiction of the English courts.
          </p>
        </section>
      </div>
    </article>
  )
}
