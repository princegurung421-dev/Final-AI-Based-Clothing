"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function createOrder(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not logged in" }
  const userId = session.user.id;

  // Extract variables
  const addressLine1 = formData.get("addressLine1") as string
  const addressLine2 = formData.get("addressLine2") as string
  const city = formData.get("city") as string
  const postcode = formData.get("postcode") as string
  const country = formData.get("country") as string

  // Fetch cart to calculate totals properly securely
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } }
  })

  if (cartItems.length === 0) return { error: "Cart is empty" }

  const subtotal = cartItems.reduce((acc: number, item: any) => acc + (Number(item.product.price) * item.quantity), 0)
  const deliveryCost = subtotal > 50 ? 0 : 3.99
  const totalValue = subtotal + deliveryCost

  const orderNumber = "WW" + Math.floor(Math.random() * 100000000).toString().padStart(8, '0')
  const deliveryAddress = JSON.stringify({ addressLine1, addressLine2, city, postcode, country })

  try {
    // Run order creation and cart clearing in a transaction
    const order = await prisma.$transaction(async (tx: any) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          totalValue,
          subtotal,
          deliveryCost,
          deliveryAddress,
          items: {
             create: cartItems.map((item: any) => ({
               productId: item.productId,
               productName: item.product.name,
               size: item.size,
               quantity: item.quantity,
               price: item.product.price,
               imageUrl: item.product.images?.[0]?.url || null,
             }))
          }
        }
      });

      // Clear the user's cart
      await tx.cartItem.deleteMany({
        where: { userId }
      });

      return newOrder;
    });

    return { success: true, orderNumber: order.orderNumber };

  } catch(e) {
     console.error("Failed to create order", e)
     return { error: "Checkout failed. Please try again." }
  }
}
