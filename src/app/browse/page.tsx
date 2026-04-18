import { prisma } from "@/lib/prisma"
import BrowseClient from "./BrowseClient"

// Natural-language → filter keyword mapping so "summer party" finds evening
// warm-weather pieces even though no product literally contains those words.
const SEMANTIC_MAP: Record<string, string[]> = {
  summer: ["Hot", "Warm", "Holiday", "Spring/Summer"],
  winter: ["Cold", "Autumn/Winter"],
  spring: ["Mild", "Spring/Summer"],
  autumn: ["Mild", "Cold", "Autumn/Winter"],
  fall: ["Mild", "Cold", "Autumn/Winter"],
  beach: ["Holiday", "Warm", "Hot", "Spring/Summer"],
  holiday: ["Holiday", "Warm"],
  vacation: ["Holiday", "Warm"],
  party: ["Evening", "Date Night", "Formal"],
  evening: ["Evening", "Date Night"],
  office: ["Work", "Smart Casual"],
  meeting: ["Work", "Formal", "Smart Casual"],
  work: ["Work", "Smart Casual"],
  formal: ["Formal", "Work"],
  wedding: ["Formal", "Evening", "Date Night"],
  date: ["Date Night", "Evening"],
  gym: ["Gym", "Active"],
  workout: ["Gym", "Active"],
  running: ["Gym", "Active"],
  weekend: ["Weekend", "Casual"],
  casual: ["Casual", "Weekend"],
  brunch: ["Brunch", "Smart Casual"],
  rain: ["Rainy"],
  rainy: ["Rainy"],
  cold: ["Cold"],
  hot: ["Hot", "Warm"],
  warm: ["Warm", "Mild"],
  cozy: ["Cold", "Autumn/Winter"],
  cosy: ["Cold", "Autumn/Winter"],
  lounge: ["Casual"],
}

function buildQueryOr(q: string) {
  const base: any[] = [
    { name: { contains: q, mode: "insensitive" } },
    { description: { contains: q, mode: "insensitive" } },
    { category: { contains: q, mode: "insensitive" } },
    { colourName: { contains: q, mode: "insensitive" } },
    { occasions: { contains: q, mode: "insensitive" } },
    { weather: { contains: q, mode: "insensitive" } },
    { season: { contains: q, mode: "insensitive" } },
  ]

  const lower = q.toLowerCase()
  const extra = new Set<string>()
  for (const [keyword, tags] of Object.entries(SEMANTIC_MAP)) {
    if (lower.includes(keyword)) tags.forEach((t) => extra.add(t))
  }
  for (const tag of extra) {
    base.push({ occasions: { contains: tag, mode: "insensitive" } })
    base.push({ weather: { contains: tag, mode: "insensitive" } })
    base.push({ season: { contains: tag, mode: "insensitive" } })
  }
  return base
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined } | Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await Promise.resolve(searchParams)

  const q = typeof params.q === "string" ? params.q.trim() : ""
  const asArray = (v: any): string[] =>
    v ? (Array.isArray(v) ? v : [v]) : []
  const categories = asArray(params.category)
  const occasions = asArray(params.occasion)
  const colours = asArray(params.colour)
  const inStock = params.inStock === "true"
  const sort = typeof params.sort === "string" ? params.sort : "newest"
  const priceMin = typeof params.priceMin === "string" && params.priceMin !== ""
    ? Number(params.priceMin)
    : null
  const priceMax = typeof params.priceMax === "string" && params.priceMax !== ""
    ? Number(params.priceMax)
    : null

  const AND: any[] = []
  if (q) AND.push({ OR: buildQueryOr(q) })
  if (categories.length > 0) AND.push({ category: { in: categories } })
  if (colours.length > 0) AND.push({ colourName: { in: colours } })
  if (occasions.length > 0) {
    AND.push({ OR: occasions.map((occ) => ({ occasions: { contains: occ, mode: "insensitive" } })) })
  }
  if (priceMin !== null && !Number.isNaN(priceMin)) AND.push({ price: { gte: priceMin } })
  if (priceMax !== null && !Number.isNaN(priceMax)) AND.push({ price: { lte: priceMax } })
  if (inStock) AND.push({ stock: { some: { quantity: { gt: 0 } } } })

  const where: any = { isVisible: true, deletedAt: null }
  if (AND.length > 0) where.AND = AND

  let orderBy: any = { createdAt: "desc" }
  if (sort === "price_asc") orderBy = { price: "asc" }
  if (sort === "price_desc") orderBy = { price: "desc" }

  let products: any[] = []
  try {
    products = await prisma.product.findMany({
      where,
      orderBy,
      include: { images: true, stock: true, reviews: true },
      take: 48,
    })
  } catch (e) {
    console.error("Browse error:", e)
  }

  const serialized = JSON.parse(JSON.stringify(products))

  return <BrowseClient initialProducts={serialized} initialCount={products.length} />
}
