# WearWise API Reference

This document describes every HTTP endpoint, server action, and AI chat tool exposed by the WearWise application.

All examples assume the app runs at `http://localhost:3000`. For production deployments, replace it with your `NEXT_PUBLIC_APP_URL`.

---

## Table of Contents

1. [How to Access the API](#how-to-access-the-api)
2. [Authentication](#authentication)
3. [HTTP Endpoints](#http-endpoints)
   - [POST /api/chat](#post-apichat)
   - [GET /api/chat/session](#get-apichatsession)
   - [POST /api/chat/session](#post-apichatsession)
   - [DELETE /api/chat/session](#delete-apichatsession)
   - [GET /api/chat/session/[id]](#get-apichatsessionid)
   - [DELETE /api/chat/session/[id]](#delete-apichatsessionid)
   - [POST /api/chat/cart-action](#post-apichatcart-action)
   - [GET /api/cart/count](#get-apicartcount)
   - [POST /api/stripe/checkout](#post-apistripecheckout)
   - [POST /api/stripe/webhook](#post-apistripewebhook)
   - [/api/auth/*](#apiauth-nextauth)
4. [Server Actions (write API)](#server-actions-write-api)
5. [Tool Reference — AI Chat Tools](#tool-reference)
6. [Error Codes](#error-codes)
7. [Rate Limits](#rate-limits)
8. [Client SDK Usage (useChat)](#client-sdk-usage-usechat)

---

## How to Access the API

### 1. Start the app

```bash
npm run dev
```

The API is served alongside the app at `http://localhost:3000/api/*`.

### 2. Base URLs

| Environment | Base URL |
| --- | --- |
| Local dev | `http://localhost:3000` |
| Production | Whatever you set `NEXT_PUBLIC_APP_URL` to |

### 3. Quick test (no auth required)

```bash
curl http://localhost:3000/api/cart/count
# → {"count":0}
```

### 4. Authenticated requests

You need a NextAuth session cookie. The easiest path:

1. Start the dev server (`npm run dev`)
2. Open `http://localhost:3000/login` in a browser and sign in
3. Open DevTools → Application → Cookies → `http://localhost:3000`
4. Copy the value of the cookie named one of:
   - `authjs.session-token` (dev, HTTP)
   - `__Secure-authjs.session-token` (prod, HTTPS)
5. Attach it to your request:

```bash
curl http://localhost:3000/api/cart/count \
  -H "Cookie: authjs.session-token=PASTE_COOKIE_VALUE_HERE"
```

### 5. Interactive playground

- **Prisma Studio** — `npx prisma studio` opens a browser UI at `:5555` to inspect and edit every table. Great for seeing what the API is reading/writing.
- **`/assistant` page** — the best way to exercise `/api/chat` is via the built-in chat UI. It uses the same endpoints you'd call from curl.

---

## Authentication

- **Mechanism**: NextAuth 5 credentials provider → JWT session cookie
- **Roles**: `USER` (default) and `ADMIN`
- **Cookie name**: `authjs.session-token` (HTTP) or `__Secure-authjs.session-token` (HTTPS)
- **Header**: no bearer tokens — send the cookie
- **Expiry**: 30 days, sliding

### Flow

```
POST /api/auth/callback/credentials   ← set-cookie with session
  │
  ├─ request arrives with cookie
  ├─ middleware (src/proxy.ts) reads it
  ├─ auth.config.ts#authorized() decides: allow / redirect / deny
  └─ route handlers and server actions call `auth()` to read userId + role
```

### Obtaining a cookie programmatically (headless)

NextAuth's credentials callback expects a CSRF token. The simplest way is to use the browser flow, or script a Playwright login. For production CI, prefer adding an API-token strategy rather than scripting credentials.

---

## HTTP Endpoints

### `POST /api/chat`

Stream a response from the AI stylist. Returns a Server-Sent Events-style stream following the Vercel AI SDK's `UIMessageStream` protocol.

**Auth**: optional — guest users work, logged-in users get personalised context (profile, wardrobe, order history).

**Request body**:

```json
{
  "messages": [
    {
      "role": "user",
      "parts": [{ "type": "text", "text": "find me a navy coat under £200" }]
    }
  ],
  "latitude": 51.5074,
  "longitude": -0.1278,
  "previousSummary": null
}
```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `messages` | `UIMessage[]` | yes | Conversation so far, in AI SDK format |
| `latitude` | number | no | If present, OpenWeatherMap is queried by lat/long |
| `longitude` | number | no | Pair with `latitude` |
| `previousSummary` | string \| null | no | Summary of an earlier (expired) chat, carried forward as context |

**Response**: `text/event-stream`. Each chunk is a delta of text or a tool call / tool result. Use `@ai-sdk/react`'s `useChat` hook on the client to consume it automatically.

**Example**:

```bash
curl -N http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=..." \
  -d '{
    "messages": [
      { "role": "user",
        "parts": [{ "type": "text", "text": "what should I wear for a date night in 10°C rain?" }] }
    ]
  }'
```

The response will include tool calls (e.g. `searchProducts`, `getRecommendations`) and a final text response. The assistant has access to **13 tools** — see [Tool Reference](#tool-reference).

**Behaviour**:

- Uses model `gemini-2.5-flash-lite` (Google)
- Max 8 steps of tool use per request
- `maxDuration: 30` seconds
- System prompt is dynamically built with: user name, location, style preferences, sizes, current weather summary, optional previous-session summary

---

### `GET /api/chat/session`

Return the list of the user's past chat sessions (for the sidebar).

**Auth**: required (returns `{ sessions: [] }` for guests).

**Response**:

```json
{
  "sessions": [
    {
      "id": "ckxxx...",
      "title": "Find me a date night outfit",
      "preview": "User: find me a date night outfit under £200...",
      "updatedAt": "2026-04-17T18:32:00.000Z"
    }
  ]
}
```

Sorted by `updatedAt` desc, up to 50 most recent.

---

### `POST /api/chat/session`

Save / upsert a chat session. `title` is auto-derived from the first user message.

**Auth**: required.

**Request body**:

```json
{
  "messages": [ /* UIMessage[] */ ],
  "sessionId": "ckxxx..."
}
```

| Field | Required | Notes |
| --- | --- | --- |
| `messages` | yes | Full current message array |
| `sessionId` | no | If provided, updates that session; otherwise creates a new one |

**Response**: `{ "sessionId": "ckxxx..." }`

Sessions no longer expire — they live permanently in the sidebar until the user deletes them.

---

### `DELETE /api/chat/session`

Delete **all** chat sessions for the user.

**Auth**: required. **Response**: `{ "success": true }`

---

### `GET /api/chat/session/[id]`

Load a specific past conversation (for when the user clicks it in the sidebar).

**Auth**: required. **Response**:

```json
{
  "id": "ckxxx...",
  "title": "Find me a date night outfit",
  "messages": [ /* UIMessage[] */ ],
  "summary": "User: ...\nAssistant: ...",
  "updatedAt": "..."
}
```

Returns 404 if the session doesn't exist or belongs to a different user.

---

### `DELETE /api/chat/session/[id]`

Delete one specific past session. **Auth**: required.

---

### `POST /api/chat/cart-action`

Fast cart manipulation endpoint used by in-chat quick-action buttons (so the chat UI doesn't have to go back through the LLM to add/remove an item the user has already agreed on).

**Auth**: required.

**Request body**:

```json
{
  "action": "add",
  "productId": "ckxxx...",
  "size": "M",
  "quantity": 1
}
```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `action` | `"add" \| "remove"` | yes | |
| `productId` | string | yes | Product CUID |
| `size` | string | required for `add`; optional for `remove` | Size key (`S`, `M`, `32`, `9`, …) |
| `quantity` | number | no | Defaults to 1 |

**Success**: `200` → `{ "success": true }`

**Errors**:

| Status | When |
| --- | --- |
| 400 | Missing `productId`; missing `size` when adding; size not in stock |
| 401 | Not authenticated |
| 500 | DB error |

**Example**:

```bash
curl -X POST http://localhost:3000/api/chat/cart-action \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=..." \
  -d '{"action":"add","productId":"clabc123","size":"M"}'
```

---

### `GET /api/cart/count`

Returns the total number of items in the authenticated user's cart. Used by the header badge.

**Auth**: optional. Returns `{ "count": 0 }` for guests.

**Response**:

```json
{ "count": 3 }
```

Count is the sum of `quantity` across all cart items — not the number of distinct rows.

---

### `POST /api/stripe/checkout`

Snapshot the cart into a new `PENDING` Order and create a Stripe PaymentIntent linked to it. The client uses the returned `clientSecret` with `stripe.confirmCardPayment()` to actually charge the card.

**Auth**: required.

**Request body**:

```json
{
  "fullName": "Alex Morgan",
  "addressLine1": "42 Kensington Gardens",
  "addressLine2": "",
  "city": "London",
  "postcode": "SW1A 1AA",
  "country": "United Kingdom"
}
```

**Success** (`200`):

```json
{
  "clientSecret": "pi_3xxx_secret_xxx",
  "orderNumber": "WW00000042",
  "orderId": "ckxxx..."
}
```

**Errors**:

| Status | When |
| --- | --- |
| 400 | Missing address fields; cart is empty; an item in the cart exceeds available stock |
| 401 | Not signed in |
| 500 | Stripe rejected the PaymentIntent creation |

The server validates stock before creating anything. If Stripe fails after the Order is created, the server rolls back the Order.

**Side effects**: creates a DB row (`Order` + `OrderItem`s). Does **not** decrement stock or clear the cart — that happens in the webhook, once payment actually succeeds.

---

### `POST /api/stripe/webhook`

Stripe → server webhook endpoint. Verifies the `Stripe-Signature` header against `STRIPE_WEBHOOK_SECRET`, then handles:

| Event | Effect |
| --- | --- |
| `payment_intent.succeeded` | Order PENDING → PROCESSING · stock decremented · user's cart cleared (idempotent — re-delivery is a no-op) |
| `payment_intent.payment_failed` | Logged; Order stays PENDING so the user can retry from checkout |
| `charge.refunded` | Adds a refund note on the Order |
| any other | Acknowledged with 200 |

**Auth**: signature-based, **not** cookie-based.

**Important**: the handler reads the raw request body — the route deliberately avoids `req.json()` so the HMAC signature check passes.

**Curl'ing this directly will always fail** with 400 because you can't forge the signature. To simulate events, use the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger payment_intent.succeeded
```

See [README.md §Checkout with Stripe](./README.md#checkout-with-stripe) for dashboard setup.

---

### `/api/auth/*` (NextAuth)

NextAuth 5 mounts a handful of endpoints under `/api/auth/`:

| Path | Method | Purpose |
| --- | --- | --- |
| `/api/auth/signin` | GET | Sign-in page handler |
| `/api/auth/signout` | POST | Clear session |
| `/api/auth/callback/credentials` | POST | Credentials callback — accepts `email` + `password` |
| `/api/auth/session` | GET | Current session JSON (for client-side hooks) |
| `/api/auth/csrf` | GET | CSRF token |
| `/api/auth/providers` | GET | Configured providers |

All of these are provided by NextAuth — see its docs at [authjs.dev](https://authjs.dev) for full details.

---

## Server Actions (write API)

Most write operations are exposed as **Next.js server actions**, not HTTP endpoints. They're invoked from form submissions or client components via the `"use server"` boundary. For programmatic access outside the browser, you'd need to re-implement them as API routes.

Still, they are effectively the write API, so here is the full list:

### `src/app/login/actions.ts`

- `authenticate(prevState, formData)` — credentials sign-in. Returns `'Invalid credentials.'` or `'Something went wrong.'` on failure; throws/redirects on success.
- `logout()` — sign out and redirect to `/`.

### `src/app/register/actions.ts`

- `registerUser(formData)` — create a user. Returns `{ error }` or `{ success: true }`. Fields: `email`, `password`, `firstName`, `lastName`, `styles` (JSON array), `location`, `sizes` (JSON object).

### `src/app/cart/actions.ts`

- `addCartItem(productId, size)` — upsert a cart row for the logged-in user.
- `updateCartQuantity(itemId, quantity)` — set quantity; removes row if ≤ 0.
- `removeCartItem(itemId)` — delete a cart row.
- `syncPendingCart(productId, size)` — used post-login to replay a pre-login "add to cart" click.

### `src/app/checkout/actions.ts`

- `createOrder(formData)` — create an `Order` in `PENDING` state and a Stripe Checkout Session. Accepts the full shipping address and cart snapshot.

### `src/app/profile/actions.ts`

- `updateProfileInfo(formData)` — name and email
- `updateLocation(location)` — city/country string (used by the weather helper)
- `updatePreferences('styles' | 'sizes', data)` — JSON blob
- `deleteAccount()` — hard delete

### `src/app/wardrobe/actions.ts`

- `addWardrobeItem({ imageUrl, category, colour, tags })` — persist a Cloudinary URL
- `deleteWardrobeItem(id)` — remove

### `src/app/admin/orders/actions.ts`

- `updateOrderStatus(orderId, status)` — admin-only; moves an order through `PENDING → PROCESSING → SHIPPED → DELIVERED`.

---

## Tool Reference

The AI stylist at `POST /api/chat` has access to these 13 tools. Each one is a Zod-schema'd function that Gemini can call during a response. You don't call them directly — the LLM does, based on the user's message. The response stream includes tool calls and tool results.

### Shopping

#### `searchProducts`

Search the catalogue. All filters optional.

```ts
{
  query?: string        // "jacket", "blue dress"
  category?: string     // Outerwear, Tops, Trousers, Dresses, Footwear, Accessories, Knitwear, Activewear, Suits, Loungewear
  occasion?: string     // Work, Casual, Weekend, Date Night, Formal, Holiday, Gym, Brunch, Evening, Smart Casual
  priceMax?: number     // GBP
  colour?: string       // Black, Navy, White, …
  weather?: string      // Cold, Mild, Warm, Hot, Rainy
}
```

Returns up to 6 products with images, price, rating, review count, in-stock sizes.

#### `getProductDetails`

```ts
{ productId: string }
```

Returns full product: all images, all stock sizes with quantities, all reviews.

#### `getTrending`

```ts
{}
```

Top 6 products ranked by review count then average rating.

#### `getRecommendations`

Curated picks based on intent.

```ts
{
  occasion?: string
  weather?: string
  budget?: number        // max total GBP
  style?: string
}
```

Returns up to 8 products.

### Cart

#### `addToCart`  (auth required)

```ts
{ productId: string, size: string, quantity?: number }
```

Upserts a cart row. Validates stock — if size unavailable, returns the list of available sizes.

#### `viewCart`  (auth required)

```ts
{}
```

Returns cart items plus `subtotal`, `deliveryCost` (free over £50, £4.95 otherwise), `total`, `itemCount`.

#### `removeFromCart`  (auth required)

```ts
{ productId: string, size?: string }
```

If `size` omitted, removes every size of that product.

### Orders

#### `viewOrders`  (auth required)

```ts
{}
```

Last 10 orders with items, status, total, tracking number.

#### `getOrderDetails`  (auth required)

```ts
{ orderNumber: string }   // e.g. "WW00000001"
```

Full order including parsed delivery address.

### Wardrobe

#### `viewWardrobe`  (auth required)

```ts
{ category?: string, colour?: string }
```

Up to 12 wardrobe items plus the user's total count.

#### `addToWardrobe`  (auth required)

```ts
{ imageUrl: string, category?: string, colour?: string }
```

Persists a new wardrobe item. `imageUrl` should be a Cloudinary URL (the frontend uploads first, then calls this tool).

### Style

#### `getStyleAdvice`

```ts
{ occasion?: string }
```

Returns a bundle of personalised context: weather summary, user prefs, sizes, wardrobe summary (`totalItems`, `categories`, `colours`), `isLoggedIn` flag. The model uses this to compose bespoke advice without making multiple separate tool calls.

### Tool response shapes

Every tool returns one of these `type` discriminators (useful when rendering tool output on the client):

| `type` | When |
| --- | --- |
| `products` | `searchProducts` |
| `productDetail` | `getProductDetails` |
| `trending` | `getTrending` |
| `recommendations` | `getRecommendations` |
| `cart` | `viewCart` |
| `cartAction` | `addToCart` / `removeFromCart` success |
| `orders` | `viewOrders` |
| `orderDetail` | `getOrderDetails` |
| `wardrobe` | `viewWardrobe` |
| `wardrobeAction` | `addToWardrobe` success |
| `styleContext` | `getStyleAdvice` |
| `authRequired` | User not signed in for an auth-gated tool |
| `error` | Tool-specific failure |

---

## Error Codes

| Status | Meaning | Typical cause |
| --- | --- | --- |
| 200 | OK | |
| 400 | Bad request | Missing field (e.g. `size` on cart-action add); invalid JSON |
| 401 | Unauthorized | Missing / expired session cookie; `userId` from JWT not found in DB (happens after a `npm run seed` reset) |
| 404 | Not found | Wrong product / order number |
| 500 | Internal | DB down, Gemini API quota, OpenWeatherMap outage |

For `/api/chat`, non-200s come back as a JSON body `{ "error": "..." }` rather than a stream.

---

## Rate Limits

WearWise does not implement per-user rate limits itself. Upstream limits:

- **Gemini**: the free tier for `gemini-2.5-flash-lite` is generous but finite — if you see 429s from the chat endpoint, you've hit the model quota.
- **OpenWeatherMap**: free tier is 60 calls/minute. The weather helper caches nothing, so one chat = one weather call.
- **Stripe**: 100 req/sec default.

For production you should add a rate limiter (e.g. Upstash Ratelimit) in front of `/api/chat` — each call costs real tokens.

---

## Client SDK Usage (`useChat`)

Frontend code in `src/app/assistant/page.tsx` consumes `/api/chat` via the Vercel AI SDK hook:

```tsx
"use client"
import { useChat } from "@ai-sdk/react"

export function ChatUI() {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: "/api/chat",
    body: { latitude, longitude, previousSummary },
  })

  return (
    <>
      {messages.map(m => (
        <Message key={m.id} role={m.role} parts={m.parts} />
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </>
  )
}
```

The hook automatically:

- Appends each delta to the latest assistant message
- Surfaces tool calls as `part.type === 'tool-invocation'`
- Handles errors (retry, abort, etc.)

See the `/assistant` route for how session persistence is wired in — it `GET`s `/api/chat/session` on mount, seeds `messages` from the response, and `POST`s back after every new message.

---

**Questions?** Read the source — it's small and all in `src/app/api/`. For issues with the wider Next.js 16 conventions, check `AGENTS.md` and `node_modules/next/dist/docs/`.
