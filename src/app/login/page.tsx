"use client"

import * as React from "react"
import Link from "next/link"
import { useFormStatus } from "react-dom"
import { useActionState } from "react"
import { authenticate } from "./actions"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { useToast } from "@/components/ui/Toast"

function LoginButton() {
  const { pending } = useFormStatus()
  return (
    <Button 
      className="w-full mt-6" 
      disabled={pending}
    >
      {pending ? "Signing in..." : "Sign In"}
    </Button>
  )
}

export default function LoginPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined)
  const { addToast } = useToast()

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault()
    addToast("Please contact support to reset your password", "info")
  }

  return (
    <div className="flex-grow flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-medium tracking-tight">WearWise</h1>
        </div>
        
        <Card className="p-8">
          <h2 className="text-xl font-medium mb-6">Sign in</h2>
          
          <form action={dispatch} className="flex flex-col gap-4">
            <Input
              label="Email"
              id="email"
              type="email"
              name="email"
              required
              autoComplete="email"
            />
            
            <div className="flex flex-col gap-2">
              <Input
                label="Password"
                id="password"
                type="password"
                name="password"
                required
                autoComplete="current-password"
              />
              <a 
                href="#"
                onClick={handleForgotPassword}
                className="text-[13px] text-muted hover:text-primary transition-colors hover:underline text-right"
              >
                Forgot your password?
              </a>
            </div>

            {errorMessage && (
              <p className="text-[13px] text-error mt-2">{errorMessage}</p>
            )}

            <LoginButton />
          </form>
        </Card>
        
        <p className="text-center mt-6 text-[15px] text-muted">
          Don't have an account?{' '}
          <Link href="/register" className="text-foreground hover:text-primary transition-colors underline underline-offset-4">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
