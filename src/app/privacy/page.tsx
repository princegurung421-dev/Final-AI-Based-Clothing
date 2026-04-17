import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | WearWise",
  description: "How WearWise collects, uses, and protects your personal data.",
}

export default function PrivacyPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-16 md:py-24 prose-reset">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-[13px] text-muted mb-12">Last updated: 1 April 2026</p>

      <div className="space-y-10 text-[15px] leading-relaxed text-foreground/90">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Who we are</h2>
          <p>
            WearWise Ltd. ("WearWise", "we", "us", "our") is the controller of the personal
            data collected through this site. You can reach us at{" "}
            <a href="mailto:hello@wearwise.co.uk" className="text-primary underline underline-offset-4">
              hello@wearwise.co.uk
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. What we collect</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted">
            <li>
              <span className="text-foreground">Account data</span> — name, email, hashed
              password, chosen sizes and style preferences.
            </li>
            <li>
              <span className="text-foreground">Order data</span> — items, delivery address,
              order status, tracking number.
            </li>
            <li>
              <span className="text-foreground">Chat history</span> — messages sent to the AI
              stylist, linked to your account. Deletable at any time from the sidebar.
            </li>
            <li>
              <span className="text-foreground">Approximate location</span> — city-level, used
              only to fetch current weather for outfit suggestions.
            </li>
            <li>
              <span className="text-foreground">Technical data</span> — IP address, browser,
              pages visited, for security and performance.
            </li>
          </ul>
          <p className="mt-4 text-muted">
            We <span className="text-foreground font-medium">do not</span> store card details.
            All card data is handled by Stripe under PCI-DSS Level 1.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. How we use it</h2>
          <p>We use your data to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-muted">
            <li>fulfil orders and process payments;</li>
            <li>personalise styling suggestions;</li>
            <li>send order updates and (with your consent) marketing emails;</li>
            <li>detect fraud and protect the service.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Third parties</h2>
          <p className="text-muted">
            We share limited data with processors strictly to run the service:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-muted">
            <li>
              <span className="text-foreground">Stripe</span> — payments.
            </li>
            <li>
              <span className="text-foreground">Google (Gemini)</span> — chat messages and
              rough location for AI responses.
            </li>
            <li>
              <span className="text-foreground">OpenWeatherMap</span> — weather lookups.
            </li>
            <li>
              <span className="text-foreground">Vercel</span> — hosting.
            </li>
            <li>
              <span className="text-foreground">Neon / Postgres provider</span> — database
              hosting.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Your rights (UK GDPR)</h2>
          <p className="text-muted">
            You have the right to access, rectify, erase, or export your personal data, and
            to object to or restrict processing. Exercise any of these by emailing us — we'll
            respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Retention</h2>
          <p className="text-muted">
            Account and order data are kept for as long as your account is active, plus six
            years after closure for tax and accounting. Chat history lives until you delete
            it. Technical logs are rotated after 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
          <p className="text-muted">
            We use strictly-necessary cookies for authentication (the NextAuth session cookie)
            and cart state. We do not use analytics or tracking cookies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Changes</h2>
          <p className="text-muted">
            If we make material changes to this policy, we'll email active users and post a
            notice on the site at least 14 days before they take effect.
          </p>
        </section>
      </div>
    </article>
  )
}
