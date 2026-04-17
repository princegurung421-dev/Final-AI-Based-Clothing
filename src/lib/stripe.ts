import Stripe from "stripe"

// Server-side Stripe client. Missing key is fine at build time; routes that
// need it will throw at runtime if the env var is absent.
const key = process.env.STRIPE_SECRET_KEY

// No apiVersion pin — defer to whatever version is set in the Stripe
// dashboard (currently 2026-03-25.dahlia). Upgrading the account's API
// version will pick up automatically.
export const stripe = key
  ? new Stripe(key, { typescript: true, appInfo: { name: "WearWise" } })
  : (null as unknown as Stripe)

export function assertStripe(): Stripe {
  if (!key) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY in your environment."
    )
  }
  return stripe
}
