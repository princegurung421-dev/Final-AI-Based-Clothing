"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { cn } from "@/lib/utils"
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { useToast } from "@/components/ui/Toast"
import { Lock, Check } from "lucide-react"

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

type DeliveryForm = {
  fullName: string
  addressLine1: string
  addressLine2: string
  city: string
  postcode: string
  country: string
}

export default function CheckoutClient({
  user,
  itemCount,
  total,
}: {
  user: any
  itemCount: number
  total: number
}) {
  const { addToast } = useToast()

  const [step, setStep] = React.useState(1)
  const [orderNumber, setOrderNumber] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [appliedPromo, setAppliedPromo] = React.useState<null | {
    code: string
    discount: number
  }>(null)

  React.useEffect(() => {
    fetch("/api/promo/active", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (d.applied) {
          setAppliedPromo({ code: d.applied.code, discount: d.applied.discount })
        }
      })
      .catch(() => {})
  }, [])

  const [formData, setFormData] = React.useState<DeliveryForm>({
    fullName: user?.name || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
  })

  const [errors, setErrors] = React.useState<any>({})

  const validateDelivery = () => {
    const errs: any = {}
    if (!formData.fullName) errs.fullName = "Required"
    if (!formData.addressLine1) errs.addressLine1 = "Required"
    if (!formData.city) errs.city = "Required"
    if (!formData.postcode) errs.postcode = "Required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateDelivery()) setStep(2)
  }

  const onPaymentSuccess = (ordNumber: string) => {
    setOrderNumber(ordNumber)
    setStep(3)
    // Webhook will clear cart + stored promo server-side once payment succeeds.
    // Just nudge the header cart badge to re-fetch.
    window.dispatchEvent(new Event("cart:updated"))
    setTimeout(() => window.dispatchEvent(new Event("cart:updated")), 2500)
  }

  const PaymentForm = () => {
    const stripe = useStripe()
    const elements = useElements()
    const [cardReady, setCardReady] = React.useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (isSubmitting) return

      if (!stripe || !elements) {
        addToast("Payment system is still loading. Try again in a moment.", "error")
        return
      }

      setIsSubmitting(true)

      try {
        // 1. Tell our server to snapshot the cart into a PENDING order and
        //    create a PaymentIntent. The server reads the applied promo code
        //    from the user row (DB), so we only send the address here.
        const initRes = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        const initData = await initRes.json()
        if (!initRes.ok) {
          addToast(initData.error || "Could not start payment.", "error")
          setIsSubmitting(false)
          return
        }

        const { clientSecret, orderNumber: ordNumber } = initData as {
          clientSecret: string
          orderNumber: string
        }

        // 2. Confirm the card with Stripe. This actually charges the card
        //    (or produces a decline). Webhook takes over once succeeded.
        const cardElement = elements.getElement(CardElement)
        if (!cardElement) {
          addToast("Card element not ready.", "error")
          setIsSubmitting(false)
          return
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: formData.fullName,
                address: {
                  line1: formData.addressLine1,
                  line2: formData.addressLine2 || undefined,
                  city: formData.city,
                  postal_code: formData.postcode,
                  country: "GB",
                },
              },
            },
          }
        )

        if (error) {
          addToast(error.message || "Payment failed.", "error")
          setIsSubmitting(false)
          return
        }

        if (paymentIntent?.status === "succeeded") {
          onPaymentSuccess(ordNumber)
        } else if (paymentIntent?.status === "requires_action") {
          addToast("Payment requires additional authentication.", "info")
        } else {
          addToast(`Unexpected payment status: ${paymentIntent?.status}`, "error")
        }
      } catch (err: any) {
        addToast(err?.message || "Checkout failed.", "error")
      } finally {
        setIsSubmitting(false)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="flex flex-col">
        <label className="text-[13px] text-muted block mb-2">Card Details</label>
        <div className="border border-border p-3 bg-white min-h-12 flex flex-col justify-center mb-4 transition-colors focus-within:border-primary">
          <CardElement
            onReady={() => setCardReady(true)}
            options={{
              hidePostalCode: true, // we already collect it as part of the delivery address
              style: {
                base: {
                  fontSize: "15px",
                  color: "#1C1C1A",
                  fontFamily: "system-ui, sans-serif",
                  "::placeholder": { color: "#aab7c4" },
                },
                invalid: { color: "#C05C5C" },
              },
            }}
          />
        </div>

        <div className="flex items-center gap-2 mb-8 text-muted mt-2">
          <Lock className="w-4 h-4" />
          <p className="text-[12px]">
            Payments are processed by Stripe — encrypted end to end.
          </p>
        </div>

        <div className="bg-muted/5 p-4 mb-8 border border-border text-[14px] space-y-2">
          <div className="flex justify-between">
            <span className="text-muted">Items ({itemCount})</span>
            <span className="text-muted">£{total.toFixed(2)}</span>
          </div>
          {appliedPromo && (
            <div className="flex justify-between text-success">
              <span>
                Promo <span className="font-mono text-[12px]">{appliedPromo.code}</span>
              </span>
              <span>-£{appliedPromo.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-medium pt-2 border-t border-border">
            <span>Total to pay</span>
            <span>£{Math.max(0, total - (appliedPromo?.discount || 0)).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center gap-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-[14px] text-muted hover:text-primary transition-colors"
            disabled={isSubmitting}
          >
            ← Back
          </button>
          <Button
            size="lg"
            type="submit"
            disabled={isSubmitting || !stripe || !cardReady}
          >
            {isSubmitting ? "Processing…" : `Pay £${total.toFixed(2)}`}
          </Button>
        </div>

       <p className="mt-4 text-xs text-muted leading-relaxed">
        <span className="font-semibold text-foreground">Test Card Details</span>
        <br />
        <span className="font-mono tracking-wide">4242 4242 4242 4242</span>
        <br />
        Expiry: <span className="font-medium">12/31</span> · CVC: <span className="font-medium">123</span> · Postcode: <span className="font-medium">RG1 1AF</span>
      </p>
      </form>
    )
  }

  return (
    <div className="flex-grow flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-[560px]">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-12 relative px-4">
          <div className="absolute top-1/2 left-8 right-8 h-px bg-border -z-10" />
          {[
            { i: 1, label: "Delivery" },
            { i: 2, label: "Payment" },
            { i: 3, label: "Confirm" },
          ].map(s => (
            <div
              key={s.i}
              className="flex flex-col items-center gap-2 bg-background px-4"
            >
              <div
                className={cn(
                  "w-3 h-3 rounded-full transition-colors",
                  step >= s.i ? "bg-primary" : "bg-border"
                )}
              />
              <span
                className={cn(
                  "text-[12px] font-medium transition-colors",
                  step >= s.i ? "text-primary" : "text-muted"
                )}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Delivery */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-medium tracking-tight mb-8">Delivery Details</h2>
            <form onSubmit={handleDeliverySubmit} className="flex flex-col gap-5">
              <Input
                label="Full Name"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                error={errors.fullName}
              />
              <Input
                label="Address Line 1"
                value={formData.addressLine1}
                onChange={e =>
                  setFormData({ ...formData, addressLine1: e.target.value })
                }
                error={errors.addressLine1}
              />
              <Input
                label="Address Line 2 (Optional)"
                value={formData.addressLine2}
                onChange={e =>
                  setFormData({ ...formData, addressLine2: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-5">
                <Input
                  label="Town / City"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  error={errors.city}
                />
                <Input
                  label="Postcode"
                  placeholder="e.g. SW1A 1AA"
                  value={formData.postcode}
                  onChange={e => setFormData({ ...formData, postcode: e.target.value })}
                  error={errors.postcode}
                />
              </div>
              <Input
                label="Country"
                value={formData.country}
                disabled
                className="bg-muted/5 text-muted cursor-not-allowed"
              />
              <div className="mt-6 flex justify-end">
                <Button size="lg" type="submit">
                  Continue to Payment
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-medium tracking-tight mb-8">Payment</h2>
            {stripePromise ? (
              <Elements stripe={stripePromise}>
                <PaymentForm />
              </Elements>
            ) : (
              <div className="border border-error p-6 bg-error/5 text-error rounded-none mb-6 text-sm">
                <p className="font-medium mb-1">Stripe keys are not configured</p>
                <p>
                  Set <span className="font-mono">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</span>{" "}
                  and <span className="font-mono">STRIPE_SECRET_KEY</span> in your{" "}
                  <span className="font-mono">.env</span> and restart the dev server.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="text-center py-8 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-6">
              <Check className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-medium tracking-tight mb-2">Payment Received</h2>
            <p className="text-[16px] text-muted mb-6">Order No. {orderNumber}</p>
            <p className="text-[15px] leading-relaxed text-muted max-w-[400px] mb-10">
              Your order is being prepared. You can track it in Order History — it will
              show <span className="font-semibold text-foreground">PROCESSING</span> within a
              few seconds once our systems confirm the payment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Link href="/browse" className="flex-1">
                <Button variant="secondary" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/orders" className="flex-1">
                <Button className="w-full">View Orders</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
