"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { signIn } from "@/auth"

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  
  const styles = formData.get("styles") as string // JSON array
  const location = formData.get("location") as string
  const sizes = formData.get("sizes") as string // JSON object

  if (!email || !password || !firstName) {
    return { error: "Missing required fields" }
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { error: "An account with this email already exists" }
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const name = `${firstName} ${lastName}`.trim()

  try {
    await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        stylePreferences: styles || "[]",
        location: location || null,
        sizes: sizes || "{}",
      }
    })

    // Sign them in immediately using NextAuth (credentials)
    // Wait, if we use NextAuth signIn in server action, it throws an error to redirect
    // which shouldn't be caught by our try/catch unless we let it bubble.
  } catch (e: any) {
    console.error("Registration error:", e)
    return { error: "Failed to create account" }
  }
  
  return { success: true }
}
