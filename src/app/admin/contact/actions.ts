"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")
}

export async function updateContactStatus(
  id: string,
  status: "NEW" | "IN_PROGRESS" | "RESOLVED"
) {
  await requireAdmin()
  await prisma.contactMessage.update({
    where: { id },
    data: {
      status,
      respondedAt: status === "RESOLVED" ? new Date() : null,
    },
  })
  revalidatePath("/admin/contact")
  return { success: true }
}

export async function saveContactNote(id: string, note: string) {
  await requireAdmin()
  await prisma.contactMessage.update({
    where: { id },
    data: { internalNote: note.trim() || null },
  })
  revalidatePath("/admin/contact")
  return { success: true }
}

export async function deleteContactMessage(id: string) {
  await requireAdmin()
  await prisma.contactMessage.delete({ where: { id } })
  revalidatePath("/admin/contact")
  return { success: true }
}
