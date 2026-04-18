import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import {
  embedDocument,
  productDocument,
  embeddingsEnabled,
} from "@/lib/embeddings"

// POST /api/admin/embed-backfill
//   - optional body: { force?: boolean }  -> re-embed even if already set
//   - admin-only
//   - runs sequentially to stay inside free-tier rate limits
export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 })
  }

  if (!embeddingsEnabled()) {
    return NextResponse.json(
      { error: "GOOGLE_GENERATIVE_AI_API_KEY is not set on the server." },
      { status: 500 }
    )
  }

  let force = false
  try {
    const body = await req.json()
    force = Boolean(body?.force)
  } catch {
    /* body optional */
  }

  // Prisma's Json-null filter semantics are fiddly. Simpler to fetch all and
  // filter in JS — this is an admin endpoint, the catalogue is small.
  const allProducts = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      colourName: true,
      occasions: true,
      weather: true,
      season: true,
      embedding: true,
    },
  })
  const products = force ? allProducts : allProducts.filter(p => !p.embedding)

  let ok = 0
  let failed = 0
  for (const p of products) {
    const doc = productDocument(p)
    const vec = await embedDocument(doc)
    if (!vec) {
      failed++
      continue
    }
    await prisma.product.update({
      where: { id: p.id },
      data: { embedding: vec as any, embeddedAt: new Date() },
    })
    ok++
  }

  return NextResponse.json({
    processed: products.length,
    embedded: ok,
    failed,
  })
}
