"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function addCartItem(productId: string, size: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Please sign in to add items to your bag." }
  if (!productId || !size) return { error: "Product and size are required." }

  // Guard against stale JWT: if the user row no longer exists (e.g. after a
  // DB reseed), upsert will throw an FK error and the user has no idea why.
  const userExists = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  })
  if (!userExists) {
    return { error: "Your session is out of date — please sign out and back in." }
  }

  // Verify stock before we upsert so we can give a specific reason
  const stock = await prisma.productStock.findUnique({
    where: { productId_size: { productId, size } },
  })
  if (!stock) {
    return { error: `Size ${size} isn't available for this product.` }
  }
  if (stock.quantity <= 0) {
    return { error: `Size ${size} is out of stock.` }
  }

  // How many are already in this user's bag for this variant?
  const existing = await prisma.cartItem.findUnique({
    where: {
      userId_productId_size: {
        userId: session.user.id,
        productId,
        size,
      },
    },
  })
  if (existing && existing.quantity >= stock.quantity) {
    return { error: `Only ${stock.quantity} in stock and they're all in your bag.` }
  }

  try {
    await prisma.cartItem.upsert({
      where: {
        userId_productId_size: {
          userId: session.user.id,
          productId,
          size,
        },
      },
      update: { quantity: { increment: 1 } },
      create: {
        userId: session.user.id,
        productId,
        size,
        quantity: 1,
      },
    })

    revalidatePath("/cart")
    return { success: true }
  } catch (e: any) {
    console.error("addCartItem failed:", {
      code: e?.code,
      message: e?.message,
      userId: session.user.id,
      productId,
      size,
    })
    // Common Prisma error codes we can translate for the user
    if (e?.code === "P2003") return { error: "That product no longer exists." }
    if (e?.code === "P2002") return { error: "Duplicate cart item — please refresh the page." }
    return {
      error:
        process.env.NODE_ENV === "production"
          ? "Couldn't add to bag. Please try again."
          : `Add to cart failed: ${e?.message || "unknown"}`,
    }
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
