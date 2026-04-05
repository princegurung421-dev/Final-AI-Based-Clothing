import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import CartClient from "./CartClient"

export default async function CartPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  // Fetch Cart Items
  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          images: true,
          stock: true
        }
      }
    },
    orderBy: { id: 'desc' }
  })

  // Upsell Products - Match occasion tags implicitly or just fetch random
  const upsellProducts = await prisma.product.findMany({
    where: { 
      isVisible: true,
      id: { notIn: items.map(i => i.productId) }
    },
    include: {
      images: { take: 1 }
    },
    take: 3
  })

  return <CartClient initialItems={items} upsellProducts={upsellProducts} />
}
