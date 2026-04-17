# WearWise

An AI-powered fashion e-commerce platform with a conversational styling assistant, personal wardrobe management, weather-aware outfit recommendations, and a full checkout flow with Stripe.

WearWise is a monolithic Next.js 16 application with PostgreSQL, built around a Gemini-driven chat agent that can search the store, browse the user's wardrobe, and manage their cart in real time.

---

## Table of Contents

1. [Features](#features)
2. [Live Routes](#live-routes)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Quick Start](#quick-start)
7. [Environment Variables](#environment-variables)
8. [NPM Scripts](#npm-scripts)
9. [Database Schema](#database-schema)
10. [Authentication and Roles](#authentication-and-roles)
11. [The AI Styling Assistant](#the-ai-styling-assistant)
12. [Wardrobe + Cloudinary Uploads](#wardrobe--cloudinary-uploads)
13. [Checkout with Stripe](#checkout-with-stripe)
14. [Admin Panel](#admin-panel)
15. [Design System](#design-system)
16. [API Documentation](#api-documentation)
17. [Deployment](#deployment)
18. [Troubleshooting](#troubleshooting)

---

## Features

- **Conversational AI stylist** — chat with Gemini 2.5 Flash Lite; it can search the store, recommend outfits, read the user's wardrobe, and add/remove cart items through tool calls.
- **Weather-aware recommendations** — real weather is fetched from OpenWeatherMap (with optional browser geolocation) and injected into the assistant's system prompt.
- **Full e-commerce flow** — browse, product detail, cart, Stripe checkout, orders history.
- **Personal wardrobe** — users can upload photos of items they already own (direct-to-Cloudinary unsigned uploads) and tag them by category, colour, and occasion.
- **Role-based admin panel** — admins manage products and move orders through `PENDING → PROCESSING → SHIPPED → DELIVERED`.
- **Session-persisted chat** — conversations are saved for 30 minutes; after expiry a short summary is carried forward as context into the next session.
- **Premium minimal design** — sage-green (#4A7C59) palette, Plus Jakarta Sans, flat cards, generous spacing.

## Live Routes

When the dev server is running (`npm run dev`), the following URLs are available at `http://localhost:3000`:

### Public

| Route | Page | Auth |
| --- | --- | --- |
| `/` | Landing page with hero styling prompt | Public |
| `/browse` | Product grid with category/occasion filters | Public |
| `/product/[id]` | Product detail + size selector + reviews | Public |
| `/login` | Sign-in | Public |
| `/register` | Create account | Public |

### Authenticated (USER)

| Route | Page |
| --- | --- |
| `/assistant` | Streaming chat UI with the AI stylist |
| `/cart` | Shopping bag |
| `/checkout` | Stripe-powered checkout |
| `/orders` | Order history |
| `/profile` | Profile, location, style preferences, sizes |
| `/wardrobe` | Personal wardrobe grid + upload |

### Admin only (ADMIN role)

| Route | Page |
| --- | --- |
| `/admin` | Admin dashboard |
| `/admin/products` | Product catalogue management |
| `/admin/orders` | Orders with status dropdown |

### API endpoints

See [API.md](./API.md) for full documentation.

| Endpoint | Purpose |
| --- | --- |
| `POST /api/chat` | Streaming chat with the AI stylist (13 tools) |
| `GET/POST/DELETE /api/chat/session` | Load, save, or clear chat sessions |
| `POST /api/chat/cart-action` | Quick add/remove cart from chat buttons |
| `GET /api/cart/count` | Header cart badge count |
| `GET/POST /api/auth/[...nextauth]` | NextAuth endpoints |

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16.2.2 (App Router) |
| UI | React 19, TypeScript 5, Tailwind CSS 4 (CSS-first config) |
| Database | PostgreSQL + Prisma 6 |
| Auth | NextAuth 5 beta (Credentials provider, JWT sessions) |
| AI | Vercel AI SDK + Google Gemini 2.5 Flash Lite |
| Payments | Stripe Checkout (test mode) |
| Images | Cloudinary (unsigned preset) |
| Weather | OpenWeatherMap + Nominatim |
| Validation | Zod |
| Icons | lucide-react |
| Charts | recharts |

## Project Structure

```
prince/
├── prisma/
│   ├── schema.prisma          Data model
│   └── seed.ts                12 sample products + admin account
├── public/                    Static assets
└── src/
    ├── auth.ts                NextAuth init + credentials provider
    ├── auth.config.ts         Callbacks + route authorization
    ├── proxy.ts               Middleware (route matcher)
    ├── lib/
    │   ├── prisma.ts          PrismaClient singleton
    │   └── utils.ts           cn() (clsx + tailwind-merge)
    ├── components/
    │   ├── layout/            Header, Footer, LayoutWrapper
    │   └── ui/                Button, Card, Input, Modal, Toast
    └── app/
        ├── layout.tsx         Root layout, fonts, providers
        ├── globals.css        Design tokens + Tailwind
        ├── page.tsx           Landing
        ├── HeroInput.tsx      Hero prompt input
        ├── browse/            Catalogue
        ├── product/[id]/      PDP
        ├── cart/              Bag + server actions
        ├── checkout/          Stripe session + confirmation
        ├── orders/            Order history
        ├── profile/           User profile
        ├── wardrobe/          Personal wardrobe (Cloudinary)
        ├── assistant/         Chat UI (useChat)
        ├── login/  register/  Auth flows
        ├── admin/             Admin dashboard, products, orders
        └── api/
            ├── auth/          NextAuth handlers
            ├── cart/count/    Cart badge
            └── chat/          Main chat + session + cart-action
```

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ (local or hosted — Neon, Supabase, Railway all work)
- Accounts / API keys for: Google AI Studio (Gemini), OpenWeatherMap, Cloudinary, Stripe (test mode)

## Quick Start

```bash
# 1. Install
npm install

# 2. Create .env (see template below)
cp .env.example .env        # or create manually

# 3. Push schema to your Postgres
npx prisma db push

# 4. Seed the database (12 products + one admin)
npm run seed

# 5. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The seed script prints the admin credentials it created — use them to sign in at `/login`, or register a new account from `/register`.

## Environment Variables

Create a `.env` at the project root:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/wearwise?schema=public"

# NextAuth
AUTH_SECRET="a_long_random_string"           # openssl rand -base64 32
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY="AIza..."

# OpenWeatherMap
OPENWEATHERMAP_API_KEY="your_openweathermap_key"

# Cloudinary (browser upload only)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"

# Stripe test mode
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
```

### Getting each key

- **Google Gemini**: [ai.google.dev](https://ai.google.dev) → Get API key
- **OpenWeatherMap**: [openweathermap.org/api](https://openweathermap.org/api) → free tier is sufficient
- **Cloudinary**: [cloudinary.com](https://cloudinary.com) → Dashboard → Cloud Name. Then create an **unsigned** upload preset named exactly `wearwise_unsigned` under Settings → Upload.
- **Stripe**: [stripe.com](https://stripe.com) → Developers → API keys (test mode)

## NPM Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start Next.js dev server at `:3000` |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run seed` | Wipe + reseed DB with 12 products and admin |
| `npx prisma db push` | Sync `schema.prisma` to the database |
| `npx prisma studio` | GUI to inspect / edit rows |

## Database Schema

Nine models defined in `prisma/schema.prisma`:

- **User** — auth identity; holds `role` (`USER`|`ADMIN`), `location`, JSON `stylePreferences` / `sizes`
- **Product** — catalogue entry; soft-deleted via `deletedAt`. JSON string columns for `occasions`, `weather`, `season`
- **ProductImage** — many per product, one flagged `isPrimary`
- **ProductStock** — stock per `(productId, size)`
- **CartItem** — unique on `(userId, productId, size)`
- **Order / OrderItem** — immutable order snapshots; `deliveryAddress` is a JSON string; supports guest checkout (`userId` nullable)
- **Review** — rating + text tied to a product
- **WardrobeItem** — user-owned garment (Cloudinary URL)
- **ChatSession** — messages JSON + summary, 30-minute TTL

The schema uses CUIDs for all primary keys.

## Authentication and Roles

Auth is handled by NextAuth 5 (beta) with a credentials provider.

- Passwords are hashed with **bcryptjs** at cost 10.
- Sessions are **JWT**. The `role` claim is copied into `session.user.role` in the `session` callback so client components and server actions can check it.
- Route authorization happens in `src/auth.config.ts#authorized()`:
  - `/`, `/browse`, `/product/*`, `/login`, `/register` are public
  - Everything else requires login
  - `/admin/*` additionally requires `role === 'ADMIN'`
  - Logged-in users visiting `/login` or `/register` are bounced to `/`
- The middleware entry point is `src/proxy.ts`.

## The AI Styling Assistant

The assistant lives at `/assistant` and is wired up via:

- **Frontend**: `useChat` from `@ai-sdk/react`. Messages are cached in `localStorage` for continuity between reloads.
- **Backend**: `POST /api/chat` streams `gemini-2.5-flash-lite` using `streamText` from the Vercel AI SDK.
- **System prompt**: injects the user profile, style preferences, sizes, and a live weather summary (from lat/long or the user's saved location).
- **Tools** (13 total): `searchProducts`, `getProductDetails`, `getTrending`, `getRecommendations`, `addToCart`, `viewCart`, `removeFromCart`, `viewOrders`, `getOrderDetails`, `viewWardrobe`, `addToWardrobe`, `getStyleAdvice`. See [API.md](./API.md#tool-reference) for the full schema of each.
- **Session persistence**: messages are written to `ChatSession` rows with a 30-minute `expiresAt`. After expiry the backend returns a short summary that the next session injects as `PREVIOUS CONVERSATION CONTEXT`.

## Wardrobe + Cloudinary Uploads

Wardrobe photos are uploaded **directly from the browser** to Cloudinary using the `wearwise_unsigned` unsigned preset — the Next.js server never holds the file. Once Cloudinary responds with a URL, the client calls the `addWardrobeItem` server action to persist the row.

To set up the preset:

1. Cloudinary dashboard → Settings → Upload → Upload presets
2. Add preset named exactly `wearwise_unsigned`
3. Set signing mode to **Unsigned**
4. Save

## Checkout with Stripe

1. `POST` via `createOrder` server action builds an order record (`PENDING`) and a Stripe Checkout Session.
2. User is redirected to Stripe-hosted checkout.
3. On return, the session is verified and order is moved to `PROCESSING`.
4. Admins then progress the status to `SHIPPED` / `DELIVERED` in `/admin/orders`.

Test cards: use `4242 4242 4242 4242`, any future expiry, any CVC, any postcode.

## Admin Panel

Accessible only to users with `role = 'ADMIN'`. The seed script creates one admin by default.

- `/admin` — overview dashboard with key counts
- `/admin/products` — list, edit, create, soft-delete products
- `/admin/orders` — list all orders with inline status dropdown; status changes go through `updateOrderStatus` server action

## Design System

Tokens are declared in `src/app/globals.css` using CSS custom properties (Tailwind CSS 4 is config-free — no `tailwind.config.js`).

- Primary: `#4A7C59` (sage green)
- Font: Plus Jakarta Sans (weights 400, 500 only)
- Vibe: premium minimal — generous padding, flat cards, thin borders, no drop shadows

UI primitives in `src/components/ui/`:

- `<Button variant="primary|secondary|destructive|ghost">`
- `<Card>`
- `<Input>`
- `<Modal>`
- `<Toast>`

Use `cn()` from `src/lib/utils.ts` to merge Tailwind class lists safely.

## API Documentation

All HTTP endpoints, server actions, and AI tools are documented in [**API.md**](./API.md). It covers:

- Auth & headers
- Request/response shapes
- Example `curl` invocations
- The 13 AI chat tools exposed via `/api/chat`
- Server actions invoked from forms (they don't show up as REST endpoints but are the effective write API)

**Quickest way to explore the API interactively:**

```bash
# 1. Start the app
npm run dev

# 2. Log in at http://localhost:3000/login, then copy the
#    `authjs.session-token` cookie out of DevTools

# 3. Hit an endpoint
curl -N http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=YOUR_COOKIE_HERE" \
  -d '{"messages":[{"role":"user","parts":[{"type":"text","text":"find me a navy coat under £200"}]}]}'
```

## Deployment

Recommended platform: **Vercel**.

1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Paste every variable from your `.env` into Project Settings → Environment Variables.
4. Set the build command to `npm run build` (default) and use a managed Postgres (Neon recommended — connection pooling via `?pgbouncer=true`).
5. On first deploy, run `npx prisma db push` against the production DATABASE_URL and `npm run seed` once.

Add your deployed origin to:

- `NEXT_PUBLIC_APP_URL`
- Stripe dashboard → success/cancel URL allowlist
- Cloudinary upload preset → allowed origins

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `PrismaClientInitializationError` on first boot | Run `npx prisma db push` against your DATABASE_URL |
| `401 Unauthorized` on `/api/chat` after a reseed | JWT outlives DB reset — sign out, sign back in |
| Wardrobe uploads fail | Preset name is case-sensitive: must be `wearwise_unsigned`, signing mode **Unsigned** |
| Weather always shows "unavailable" | Missing / invalid `OPENWEATHERMAP_API_KEY` (new keys can take 10 minutes to activate) |
| Gemini returns a 400 | Missing `GOOGLE_GENERATIVE_AI_API_KEY` or model quota exceeded |
| Admin redirect loop | User exists but `role` is `USER` — set it to `ADMIN` via `npx prisma studio` |
| Stripe "No such price" | You're using a live secret key with a test publishable key (or vice versa) |

---

Built with Next.js 16 — see [AGENTS.md](./AGENTS.md) for notes on working with this version of the framework.
