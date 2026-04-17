import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ProductForm, type ProductFormData } from "../../ProductForm"

function safeParse(json: string | null | undefined, fallback: any[]) {
  if (!json) return fallback
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, stock: true },
  })

  if (!product) notFound()

  const initial: ProductFormData = {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    price: Number(product.price),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    colourName: product.colourName,
    colourHex: product.colourHex,
    occasions: safeParse(product.occasions, []),
    weather: safeParse(product.weather, []),
    season: safeParse(product.season, []),
    isVisible: product.isVisible,
    images: product.images.map(i => ({ url: i.url, isPrimary: i.isPrimary })),
    stock: product.stock.map(s => ({ size: s.size, quantity: s.quantity })),
  }

  return <ProductForm initial={initial} />
}
