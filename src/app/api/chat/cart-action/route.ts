import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(req: Request) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { action, productId, size, quantity = 1 } = await req.json()

  if (!productId) {
    return Response.json({ error: 'Product ID is required' }, { status: 400 })
  }

  try {
    if (action === 'add') {
      if (!size) {
        return Response.json({ error: 'Size is required' }, { status: 400 })
      }

      // Verify stock
      const stock = await prisma.productStock.findUnique({
        where: { productId_size: { productId, size } },
      })
      if (!stock || stock.quantity < quantity) {
        return Response.json({ error: `Size ${size} is not available` }, { status: 400 })
      }

      await prisma.cartItem.upsert({
        where: { userId_productId_size: { userId, productId, size } },
        update: { quantity: { increment: quantity } },
        create: { userId, productId, size, quantity },
      })

      return Response.json({ success: true })
    }

    if (action === 'remove') {
      const where: any = { userId, productId }
      if (size) where.size = size

      await prisma.cartItem.deleteMany({ where })
      return Response.json({ success: true })
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e) {
    return Response.json({ error: 'Operation failed' }, { status: 500 })
  }
}
