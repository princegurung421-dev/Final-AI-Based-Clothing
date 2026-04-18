import { GoogleGenAI } from "@google/genai"

// Gemini Embedding 1 (gemini-embedding-001):
//   - SOTA multilingual text embedding model
//   - native 3072 dims (Matryoshka-trainable — truncating to 768 keeps
//     ~99% of retrieval quality at a quarter of the cost/size)
//   - supports task-type conditioning: different embeddings for docs vs.
//     queries, which materially boosts retrieval accuracy
const MODEL = "gemini-embedding-001"
const EMBED_DIM = 768

const apiKey =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY

let _client: GoogleGenAI | null = null
function client(): GoogleGenAI | null {
  if (!apiKey) return null
  if (!_client) _client = new GoogleGenAI({ apiKey })
  return _client
}

export function embeddingsEnabled(): boolean {
  return Boolean(apiKey)
}

async function embed(
  text: string,
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY" | "SEMANTIC_SIMILARITY",
): Promise<number[] | null> {
  const ai = client()
  if (!ai) return null
  const trimmed = text.trim()
  if (!trimmed) return null

  try {
    const res = await ai.models.embedContent({
      model: MODEL,
      contents: [trimmed],
      config: {
        taskType,
        outputDimensionality: EMBED_DIM,
      },
    })
    const values = res.embeddings?.[0]?.values
    if (!values || values.length === 0) return null
    return Array.from(values)
  } catch (e) {
    console.error("Gemini embedding failed:", e)
    return null
  }
}

export function embedDocument(text: string) {
  return embed(text, "RETRIEVAL_DOCUMENT")
}

export function embedQuery(text: string) {
  return embed(text, "RETRIEVAL_QUERY")
}

/**
 * Compose the canonical "document" string for a product — combines all the
 * attributes worth matching against. Keep this stable; if you change it,
 * re-run the backfill so old embeddings aren't left out of sync.
 */
export function productDocument(p: {
  name: string
  description: string
  category: string
  colourName: string
  occasions: string
  weather: string
  season: string
}): string {
  const parseTags = (json: string) => {
    try {
      const parsed = JSON.parse(json)
      return Array.isArray(parsed) ? parsed.join(", ") : ""
    } catch {
      return ""
    }
  }
  const occ = parseTags(p.occasions)
  const wea = parseTags(p.weather)
  const sea = parseTags(p.season)

  return [
    p.name,
    p.description,
    `Category: ${p.category}.`,
    `Colour: ${p.colourName}.`,
    occ && `Works for: ${occ}.`,
    wea && `Suited to weather: ${wea}.`,
    sea && `Season: ${sea}.`,
  ]
    .filter(Boolean)
    .join(" ")
}

export function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0
  let dot = 0
  let aa = 0
  let bb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    aa += a[i] * a[i]
    bb += b[i] * b[i]
  }
  if (aa === 0 || bb === 0) return 0
  return dot / (Math.sqrt(aa) * Math.sqrt(bb))
}
