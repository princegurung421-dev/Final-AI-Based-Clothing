"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function addCartItem(productId: string, size: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  if (!productId || !size) return { error: "Product and size are required" }

  try {
    await prisma.cartItem.upsert({
      where: {
        userId_productId_size: {
          userId: session.user.id,
          productId,
          size,
        },
      },
      update: {
        quantity: { increment: 1 },
      },
      create: {
        userId: session.user.id,
        productId,
        size,
        quantity: 1,
      },
    })

    revalidatePath("/cart")
    return { success: true }
  } catch (e) {
    return { error: "Add to cart failed" }
  }
}

export async function updateCartQuantity(itemId: string, quantity: number) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  if (quantity < 1) return { error: "Quantity must be at least 1" }

  try {
    const item = await prisma.cartItem.findUnique({ where: { id: itemId } })
    if (item?.userId !== session.user.id) return { error: "Unauthorized" }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity }
    })
    
    revalidatePath("/cart")
    return { success: true }
  } catch(e) {
    return { error: "Update failed" }
  }
}

export async function removeCartItem(itemId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  try {
    const item = await prisma.cartItem.findUnique({ where: { id: itemId } })
    if (item?.userId !== session.user.id) return { error: "Unauthorized" }

    await prisma.cartItem.delete({
      where: { id: itemId },
    })
    
    revalidatePath("/cart")
    return { success: true }
  } catch(e) {
    return { error: "Delete failed" }
  }
}

// Helper to handle the "localStorage pending cart" transfer into real DB on login/mount
export async function syncPendingCart(productId: string, size: string) {
  const session = await auth()
  if (!session?.user?.id) return;

  try {
    await prisma.cartItem.upsert({
      where: {
        userId_productId_size: {
          userId: session.user.id,
          productId,
          size
        }
      },
      update: {
        quantity: { increment: 1 }
      },
      create: {
        userId: session.user.id,
        productId,
        size,
        quantity: 1
      }
    });
  } catch(e) {
    console.error("Cart sync failed", e)
  }
}
