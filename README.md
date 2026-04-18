# WearWise

**AI-powered fashion e-commerce with a conversational stylist, semantic search, and real Stripe checkout.** Built as a monolithic Next.js 16 application on PostgreSQL, with Google Gemini powering both the chat assistant and the product search index.

Live deployment: <https://final-ai-based-clothing.vercel.app>

---

## Table of Contents

1. [What is this?](#what-is-this)
2. [Feature Matrix](#feature-matrix)
3. [AI Features in Detail](#ai-features-in-detail)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Quick Start](#quick-start)
7. [Environment Variables](#environment-variables)
8. [NPM Scripts](#npm-scripts)
9. [Database Schema](#database-schema)
10. [Page Routes](#page-routes)
11. [API Reference](#api-reference)
12. [Authentication](#authentication)
13. [Checkout Flow (Stripe PaymentIntents + Webhook)](#checkout-flow-stripe-paymentintents--webhook)
14. [Promo Code System](#promo-code-system)
15. [Admin Panel](#admin-panel)
16. [Rate Limiting](#rate-limiting)
17. [PWA (Installable App)](#pwa-installable-app)
18. [Design System](#design-system)
19. [Deployment](#deployment)
20. [Troubleshooting](#troubleshooting)

---

## What is this?

WearWise is a production-shape fashion store where the shopping experience is driven by conversation, not clicks. The core loop:

1. A shopper tells the AI stylist what they need — "a date night outfit under £200", "something cosy for a cold London day", "what do I have in my bag?"
2. Gemini 2.5 Flash Lite decides which of its tools to call — search the catalogue, check weather, add to cart, look up their order history — and streams the answer back.
3. Products surface as inline cards with one-tap **Add to Bag**. Outfits get personalised based on the user's saved size, style and current weather.
4. Checkout is real Stripe — card data never touches our server, payment confirmation comes back via webhook, stock decrements and cart clears atomically.
5. Admin manages the catalogue, orders, promo codes and contact messages through a role-gated panel.

It's 28 seeded products, 11 AI tools, 17 page routes, 11 API endpoints, a PWA manifest, and a vector index built with Gemini Embedding 1 — in a single Next.js app.

## Feature Matrix

| Area | Capabilities |
| --- | --- |
| **Storefront** | Landing page, browse with faceted filters (category, occasion, colour, price range, stock), semantic search, product detail with reviews and live weather relevance |
| **AI Stylist** | Streaming chat with 11 tools, per-user session history in a sidebar, new-chat / delete-chat, weather + profile injected into system prompt |
| **Semantic search** | Gemini Embedding 1 (`gemini-embedding-001`, 768 dim, task-type conditioned) over every product. Same vector index powers the navbar search **and** the AI's `searchProducts` tool |
| **Cart** | Add, update quantity, remove. Sale prices locked in at order time. Cross-device promo code persistence |
| **Checkout** | Stripe PaymentIntents with on-site Card Element, signed webhook (`payment_intent.succeeded` / `.payment_failed` / `charge.refunded`), idempotent order fulfilment |
| **Orders** | Customer history page, admin status board (`PENDING → PROCESSING → SHIPPED → DELIVERED`) |
| **Promo codes** | Admin CRUD. Percent or flat discount, max uses, min subtotal, expiry, once-per-user enforced at DB level. Seed ships `FIRSTORDER` (5% off) |
| **Contact** | Public form, rate-limited. Admin inbox with status (NEW / IN_PROGRESS / RESOLVED), internal notes, mailto reply |
| **Admin** | Dashboard with product CRUD (images, stock per size, occasions/weather/season pickers, colour picker, soft-delete), orders, promos, contact, embeddings backfill |
| **Auth** | NextAuth 5 credentials, JWT sessions with 30-day sliding expiry, role-gated admin routes |
| **PWA** | Manifest, dynamically-rendered icons, service worker, installable on Chrome/Edge/Android/iOS |
| **Static pages** | FAQ (accordion), Contact, Privacy Policy, Terms of Service |
| **Design** | Sage-green palette (#4A7C59), Plus Jakarta Sans, premium-minimal aesthetic |

## AI Features in Detail

This is where most of the interesting engineering lives. Three separate AI systems, one API key (`GOOGLE_GENERATIVE_AI_API_KEY`).

### 1. Conversational Stylist (`/assistant`)

- **Model**: `gemini-2.5-flash-lite` via the Vercel AI SDK (`@ai-sdk/google`, `streamText`).
- **Streaming**: responses stream token-by-token using the AI SDK's UI message protocol. The `useChat` hook on the client handles buffering and renders tool calls inline.
- **System prompt**: dynamically built on every request with:
  - User identity, saved location, style preferences, sizes
  - Current weather (from OpenWeatherMap, using browser lat/long if granted, else the saved location)
  - Optional "previous session summary" for context carry-forward
  - Explicit guidance on how to translate vibes ("summer beach", "cosy office") into tool filters
- **Tools** (11):

  | Tool | Purpose |
  | --- | --- |
  | `searchProducts` | Free-text + filter search; uses embeddings (see below) |
  | `getProductDetails` | Full product info including reviews and all images |
  | `getTrending` | Top products by review count and rating |
  | `getRecommendations` | Curated outfits for occasion + weather + budget |
  | `addToCart` | Requires auth; validates stock, asks for size if missing |
  | `viewCart` | Bag contents + subtotal + delivery + total |
  | `removeFromCart` | By size (or all sizes if omitted) |
  | `viewOrders` | Last 10 orders with status and tracking |
  | `getOrderDetails` | Single order by `WW…` number |
  | `getStyleAdvice` | Returns user prefs + weather + login state as context for the model to compose personalised advice |

- **Session history**: every chat saved to `ChatSession` with a title auto-derived from the first user message. Sidebar lists them, click to load, trash to delete. No expiry — they live until the user deletes them.
- **Cart-action bypass**: when the model suggests a product and the user taps **Add to Bag**, the UI hits `POST /api/chat/cart-action` directly instead of round-tripping back through the LLM, for instant feedback.

### 2. Semantic Search via Gemini Embedding 1

The hard-coded keyword-to-filter map that old-school search engines use (`"summer" → occasion:Holiday`) is a dead end for anything beyond the most obvious phrases. WearWise uses real vector embeddings.

- **Model**: `gemini-embedding-001` — Google's production embedding model.
  - Task-type conditioning: **documents** are embedded with `RETRIEVAL_DOCUMENT`, **queries** with `RETRIEVAL_QUERY`. Asymmetric encoding measurably improves retrieval accuracy versus using one task type for both.
  - Native 3072 dimensions, Matryoshka-trainable. We truncate to 768 for ~4× smaller storage at ~99% retrieval quality.
- **What we embed**: each product's composite document — `name · description · category · colour · occasions · weather · season`. Implemented in `src/lib/embeddings.ts:productDocument`.
- **Storage**: `Product.embedding` is a `Json?` column holding the 768-float array. Regenerated fire-and-forget inside `createProduct`/`updateProduct` server actions, so admin edits stay in sync. `npm run seed` also embeds every seeded product inline.
- **Backfill**: `POST /api/admin/embed-backfill` (admin-only) generates embeddings for any product that's missing one. Button surfaced on `/admin/products`.
- **Ranking**: at query time, we embed the query and compute cosine similarity against all candidates matching the structured filters (category, price, in-stock). Candidates below `SIMILARITY_FLOOR = 0.45` are dropped — better to return nothing than irrelevant hits. Fallback to a `LIKE` search if the Gemini call fails or no products are indexed yet.
- **Where it's used**:
  - The `/browse?q=…` page (server component)
  - The AI assistant's `searchProducts` tool
- **Why it's better than keywords**: `"something cosy for a cold winter day"` ranks Cable Knit Cardigan, Cashmere Roll Neck, Wool-Cashmere Scarf — none of which contain the word "cosy" in their data. Similarly `"elegant date night outfit"` → Silk Slip Dress, Pleated Midi Skirt, Wool Blazer.

Sanity-check numbers from the seeded catalogue:

```
>>> "something cosy for a cold winter day"
  0.675  Cable Knit Cardigan
  0.674  Cashmere Roll Neck Sweater
  0.645  Wool-Cashmere Scarf

>>> "elegant date night outfit"
  0.698  Silk Slip Dress
  0.659  Cashmere Roll Neck Sweater
  0.647  Pleated Midi Skirt

>>> "summer beach vibes"
  0.620  Relaxed Linen Blend Shirt
  0.605  Canvas Espadrilles
  0.603  Cotton Wrap Dress
```

### 3. Weather-Aware Recommendations

- Browser asks for geolocation permission on the assistant page.
- If granted: the chat API receives `{ latitude, longitude }` alongside each message.
- The server calls **OpenWeatherMap** (`api.openweathermap.org/data/2.5/weather`) and summarises "23°C, feels like 25°C, clear, humidity 54%" into the system prompt.
- If geolocation is denied, it falls back to the user's saved profile location (or London).
- The AI is instructed to combine weather with occasion — "a casual outfit for a warm weekend" → filters `occasion: Weekend, weather: Warm`.
- **Nominatim** (OpenStreetMap) reverse-geocodes the coordinates to a city label for display ("Current location" → "London"). No API key required.

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | **Next.js 16.2.2** (App Router, Turbopack dev, force-dynamic root layout) |
| UI | **React 19**, **TypeScript 5**, **Tailwind CSS 4** (CSS-first config, no `tailwind.config.js`) |
| Database | **PostgreSQL** + **Prisma 6** |
| Auth | **NextAuth 5** (beta), Credentials provider, JWT, 30-day sessions |
| AI chat | **Vercel AI SDK** + **Google Gemini 2.5 Flash Lite** |
| AI embeddings | **Gemini Embedding 1** (`gemini-embedding-001`, 768 dim) |
| Payments | **Stripe** PaymentIntents + signed webhook |
| Weather | **OpenWeatherMap** + **Nominatim** reverse-geocoding |
| Validation | **Zod** |
| Icons | **lucide-react** |
| Deployment | **Vercel** |

## Project Structure

```
prince/
├── prisma/
│   ├── schema.prisma                  all 12 models + enums
│   └── seed.ts                        28 products, 2 orders, FIRSTORDER promo, auto-embeds
├── public/
│   ├── sw.js                          PWA service worker (fetch passthrough)
│   └── *.svg                          decorative assets
└── src/
    ├── auth.ts                        NextAuth init + Credentials provider
    ├── auth.config.ts                 route authorization + JWT callbacks, 30d session
    ├── proxy.ts                       middleware entry
    ├── lib/
    │   ├── prisma.ts                  singleton PrismaClient
    │   ├── utils.ts                   cn() + effectivePrice/hasSale/formatPrice
    │   ├── embeddings.ts              Gemini Embedding 1 wrapper + cosine
    │   ├── stripe.ts                  Stripe SDK singleton
    │   ├── promo.ts                   validatePromo() shared by API + checkout
    │   └── ratelimit.ts               in-memory sliding-window limiter
    ├── components/
    │   ├── layout/
    │   │   ├── Header.tsx             nav, search, user menu, admin link
    │   │   ├── Footer.tsx             payment badges, static pages, install btn
    │   │   ├── LayoutWrapper.tsx      assistant-route height shim
    │   │   └── PaymentBadges.tsx      inline Visa/MC/Amex/Apple/Google Pay SVGs
    │   ├── ui/                        Button, Card, Input, Modal, Toast
    │   └── PWAInstall.tsx             beforeinstallprompt banner + footer btn
    └── app/
        ├── layout.tsx                 root — session, cart count, PWA metadata, Toast
        ├── globals.css                design tokens + Tailwind
        ├── manifest.ts                /manifest.webmanifest
        ├── icon-192.png/route.tsx     dynamic icons via next/og
        ├── icon-512.png/route.tsx
        ├── icon-maskable-512.png/route.tsx
        ├── apple-icon.tsx
        ├── page.tsx                   landing
        ├── browse/                    catalogue with semantic search + filters
        ├── product/[id]/              PDP with reviews + related
        ├── cart/                      bag + upsell + DB-backed promo
        ├── checkout/                  Stripe on-site checkout
        ├── orders/                    customer order history
        ├── profile/                   user profile + sizes + prefs
        ├── assistant/                 streaming chat with sidebar
        ├── login/  register/          auth flows
        ├── faq/  contact/  privacy/  terms/    static pages
        ├── admin/
        │   ├── layout.tsx             sidebar + ADMIN role gate
        │   ├── page.tsx               overview dashboard
        │   ├── products/              CRUD + EmbedBackfillButton
        │   ├── orders/                status dropdown
        │   ├── promos/                code CRUD
        │   └── contact/               message inbox
        └── api/
            ├── auth/[...nextauth]/    NextAuth handlers
            ├── cart/count/            badge count
            ├── chat/                  streaming AI + session + cart-action
            ├── contact/               form submission
            ├── promo/
            │   ├── validate/          apply a code
            │   └── active/            get/remove the current applied code
            ├── stripe/
            │   ├── checkout/          create Order + PaymentIntent
            │   └── webhook/           receive Stripe events
            └── admin/embed-backfill/  regenerate product vectors
```

## Quick Start

Prerequisites: Node 20+, PostgreSQL 14+, accounts with Google AI Studio, OpenWeatherMap, and Stripe (test mode).

```bash
# 1. Install
npm install

# 2. Create .env (see Environment Variables below)

# 3. Push schema to your database
npx prisma db push

# 4. Seed: 28 products, 2 orders, admin + demo users, FIRSTORDER promo
#    This also embeds every product via Gemini Embedding 1
npm run seed

# 5. Start the dev server
npm run dev
```

Open <http://localhost:3000>. Log in as `admin@wearwise.test` / `admin123` for the admin panel, or `demo@wearwise.test` / `demo123` as a regular user.

## Environment Variables

Create `.env` in the project root:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@host:5432/wearwise"

# NextAuth
AUTH_SECRET="$(openssl rand -base64 32)"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google Gemini (chat + embeddings, one key for both)
GOOGLE_GENERATIVE_AI_API_KEY="AIza..."

# OpenWeatherMap
OPENWEATHERMAP_API_KEY="..."

# Stripe test mode
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Where to get each key

- **Gemini** → <https://ai.google.dev> → Get API key. The free tier is plenty for this app.
- **OpenWeatherMap** → <https://openweathermap.org/api> → free tier, 60 calls/min (new keys take ~10 minutes to activate).
- **Stripe** → <https://dashboard.stripe.com/test/apikeys> → copy both keys. See the [Checkout Flow section](#checkout-flow-stripe-paymentintents--webhook) for the webhook secret.

## NPM Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next dev server at :3000 |
| `npm run build` | Runs `prisma generate` first so Vercel picks up schema changes, then `next build` |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run seed` | Reset + seed database, including inline Gemini embedding of every product |
| `npx prisma db push` | Apply `schema.prisma` to the database (no migrations) |
| `npx prisma studio` | Browse/edit DB in a GUI at :5555 |

## Database Schema

Twelve models in `prisma/schema.prisma`:

- **User** — auth identity; `role` (USER/ADMIN), `location`, JSON `stylePreferences`/`sizes`, `activePromoCode` (per-user applied code so it follows across devices)
- **Product** — catalogue. JSON strings for `occasions`/`weather`/`season`. `embedding` + `embeddedAt` for Gemini vectors. `isVisible` + `deletedAt` for soft-delete
- **ProductImage** — many per product, one flagged `isPrimary`
- **ProductStock** — `@@unique([productId, size])`
- **CartItem** — `@@unique([userId, productId, size])`
- **Order** — immutable snapshot with `discountAmount` + `promoCodeId`, `OrderStatus` enum (PENDING → PROCESSING → SHIPPED → DELIVERED)
- **OrderItem** — line items with `price` locked in at order time (sale price if applicable)
- **Review** — rating + text per product
- **ChatSession** — messages JSON, summary, optional title, per-user. No expiry
- **ContactMessage** — public contact form submissions, `ContactStatus` enum, `internalNote` for admin
- **PromoCode** — `discountType` enum (PERCENTAGE/FIXED), `maxUses`, `usesCount`, `oncePerUser`, `active`, `expiresAt`
- **PromoRedemption** — `@@unique([promoCodeId, userId])` — DB-enforced once-per-user

All primary keys are CUIDs.

## Page Routes

### Public

| Route | Purpose |
| --- | --- |
| `/` | Landing page with hero styling prompt |
| `/browse` | Catalogue with filters, semantic search (via `?q=…`), price range, sort |
| `/product/[id]` | PDP with reviews, weather relevance, related products |
| `/login` · `/register` | Auth |
| `/faq` · `/contact` · `/privacy` · `/terms` | Static information pages |

### Authenticated (USER)

| Route | Purpose |
| --- | --- |
| `/assistant` | AI chat with sidebar history |
| `/cart` | Bag, promo code, upsell strip |
| `/checkout` | Stripe on-site checkout (delivery → payment → confirmation) |
| `/orders` | Order history |
| `/profile` | Profile, preferences, sizes, delete account |

### Admin only (ADMIN role)

| Route | Purpose |
| --- | --- |
| `/admin` | Overview dashboard |
| `/admin/products` | List + embed-backfill button |
| `/admin/products/new` | Create product |
| `/admin/products/[id]/edit` | Edit everything: name, description, category, prices, colour, occasions/weather/season, visibility, images, stock per size |
| `/admin/orders` | All orders with inline status dropdown |
| `/admin/promos` | Promo code CRUD |
| `/admin/contact` | Contact message inbox |

Non-admin users hitting `/admin/*` are redirected to `/`.

## API Reference

All endpoints are under `/api/*`.

### Chat

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/chat` | Streams the AI response with tool-use. Rate-limited 30/min/IP |
| GET | `/api/chat/session` | List all chat sessions for the user |
| POST | `/api/chat/session` | Upsert the current session (auto-derives title) |
| DELETE | `/api/chat/session` | Wipe all sessions for the user |
| GET | `/api/chat/session/[id]` | Load a specific past conversation |
| DELETE | `/api/chat/session/[id]` | Delete one session |
| POST | `/api/chat/cart-action` | Fast add/remove used by chat product cards |

### Cart + Promo

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/cart/count` | Header badge count |
| POST | `/api/promo/validate` | Validate a code, persist on success. Rate-limited 10/min/IP |
| GET | `/api/promo/active` | Return the user's currently-applied code, re-validated against live cart |
| DELETE | `/api/promo/active` | Clear the applied code |

### Checkout + Webhook

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/stripe/checkout` | Snapshot cart → create PENDING Order + PaymentIntent. Returns `clientSecret`. Rate-limited 20/min/IP |
| POST | `/api/stripe/webhook` | Stripe → server. Verifies signature, handles `payment_intent.succeeded` / `.payment_failed` / `charge.refunded`, idempotent |

### Other

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/contact` | Save a contact message. Rate-limited 5/min/IP |
| POST | `/api/admin/embed-backfill` | Admin-only: regenerate embeddings for products missing them (or all if `{ force: true }`) |
| *    | `/api/auth/*` | NextAuth endpoints (signin, signout, session, csrf, providers) |

Full request/response schemas live in `API.md` (kept for historical reference, though the docs in this README cover everything you need day-to-day).

## Authentication

- **Strategy**: NextAuth 5 Credentials → JWT
- **Cookie**: `authjs.session-token` in dev, `__Secure-authjs.session-token` in prod (HTTPS)
- **Expiry**: `maxAge = 30 days`, `updateAge = 1 day` — sign in once, stay signed in for 30 days of inactivity; any activity extends the session another 30 days (`src/auth.config.ts`)
- **Password hashing**: `bcryptjs` at cost 10
- **Roles**: `USER` (default) and `ADMIN`
- **Route authorization**: `authorized()` callback in `src/auth.config.ts`:
  - Public: `/`, `/browse/*`, `/product/*`, `/login`, `/register`, `/faq`, `/contact`, `/privacy`, `/terms`
  - Private: everything else redirects to `/login`
  - `/admin/*`: additionally requires `role === 'ADMIN'`, non-admins are bounced to `/`
  - Authenticated users visiting `/login` or `/register` are bounced to `/`
- **Navbar auto-refresh**: `layout.tsx` is `dynamic = 'force-dynamic'`, login action calls `revalidatePath('/', 'layout')` before the NEXT_REDIRECT, and register calls `router.refresh()` after `signIn`. Net result: the nav picks up the new session without a manual reload.

## Checkout Flow (Stripe PaymentIntents + Webhook)

On-site Card Element, signed webhook, idempotent fulfilment. Not a redirect to Stripe's hosted checkout.

**The flow**:

1. Customer fills delivery address (Step 1 of `/checkout`).
2. Customer enters card in Stripe's `CardElement` (Step 2). Postcode is hidden in the card field because it's already on the delivery form.
3. On submit, `POST /api/stripe/checkout`:
   - Validates stock for every cart line
   - Reads `activePromoCode` from the user row server-side (never trusts the client)
   - Computes subtotal using `effectivePrice` (sale price if set, else regular)
   - Applies discount via `validatePromo`
   - Creates an `Order` in `PENDING` state with a snapshot of the cart
   - Creates a Stripe `PaymentIntent` with `metadata.orderId` linking them
   - Returns `clientSecret` to the client
4. Client calls `stripe.confirmCardPayment(clientSecret, …)` — this actually charges the card.
5. Stripe fires `payment_intent.succeeded` to `/api/stripe/webhook`. The handler:
   - Verifies the `Stripe-Signature` header against `STRIPE_WEBHOOK_SECRET`
   - Finds the order by `metadata.orderId`
   - **Only acts if status is still `PENDING`** — idempotent on Stripe retries
   - In a single transaction: flips status to `PROCESSING`, decrements stock per line, clears the user's cart, clears `activePromoCode`, bumps `PromoCode.usesCount`, and creates a `PromoRedemption` row
6. Admin moves the status through `SHIPPED → DELIVERED` in `/admin/orders`.

If the payment fails, the order stays `PENDING` so the customer can retry.

**Test cards** (Stripe's real test set — `4111 1111 1111 1111` is **not** a Stripe test card and will be rejected):

| Card | Behaviour |
| --- | --- |
| `4242 4242 4242 4242` | Always succeeds |
| `5555 5555 5555 4444` | Mastercard, always succeeds |
| `4000 0025 0000 3155` | Requires 3DS authentication popup |
| `4000 0000 0000 9995` | Always declined |

Any future expiry, any CVC.

### Stripe Dashboard setup

For the production webhook:

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. Endpoint URL: `https://your-domain/api/stripe/webhook`
3. Events to send: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
4. Copy the signing secret (`whsec_…`) into `STRIPE_WEBHOOK_SECRET` in your environment

For local development, use the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy the whsec_... it prints into your .env, restart npm run dev
stripe trigger payment_intent.succeeded   # optional — smoke test
```

## Promo Code System

- **Storage**: `PromoCode` + `PromoRedemption` models. `@@unique([promoCodeId, userId])` means once-per-user is enforced at the database level, not just in application code.
- **Shape**: code (uppercase, unique), description, type (PERCENTAGE / FIXED), value, min subtotal, max total uses, once-per-user flag, active flag, expiry.
- **Applied code lives on `User.activePromoCode`** — a single column per user. It persists across devices (unlike a cookie or localStorage) and is cleared automatically:
  - When the user removes it
  - When their cart goes empty and they hit the cart page again
  - When payment succeeds (webhook)
- **Validation** happens in `src/lib/promo.ts:validatePromo`, called by both `/api/promo/validate` and `/api/stripe/checkout`. Never trusts client input — the subtotal is recomputed server-side from the actual cart each time.
- **Seeded code**: `FIRSTORDER` (5% off, once per user). Visible on the cart page as a hint for new customers. Admin can edit or disable it at `/admin/promos`.
- **One code per checkout** — by design, since `User.activePromoCode` is a single column.

## Admin Panel

Accessible only to users with `role = 'ADMIN'`. Seed creates one at `admin@wearwise.test / admin123`.

- **`/admin`** — overview dashboard
- **`/admin/products`** — list of every product (including soft-deleted) with inline status (Live / Hidden / Deleted) and stock totals. Button strip includes an embeddings-indexed counter and a **Re-embed all** / **Embed missing** action
- **`/admin/products/new`** and **`/admin/products/[id]/edit`** — the `ProductForm` handles everything in one screen:
  - Name, description, category (dropdown of 10), price, sale price
  - Colour name + hex picker
  - Occasion / weather / season pill selectors
  - Visibility toggle
  - Multi-image with primary flag and per-image remove
  - Stock per size (add/edit/remove rows)
  - Creates generate an embedding fire-and-forget; edits regenerate
- **`/admin/orders`** — status dropdown per order, changes go through a server action
- **`/admin/promos`** — inline create/edit, active/paused toggle, usage counter
- **`/admin/contact`** — message list with status badges (NEW / IN_PROGRESS / RESOLVED). Expand a row to see the full message, update status, add internal notes, reply via mailto, or delete

## Rate Limiting

`src/lib/ratelimit.ts` — an in-memory sliding-window limiter keyed on `(namespace, IP)`. Per-instance, not distributed, but enough to stop casual spam and accidental retry storms without adding Redis.

| Endpoint | Limit |
| --- | --- |
| `/api/contact` | 5 / minute |
| `/api/promo/validate` | 10 / minute (brute-force defence) |
| `/api/stripe/checkout` | 20 / minute |
| `/api/chat` | 30 / minute (LLM cost containment) |

When the limit is exceeded the client gets a `429` with `Retry-After` set.

## PWA (Installable App)

Installable on Chrome (desktop/Android), Edge, and iOS Safari.

- **Manifest** at `/manifest.webmanifest` (`src/app/manifest.ts`) — name, short name, theme colour `#4A7C59`, standalone display, shortcuts for "AI Stylist" and "Shop" that appear when long-pressing the installed icon
- **Icons** are generated on demand via `next/og`:
  - `/icon-192.png`, `/icon-512.png` for the manifest
  - `/icon-maskable-512.png` with the "W" fitted inside the 80% safe area for Android's round masks
  - `/apple-icon` for iOS (Next auto-wires the `<link rel="apple-touch-icon">`)
- **Service worker** (`public/sw.js`) — a passthrough fetch handler. No caching, but Chrome's installability check requires the SW to actually `respondWith(fetch(…))` — an empty handler doesn't count.
- **Install prompt UX**: `src/components/PWAInstall.tsx` captures `beforeinstallprompt` into a module-scoped cache shared between the floating banner and a footer "Install app" button. The banner respects a "Not now" dismissal via localStorage. Hidden entirely when the app is already running in standalone mode.

To install: visit the deployed site in Chrome and click the install icon in the URL bar, or tap "Install app" in the footer. On iOS Safari use Share → Add to Home Screen (iOS doesn't fire `beforeinstallprompt`, but our `apple-icon` is what it uses for the home screen).

## Design System

- **Primary**: `#4A7C59` (sage green) — CSS variable `--primary` in `src/app/globals.css`
- **Font**: Plus Jakarta Sans, weights 400/500/600/700, loaded via `next/font`
- **Tailwind 4** — CSS-first config (no `tailwind.config.js`). Tokens declared as CSS custom properties and consumed through utility classes
- **UI primitives** in `src/components/ui/`:
  - `<Button variant="primary|secondary|destructive|ghost">`
  - `<Card>`, `<Input>`, `<Modal>`, `<Toast>` + `ToastProvider`
- **Helpers** in `src/lib/utils.ts`:
  - `cn()` — merges Tailwind classes intelligently (clsx + tailwind-merge)
  - `effectivePrice(p)` — returns `salePrice` if valid, else `price`
  - `hasSale(p)` — is there a valid discount?
  - `formatPrice(n)` — `£12.34`

## Deployment

Recommended: **Vercel + managed Postgres** (Neon, Supabase, Railway).

1. Push to GitHub and import the repo in Vercel.
2. Set every variable from your `.env` in **Project Settings → Environment Variables**.
3. Build command stays the default — `npm run build` runs `prisma generate && next build`, so schema changes on the client side are picked up at build time. (`postinstall` script also runs `prisma generate` as belt-and-braces.)
4. First deploy: run `npx prisma db push` against your production `DATABASE_URL` and `npm run seed` once if you want the sample catalogue.
5. Add the deployed origin to:
   - `NEXT_PUBLIC_APP_URL` in Vercel env
   - Stripe Dashboard → Webhooks (see [Checkout Flow](#checkout-flow-stripe-paymentintents--webhook) above)
6. Verify in DevTools → Application → Manifest (all fields green, icons loading) and → Service Workers (`sw.js` activated).

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `PrismaClientInitializationError` on first boot | `npx prisma db push` against your `DATABASE_URL` |
| Type error "Property X does not exist" during `npm run build` on Vercel | Stale Prisma client. Already handled — `build` runs `prisma generate` first and `postinstall` hooks it too. If it still happens, bump a deploy |
| `401 Unauthorized` on `/api/chat` after a reseed | JWT outlives DB reset. Sign out and back in |
| Add to cart says "Your session is out of date" | Same root cause — the user row was deleted. Sign out and in |
| Chat renders raw JSON instead of product cards | AI SDK v6 change — the assistant now uses `part.state === 'output-available'` and `part.output`. Clear the browser cache |
| Semantic search returns nothing new | Run the **Embed missing** button at `/admin/products`, or `POST /api/admin/embed-backfill` |
| "Your card number is incomplete" | You're using `4111 1111 1111 1111` — that's not a Stripe test card. Use `4242 4242 4242 4242` |
| Stripe webhook returns 400 (signature verification) | `STRIPE_WEBHOOK_SECRET` doesn't match the endpoint. Re-copy from Stripe Dashboard / `stripe listen` |
| Navbar doesn't update after login | Fixed — `layout.tsx` is `force-dynamic`, login action invalidates the layout cache, register calls `router.refresh()`. If it still happens, hard-refresh once |
| Chat window scrolls the whole page | Fixed — body is `h-dvh overflow-hidden` on `/assistant`, inner flex uses `min-h-0` so only the messages area scrolls |
| Price shown in reverse (sale strikethrough, full price bold) | Fixed — `effectivePrice` helper is now used everywhere |
| Promo code doesn't follow me across devices | Fixed — moved from localStorage to `User.activePromoCode`. Log out/in on the second device to pick it up |
| Install button never appears | Service worker must be registered (it is — check `/sw.js` returns 200), site must be HTTPS (Vercel is), and you can't have dismissed the banner. Clear the `wearwise:pwa-install-dismissed` localStorage key to re-show |
| Contact form returns 500 | Check Vercel function logs — the handler logs the Prisma error code + message. If the table is missing on prod, run `prisma db push`. Common cause: Vercel build used stale Prisma client |

---

**Questions?** Read the source — it's well-organised and reasonably small. Anything about the framework itself is in `AGENTS.md` (Next.js 16 has breaking changes from older versions; read `node_modules/next/dist/docs/` before fighting conventions). Everything else is described above.
