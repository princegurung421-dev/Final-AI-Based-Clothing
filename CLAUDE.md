# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project: WearWise

AI-powered fashion e-commerce platform with a styling assistant chatbot, wardrobe management, and Stripe checkout. Built as a monolithic Next.js 16 app with PostgreSQL.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run seed         # Seed database with 12 products + admin account
npx prisma db push   # Sync Prisma schema to database (no migrations)
npx prisma studio    # Browse database in GUI
```

## Tech Stack

- **Next.js 16.2.2** (App Router) / React 19 / TypeScript 5
- **Prisma 6** + PostgreSQL
- **NextAuth 5 beta** (Credentials provider, JWT sessions, role-based access)
- **Vercel AI SDK** + Google Gemini 2.5 Flash Lite (streaming chat with tool use)
- **Stripe** (checkout payments)
- **Cloudinary** (wardrobe image uploads, unsigned preset `wearwise_unsigned`)
- **Tailwind CSS 4** (PostCSS plugin, no tailwind.config — uses CSS-first config)
- **OpenWeatherMap** + Nominatim (weather-aware outfit suggestions)

## Architecture

### Auth flow
`src/auth.ts` exports NextAuth handlers. `src/auth.config.ts` defines callbacks (JWT/session with role). `src/proxy.ts` is the middleware with route matcher. Roles: `USER` | `ADMIN`. Admin routes under `/admin/*` redirect non-admins.

### AI assistant
`/api/chat` route streams Gemini responses via Vercel AI SDK. The assistant has two tools: `searchStore` (queries products from DB) and `searchWardrobe` (queries user's wardrobe items). Client uses `useChat` from `@ai-sdk/react` with localStorage message persistence. Weather context is injected into the system prompt via geolocation + OpenWeatherMap.

### Database
Prisma schema at `prisma/schema.prisma`. Key models: User, Product (with ProductImage/ProductStock children), CartItem, Order/OrderItem, WardrobeItem, Review. Products use soft-delete (`deletedAt`). CartItem has unique constraint on `userId+productId+size`.

### Design system
CSS variables in `src/app/globals.css`. Primary: `#4A7C59` (sage green). Font: Plus Jakarta Sans (400, 500 only). Premium minimal aesthetic — generous spacing, flat cards, subtle borders.

### Component organization
- `src/components/layout/` — Header (with cart count badge), Footer, LayoutWrapper
- `src/components/ui/` — Button (primary/secondary/destructive/ghost), Card, Input, Modal, Toast

### Key patterns
- Pages are server components; interactive parts use `"use client"`
- Server actions for form mutations (login, register, profile, cart operations)
- `src/lib/prisma.ts` exports singleton PrismaClient
- `src/lib/utils.ts` exports `cn()` (clsx + tailwind-merge)

## Environment Variables

Required in `.env` (see `SETUP.md` for details):
`DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `GOOGLE_GENERATIVE_AI_API_KEY`, `OPENWEATHERMAP_API_KEY`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`
