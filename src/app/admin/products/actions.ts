"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { embedDocument, productDocument } from "@/lib/embeddings"

async function regenerateEmbedding(productId: string) {
  const p = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      name: true,
      description: true,
      category: true,
      colourName: true,
      occasions: true,
      weather: true,
      season: true,
    },
  })
  if (!p) return
  const doc = productDocument(p)
  const vec = await embedDocument(doc)
  if (!vec) return
  await prisma.product.update({
    where: { id: productId },
    data: { embedding: vec as any, embeddedAt: new Date() },
  })
}

type ProductFormInput = {
  name: string
  description: string
  category: string
  price: number
  salePrice: number | null
  colourName: string
  colourHex: string
  occasions: string[]
  weather: string[]
  season: string[]
  isVisible: boolean
  images: { url: string; isPrimary: boolean }[]
  stock: { size: string; quantity: number }[]
}

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
  return session.user
}

function parseForm(formData: FormData): ProductFormInput {
  const images = JSON.parse((formData.get("images") as string) || "[]")
  const stock = JSON.parse((formData.get("stock") as string) || "[]")
  const occasions = JSON.parse((formData.get("occasions") as string) || "[]")
  const weather = JSON.parse((formData.get("weather") as string) || "[]")
  const season = JSON.parse((formData.get("season") as string) || "[]")
  const salePriceRaw = formData.get("salePrice") as string
  return {
    name: (formData.get("name") as string)?.trim() || "",
    description: (formData.get("description") as string)?.trim() || "",
    category: (formData.get("category") as string) || "",
    price: Number(formData.get("price") || 0),
    salePrice: salePriceRaw ? Number(salePriceRaw) : null,
    colourName: (formData.get("colourName") as string)?.trim() || "",
    colourHex: (formData.get("colourHex") as string)?.trim() || "#000000",
    occasions,
    weather,
    season,
    isVisible: formData.get("isVisible") === "true",
    images: images.filter((i: any) => i?.url),
    stock: stock.filter((s: any) => s?.size),
  }
}

export async function createProduct(formData: FormData) {
  await requireAdmin()
  const input = parseForm(formData)

  if (!input.name || !input.category || !input.price) {
    return { error: "Name, category, and price are required." }
  }
  if (input.images.length === 0) {
    return { error: "At least one image URL is required." }
  }

  const primaryIndex = input.images.findIndex(i => i.isPrimary)
  const imagesWithPrimary = input.images.map((img, i) => ({
    url: img.url,
    isPrimary: primaryIndex >= 0 ? i === primaryIndex : i === 0,
  }))

  const product = await prisma.product.create({
    data: {
      name: input.name,
      description: input.description,
      category: input.category,
      price: input.price,
      salePrice: input.salePrice,
      colourName: input.colourName,
      colourHex: input.colourHex,
      occasions: JSON.stringify(input.occasions),
      weather: JSON.stringify(input.weather),
      season: JSON.stringify(input.season),
      isVisible: input.isVisible,
      images: { create: imagesWithPrimary },
      stock: { create: input.stock.map(s => ({ size: s.size, quantity: Number(s.quantity) || 0 })) },
    },
  })

  // Generate semantic embedding so search can find this product.
  // Fire-and-forget so a slow Gemini call doesn't block the redirect.
  regenerateEmbedding(product.id).catch(() => {})

  revalidatePath("/admin/products")
  revalidatePath("/browse")
  redirect(`/admin/products/${product.id}/edit`)
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdmin()
  const input = parseForm(formData)

  if (!input.name || !input.category || !input.price) {
    return { error: "Name, category, and price are required." }
  }

  const primaryIndex = input.images.findIndex(i => i.isPrimary)

  await prisma.$transaction(async tx => {
    await tx.product.update({
      where: { id: productId },
      data: {
        name: input.name,
        description: input.description,
        category: input.category,
        price: input.price,
        salePrice: input.salePrice,
        colourName: input.colourName,
        colourHex: input.colourHex,
        occasions: JSON.stringify(input.occasions),
        weather: JSON.stringify(input.weather),
        season: JSON.stringify(input.season),
        isVisible: input.isVisible,
      },
    })

    await tx.productImage.deleteMany({ where: { productId } })
    if (input.images.length > 0) {
      await tx.productImage.createMany({
        data: input.images.map((img, i) => ({
          productId,
          url: img.url,
          isPrimary: primaryIndex >= 0 ? i === primaryIndex : i === 0,
        })),
      })
    }

    await tx.productStock.deleteMany({ where: { productId } })
    if (input.stock.length > 0) {
      await tx.productStock.createMany({
        data: input.stock.map(s => ({
          productId,
          size: s.size,
          quantity: Number(s.quantity) || 0,
        })),
      })
    }
  })

  // Regenerate the embedding since the document likely changed.
  regenerateEmbedding(productId).catch(() => {})

  revalidatePath("/admin/products")
  revalidatePath(`/admin/products/${productId}/edit`)
  revalidatePath("/browse")
  revalidatePath(`/product/${productId}`)
  return { success: true }
}

export async function deleteProduct(productId: string) {
  await requireAdmin()
  await prisma.product.update({
    where: { id: productId },
    data: { deletedAt: new Date(), isVisible: false },
  })
  revalidatePath("/admin/products")
  revalidatePath("/browse")
  return { success: true }
}

export async function restoreProduct(productId: string) {
  await requireAdmin()
  await prisma.product.update({
    where: { id: productId },
    data: { deletedAt: null, isVisible: true },
  })
  revalidatePath("/admin/products")
  revalidatePath("/browse")
  return { success: true }
}
