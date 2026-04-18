import { prisma } from "@/lib/prisma"
import BrowseClient from "./BrowseClient"
import { embedQuery, cosine, embeddingsEnabled } from "@/lib/embeddings"

// Minimum similarity for a product to be considered a match. Below this the
// ranking is effectively noise — better to return nothing than irrelevant hits.
const SIMILARITY_FLOOR = 0.45

export default async function BrowsePage({
  searchParams,
}: {
  searchParams:
    | { [key: string]: string | string[] | undefined }
    | Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await Promise.resolve(searchParams)

  const q = typeof params.q === "string" ? params.q.trim() : ""
  const asArray = (v: any): string[] => (v ? (Array.isArray(v) ? v : [v]) : [])
  const categories = asArray(params.category)
  const occasions = asArray(params.occasion)
  const colours = asArray(params.colour)
  const inStock = params.inStock === "true"
  const sort = typeof params.sort === "string" ? params.sort : "newest"
  const priceMin =
    typeof params.priceMin === "string" && params.priceMin !== ""
      ? Number(params.priceMin)
      : null
  const priceMax =
    typeof params.priceMax === "string" && params.priceMax !== ""
      ? Number(params.priceMax)
      : null

  // ── Structured filters (shared between both paths) ──────────
  const AND: any[] = []
  if (categories.length > 0) AND.push({ category: { in: categories } })
  if (colours.length > 0) AND.push({ colourName: { in: colours } })
  if (occasions.length > 0) {
    AND.push({
      OR: occasions.map((occ) => ({
        occasions: { contains: occ, mode: "insensitive" },
      })),
    })
  }
  if (priceMin !== null && !Number.isNaN(priceMin)) AND.push({ price: { gte: priceMin } })
  if (priceMax !== null && !Number.isNaN(priceMax)) AND.push({ price: { lte: priceMax } })
  if (inStock) AND.push({ stock: { some: { quantity: { gt: 0 } } } })

  const where: any = { isVisible: true, deletedAt: null }
  if (AND.length > 0) where.AND = AND

  // ── Sort ────────────────────────────────────────────────────
  let orderBy: any = { createdAt: "desc" }
  if (sort === "price_asc") orderBy = { price: "asc" }
  if (sort === "price_desc") orderBy = { price: "desc" }

  // ── Query branch: semantic ranking ──────────────────────────
  let products: any[] = []

  if (q && embeddingsEnabled()) {
    // Pull all candidates matching structured filters, then rank with the
    // embedding. For a small catalogue (< 10k items) cosine over an in-memory
    // array is faster than a round-trip to a vector DB.
    const [queryVec, candidates] = await Promise.all([
      embedQuery(q),
      prisma.product.findMany({
        where,
        include: { images: true, stock: true, reviews: true },
        take: 500,
      }),
    ])

    if (queryVec) {
      const withEmb = candidates.filter((p) => Array.isArray(p.embedding))
      const scored = withEmb
        .map((p) => ({
          product: p,
          score: cosine(queryVec, p.embedding as unknown as number[]),
        }))
        .filter((r) => r.score >= SIMILARITY_FLOOR)
        .sort((a, b) => b.score - a.score)

      products = scored.slice(0, 48).map((r) => r.product)

      // Fallback: if embeddings haven't been generated yet for any product,
      // fall back to a simple LIKE search so the page isn't empty.
      if (products.length === 0 && withEmb.length < candidates.length) {
        products = await fallbackLikeSearch(q, where, orderBy)
      }
    } else {
      // Gemini API returned no vector — fall back
      products = await fallbackLikeSearch(q, where, orderBy)
    }
  } else if (q) {
    // No API key configured — keyword fallback
    products = await fallbackLikeSearch(q, where, orderBy)
  } else {
    products = await prisma.product.findMany({
      where,
      orderBy,
      include: { images: true, stock: true, reviews: true },
      take: 48,
    })
  }

  const serialized = JSON.parse(
    JSON.stringify(products, (key, value) => {
      // Strip embedding from payload sent to the client — it's 768 floats we
      // don't need in the browser and it triples the HTML size.
      if (key === "embedding") return undefined
      return value
    })
  )

  return <BrowseClient initialProducts={serialized} initialCount={products.length} />
}

async function fallbackLikeSearch(q: string, where: any, orderBy: any) {
  const nextWhere = {
    ...where,
    AND: [
      ...(where.AND || []),
      {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
          { colourName: { contains: q, mode: "insensitive" } },
          { occasions: { contains: q, mode: "insensitive" } },
          { weather: { contains: q, mode: "insensitive" } },
          { season: { contains: q, mode: "insensitive" } },
        ],
      },
    ],
  }
  return prisma.product.findMany({
    where: nextWhere,
    orderBy,
    include: { images: true, stock: true, reviews: true },
    take: 48,
  })
}
