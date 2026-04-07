import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import CheckoutClient from "./CheckoutClient"

export default async function CheckoutPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  // Fetch cart details for total calculation
  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true }
  })

  if (items.length === 0) {
    redirect("/cart")
  }

  const subtotal = items.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0)
  const deliveryCost = subtotal > 50 ? 0 : 3.99
  const totalValue = subtotal + deliveryCost
  
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <CheckoutClient 
      user={session.user} 
      itemCount={itemCount} 
      total={totalValue} 
    />
  )
}
