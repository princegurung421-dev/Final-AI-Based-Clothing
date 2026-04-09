"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function updateProfileInfo(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const name = formData.get("name") as string
  if (!name) return { error: "Name is required" }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name }
    })
    return { success: true }
  } catch (error) {
    return { error: "Failed to update profile" }
  }
}

export async function updateLocation(location: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { location }
    })
    return { success: true }
  } catch (error) {
    return { error: "Failed to update location" }
  }
}

export async function updatePreferences(type: 'styles' | 'sizes', data: any) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  try {
    const updateData = type === 'styles' 
      ? { stylePreferences: JSON.stringify(data) }
      : { sizes: JSON.stringify(data) };

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData
    })
    return { success: true }
  } catch (error) {
    return { error: "Failed to update preferences" }
  }
}

export async function deleteAccount() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  try {
    // Soft delete
    /* Wait, the schema does not have a deletedAt on User. 
       Let's just delete the user completely for MVP or add deletedAt later.
       Wait, I should delete completely for MVP. */
    await prisma.user.delete({
      where: { id: session.user.id },
    })
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete account" }
  }
}
