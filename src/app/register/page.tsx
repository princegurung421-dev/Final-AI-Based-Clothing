"use client"

import * as React from "react"
import Link from "next/link"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { registerUser } from "./actions"
// Note: We would normally import signIn from next-auth/react for client side immediate login after register
// For FMP, if the server action passes, we simulate they proceed. In reality, they need to log in after register 
// or we call next-auth/react signIn() here if success.
import { signIn } from "next-auth/react"

const STYLE_OPTIONS = ["Minimal", "Classic", "Streetwear", "Smart Casual", "Athleisure", "Boho", "Preppy", "Edgy"];

export default function RegisterPage() {
  const [step, setStep] = React.useState(1);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Form State
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    topSize: "",
    bottomSize: "",
    shoeSize: ""
  });
  const [selectedStyles, setSelectedStyles] = React.useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const processRegistration = async (skipStep2: boolean = false) => {
    setIsSubmitting(true);
    setError(null);
    
    const data = new FormData();
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("firstName", formData.firstName);
    data.append("lastName", formData.lastName);
    
    if (!skipStep2) {
      data.append("styles", JSON.stringify(selectedStyles));
      data.append("location", formData.location);
      data.append("sizes", JSON.stringify({
        top: formData.topSize,
        bottom: formData.bottomSize,
        shoe: formData.shoeSize
      }));
    }

    const result = await registerUser(data);
    
    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      // Fallback to step 1 if it's an email/password issue
      if (result.error.includes("email") || result.error.includes("fields")) {
        setStep(1);
      }
      return;
    }

    // Success - sign them in automatically
    const signInResult = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });

    setIsSubmitting(false);
    
    if (signInResult?.error) {
      // Very unlikely if just created successfully
      setError("Account created but failed to sign in automatically.");
    } else {
      setStep(3); // Advance to Done perfectly
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    processRegistration(false);
  };

  const handleSkipStep2 = () => {
    processRegistration(true);
  };

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 px-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                step >= i ? "bg-primary text-white" : "bg-muted/20 text-muted"
              )}>
                {step > i ? <Check className="w-3 h-3" /> : i}
              </div>
              {i < 3 && (
                <div className={cn(
                  "h-[2px] w-12 mx-2 transition-colors",
                  step > i ? "bg-primary" : "bg-muted/20"
                )} />
              )}
            </div>
          ))}
        </div>
        
        <Card className="p-8">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-medium mb-6">Create Account</h2>
              <form onSubmit={handleStep1Submit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="First name" name="firstName" required value={formData.firstName} onChange={handleInputChange} />
                  <Input label="Last name" name="lastName" required value={formData.lastName} onChange={handleInputChange} />
                </div>
                
                <Input 
                  label="Email" 
                  name="email" 
                  type="email" 
                  required 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  error={error?.includes("email") ? error : undefined}
                />
                
                <Input 
                  label="Password" 
                  name="password" 
                  type="password" 
                  required 
                  value={formData.password} 
                  onChange={handleInputChange} 
                  error={error?.includes("Password") ? error : undefined}
                />
                
                <Input 
                  label="Confirm Password" 
                  name="confirmPassword" 
                  type="password" 
                  required 
                  value={formData.confirmPassword} 
                  onChange={handleInputChange} 
                />

                <Button className="w-full mt-4" type="submit">
                  Continue
                </Button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-medium mb-6">What's your style?</h2>
              <form onSubmit={handleStep2Submit} className="flex flex-col gap-6">
                
                {/* Style Pills */}
                <div className="flex flex-wrap gap-2">
                  {STYLE_OPTIONS.map(style => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleStyle(style)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                        selectedStyles.includes(style) 
                          ? "bg-primary/10 border-primary text-primary" 
                          : "border-border text-foreground hover:border-muted"
                      )}
                    >
                      {style}
                    </button>
                  ))}
                </div>

                {/* Sizes */}
                <div className="space-y-3">
                  <h3 className="text-[13px] text-muted font-medium">Your Sizes</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <select 
                      name="topSize" 
                      value={formData.topSize} 
                      onChange={handleInputChange}
                      className="h-10 w-full border border-border bg-transparent px-2 text-sm focus-visible:outline-none focus-visible:border-primary"
                    >
                      <option value="">Top</option>
                      {["XS","S","M","L","XL","XXL"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select 
                      name="bottomSize" 
                      value={formData.bottomSize} 
                      onChange={handleInputChange}
                      className="h-10 w-full border border-border bg-transparent px-2 text-sm focus-visible:outline-none focus-visible:border-primary"
                    >
                      <option value="">Bottom</option>
                      {["28","30","32","34","36","38","40"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select 
                      name="shoeSize" 
                      value={formData.shoeSize} 
                      onChange={handleInputChange}
                      className="h-10 w-full border border-border bg-transparent px-2 text-sm focus-visible:outline-none focus-visible:border-primary"
                    >
                      <option value="">Shoe (UK)</option>
                      {["6","7","8","9","10","11","12"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h3 className="text-[13px] text-muted font-medium mb-1">Where are you based?</h3>
                  <Input 
                    name="location" 
                    placeholder="e.g. London" 
                    value={formData.location} 
                    onChange={handleInputChange} 
                  />
                </div>

                {error && <p className="text-[13px] text-error">{error}</p>}

                <div className="flex flex-col gap-3 mt-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Finishing..." : "Continue"}
                  </Button>
                  <button 
                    type="button" 
                    onClick={handleSkipStep2}
                    className="text-[14px] text-muted hover:text-primary transition-colors text-center p-2"
                    disabled={isSubmitting}
                  >
                    Skip for now
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-medium mb-4">Welcome to WearWise</h2>
              <p className="text-muted leading-relaxed mb-8">
                Your account is ready — start by exploring the store or chatting with the AI assistant.
              </p>
              
              <div className="flex flex-col gap-3">
                <Link href="/browse" className="w-full">
                  <Button className="w-full">Browse the store</Button>
                </Link>
                <Link href="/assistant" className="w-full">
                  <Button variant="secondary" className="w-full">Try the AI assistant</Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
