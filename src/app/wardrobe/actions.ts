"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function addWardrobeItem({
  imageUrl,
  category,
  colour,
  occasions
}: {
  imageUrl: string,
  category?: string,
  colour?: string,
  occasions?: string[]
}) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not logged in" }

  try {
    const item = await prisma.wardrobeItem.create({
      data: {
        userId: session.user.id,
        imageUrl,
        category: category || null,
        colour: colour || null,
        tags: occasions ? JSON.stringify(occasions) : "{}"
      }
    })
    return { success: true, item }
  } catch (error) {
    return { error: "Failed to add item to wardrobe" }
  }
}

export async function deleteWardrobeItem(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not logged in" }

  try {
    const item = await prisma.wardrobeItem.findUnique({ where: { id } })
    if (item?.userId !== session.user.id) return { error: "Unauthorized" }

    await prisma.wardrobeItem.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete item" }
  }
}
