"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { cn } from "@/lib/utils"
// Note: We use react-stripe-js types here for the FMP, but handle no-api-key gracefully
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { createOrder } from "./actions"
import { useToast } from "@/components/ui/Toast"
import { Lock, Check } from "lucide-react"

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

export default function CheckoutClient({ 
  user, 
  itemCount, 
  total 
}: { 
  user: any, 
  itemCount: number, 
  total: number 
}) {
  const router = useRouter()
  const { addToast } = useToast()
  
  const [step, setStep] = React.useState(1)
  const [orderNumber, setOrderNumber] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Delivery Form State
  const [formData, setFormData] = React.useState({
    fullName: user.name || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postcode: "",
    country: "United Kingdom"
  })

  // Basic validation hook
  const [errors, setErrors] = React.useState<any>({})

  const validateDelivery = () => {
    let errs: any = {}
    if (!formData.fullName) errs.fullName = "Required"
    if (!formData.addressLine1) errs.addressLine1 = "Required"
    if (!formData.city) errs.city = "Required"
    
    // UK Postcode simple regex
    const pcRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2}$/i;
    if (!formData.postcode) errs.postcode = "Required";
    else if (!pcRegex.test(formData.postcode)) errs.postcode = "Invalid UK Postcode";
    
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateDelivery()) {
      setStep(2)
    }
  }

  const handlePaymentSuccess = async () => {
    setIsSubmitting(true)
    
    const dbForm = new FormData();
    dbForm.append("fullName", formData.fullName);
    dbForm.append("addressLine1", formData.addressLine1);
    dbForm.append("addressLine2", formData.addressLine2);
    dbForm.append("city", formData.city);
    dbForm.append("postcode", formData.postcode);
    dbForm.append("country", formData.country);

    const res = await createOrder(dbForm)
    setIsSubmitting(false)

    if (res.error) {
      addToast(res.error, "error")
    } else {
      setOrderNumber(res.orderNumber!)
      setStep(3)
    }
  }

  // Define Payment Form specifically to use Stripe hooks if Stripe is enabled
  const PaymentForm = () => {
    const stripe = useStripe()
    const elements = useElements()

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      
      if (!stripe || !elements) {
        // Fallback for FMP when api keys aren't provided — proceed anyway
        await handlePaymentSuccess()
        return
      }

      setIsSubmitting(true)
      
      const cardElement = elements.getElement(CardElement)
      if (cardElement) {
        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        })

        if (error) {
          addToast(error.message || "Payment processing failed.", "error")
          setIsSubmitting(false)
        } else {
          // Success simulated for FMP since we aren't creating a PaymentIntent server-side
          await handlePaymentSuccess()
        }
      }
    }

    return (
      <form onSubmit={handleSubmit} className="flex flex-col">
        <label className="text-[13px] text-muted block mb-2">Card Details</label>
        <div className="border border-border p-3 bg-white h-12 flex flex-col justify-center mb-4 transition-colors focus-within:border-primary">
          <CardElement options={{
            style: {
              base: {
                fontSize: '15px',
                color: '#1C1C1A',
                fontFamily: 'system-ui, sans-serif',
                '::placeholder': { color: '#aab7c4' },
              },
              invalid: { color: '#C05C5C' },
            },
          }} />
        </div>
        
        <div className="flex items-center gap-2 mb-8 text-muted mt-2">
          <Lock className="w-4 h-4" />
          <p className="text-[12px]">Payments are secure and encrypted.</p>
        </div>

        <div className="bg-muted/5 p-4 mb-8 border border-border text-[14px]">
           <div className="flex justify-between mb-2">
             <span className="text-muted">Items ({itemCount})</span>
           </div>
           <div className="flex justify-between font-medium">
             <span>Total to pay</span>
             <span>£{total.toFixed(2)}</span>
           </div>
        </div>

        <div className="flex justify-between items-center gap-4">
          <button 
            type="button" 
            onClick={() => setStep(1)}
            className="text-[14px] text-muted hover:text-primary transition-colors"
          >
            ← Back
          </button>
          <Button size="lg" type="submit" disabled={isSubmitting || (!stripe && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? true : false)}>
            {isSubmitting ? "Processing..." : "Place Order"}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div className="flex-grow flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-[560px]">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-12 relative px-4">
          <div className="absolute top-1/2 left-8 right-8 h-px bg-border -z-10" />
          
          <div className="flex flex-col items-center gap-2 bg-background px-4">
            <div className={cn("w-3 h-3 rounded-full transition-colors", step >= 1 ? "bg-primary" : "bg-border")} />
            <span className={cn("text-[12px] font-medium transition-colors", step >= 1 ? "text-primary" : "text-muted")}>Delivery</span>
          </div>
          
          <div className="flex flex-col items-center gap-2 bg-background px-4">
            <div className={cn("w-3 h-3 rounded-full transition-colors", step >= 2 ? "bg-primary" : "bg-border")} />
            <span className={cn("text-[12px] font-medium transition-colors", step >= 2 ? "text-primary" : "text-muted")}>Payment</span>
          </div>
          
          <div className="flex flex-col items-center gap-2 bg-background px-4">
            <div className={cn("w-3 h-3 rounded-full transition-colors", step === 3 ? "bg-primary" : "bg-border")} />
            <span className={cn("text-[12px] font-medium transition-colors", step === 3 ? "text-primary" : "text-muted")}>Confirm</span>
          </div>
        </div>

        {/* Step 1: Delivery */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-medium tracking-tight mb-8">Delivery Details</h2>
            <form onSubmit={handleDeliverySubmit} className="flex flex-col gap-5">
              <Input 
                label="Full Name" 
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                error={errors.fullName}
              />
              <Input 
                label="Address Line 1" 
                value={formData.addressLine1}
                onChange={e => setFormData({...formData, addressLine1: e.target.value})}
                error={errors.addressLine1}
              />
              <Input 
                label="Address Line 2 (Optional)" 
                value={formData.addressLine2}
                onChange={e => setFormData({...formData, addressLine2: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-5">
                <Input 
                  label="Town / City" 
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  error={errors.city}
                />
                <Input 
                  label="Postcode" 
                  placeholder="e.g. SW1A 1AA"
                  value={formData.postcode}
                  onChange={e => setFormData({...formData, postcode: e.target.value})}
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
                <Button size="lg" type="submit">Continue to Payment</Button>
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
              // Fallback UI if stripe keys are missing
              <div className="border border-error p-6 bg-error/5 text-error rounded-none mb-6 text-sm">
                <p className="font-medium mb-1">Stripe Keys Missing</p>
                <p className="mb-4">For this MVP, click Place Order to bypass and simulate a successful payment.</p>
                {/* Fake form for bypassing */}
                {/* Wait, the literal name PaymentForm won't work perfectly outside Elements context if it calls useStripe(). */}
              </div>
            )}

            {!stripePromise && (
              <div className="flex flex-col gap-4 mt-8">
                 <Button size="lg" onClick={handlePaymentSuccess} disabled={isSubmitting}>
                   {isSubmitting ? "Processing..." : "Bypass & Place Order"}
                 </Button>
                 <button className="text-[13px]" onClick={() => setStep(1)}>← Back to Delivery</button>
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
            <h2 className="text-2xl font-medium tracking-tight mb-2">Order Confirmed</h2>
            <p className="text-[16px] text-muted mb-6">Order No. {orderNumber}</p>
            
            <p className="text-[15px] leading-relaxed text-muted max-w-[400px] mb-10">
              We'll send a confirmation to your email address. You can track your order in Order History.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Link href="/browse" className="flex-1">
                <Button variant="secondary" className="w-full">Continue Shopping</Button>
              </Link>
              <Link href="/orders" className="flex-1">
                <Button className="w-full">View Order</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
