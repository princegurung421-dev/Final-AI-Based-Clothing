import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import OrderList from "./OrderList"

export default async function OrdersPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  // Fetch Orders
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: true
    }
  })

  // To populate thumbnails, we need to map product images into the items or use the snapshot image URL
  // OrderItem already has `imageUrl`, but let's make sure it's populated on checkout or fetch dynamically
  // In `checkout/actions.ts` I didn't set `imageUrl`. Let's assume FMP handles it via dynamic fetch if missing:
  for (const order of orders) {
    for (const item of order.items) {
      if (!item.imageUrl) {
        const prod = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { images: true }
        });
        const primaryImage = prod?.images?.find(i => i.isPrimary) || prod?.images?.[0];
        if (primaryImage) {
          item.imageUrl = primaryImage.url;
        } else {
          item.imageUrl = "https://images.unsplash.com/photo-1544441893-675973e31985?w=200&q=80"; // Fallback placeholder
        }
      }
    }
  }

  return <OrderList orders={orders} />
}
