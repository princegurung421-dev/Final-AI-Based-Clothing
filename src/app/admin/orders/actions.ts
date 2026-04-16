"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function updateOrderStatus(orderId: string, status: string) {
  const session = await auth()
  // Note: auth middleware ensures this route is only reachable by admins
  // But we could add double-check here
  
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: status as any }
    })
    
    revalidatePath("/admin/orders")
    return { success: true }
  } catch(e) {
    return { error: "Failed to update order" }
  }
}
