// @ts-nocheck
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { convertToModelMessages, streamText, tool } from 'ai';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

export const maxDuration = 30;

// ─── Weather Helper ──────────────────────────────────────────

async function getWeatherSummary(options: { location: string; latitude?: number; longitude?: number }) {
  const { location, latitude, longitude } = options;
  const apiKey = process.env.OPENWEATHERMAP_API_KEY || process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return `${location}, weather unavailable.`;

  try {
    const query = typeof latitude === 'number' && typeof longitude === 'number'
      ? `lat=${latitude}&lon=${longitude}`
      : `q=${encodeURIComponent(location)}`;
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?${query}&appid=${apiKey}&units=metric`);
    if (!res.ok) return `${location}, weather unavailable.`;
    const data = await res.json();
    const temp = Math.round(data?.main?.temp);
    const feels = Math.round(data?.main?.feels_like ?? temp);
    const desc = data?.weather?.[0]?.description || 'clear';
    const humidity = data?.main?.humidity;
    return `${data?.name || location}: ${temp}°C, feels like ${feels}°C, ${desc}${typeof humidity === 'number' ? `, humidity ${humidity}%` : ''}.`;
  } catch {
    return `${location}, weather unavailable.`;
  }
}

// ─── Helpers ─────────────────────────────────────────────────

function computeRating(reviews: { rating: number }[]) {
  if (reviews.length === 0) return 0;
  return Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10;
}

function formatProduct(p: any) {
  const primaryImage = p.images?.find((i: any) => i.isPrimary) || p.images?.[0];
  const inStockSizes = (p.stock || []).filter((s: any) => s.quantity > 0).map((s: any) => s.size);
  return {
    id: p.id,
    name: p.name,
    price: Number(p.price),
    salePrice: p.salePrice ? Number(p.salePrice) : null,
    category: p.category,
    colourName: p.colourName,
    description: p.description,
    occasions: p.occasions,
    weather: p.weather,
    image: primaryImage?.url || null,
    rating: computeRating(p.reviews || []),
    reviewCount: (p.reviews || []).length,
    inStock: inStockSizes.length > 0,
    sizes: inStockSizes,
  };
}

// ─── POST Handler ────────────────────────────────────────────

export async function POST(req: Request) {
  const { messages, latitude, longitude, previousSummary } = await req.json();
  if (!messages) return new Response('Missing messages', { status: 400 });

  const session = await auth();
  const userId = session?.user?.id || null;

  // Load user profile
  let userLocation = 'London';
  let userProfile: any = null;
  if (userId) {
    userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, location: true, sizes: true, stylePreferences: true },
    });
    if (userProfile?.location) userLocation = userProfile.location;
  }

  const weatherSummary = await getWeatherSummary({
    location: userLocation,
    latitude: typeof latitude === 'number' ? latitude : undefined,
    longitude: typeof longitude === 'number' ? longitude : undefined,
  });

  const userContext = userProfile
    ? `User: ${userProfile.name || 'Anonymous'}. Location: ${userLocation}. Style preferences: ${userProfile.stylePreferences || '[]'}. Sizes: ${userProfile.sizes || '{}'}.`
    : `Guest user. Location: ${userLocation}.`;

  // Build previous conversation context if available
  const previousContext = previousSummary
    ? `\n\nPREVIOUS CONVERSATION CONTEXT (from an earlier session with this user -- use this to maintain continuity but do not repeat it back verbatim):\n${previousSummary}\n`
    : '';

  const systemPrompt = `
You are WearWise AI, an expert British fashion stylist and personal shopping assistant.
Your tone is refined, warm, quietly confident, natural, and helpful. Never use emojis. Never be overly enthusiastic.
Never greet the user with "hello" or "hi" -- answer each message directly.

${userContext}
Current weather: ${weatherSummary}${previousContext}

You have powerful tools to help users with EVERYTHING:

SHOPPING:
- Use searchProducts to find items by query, category, occasion, price, colour, or weather.
- Use getProductDetails for full info on a specific product.
- Use getTrending to show popular items.
- Use getRecommendations for smart outfit suggestions.

CART:
- Use addToCart to add items. ALWAYS confirm the size before adding -- ask the user if not specified. Show available sizes from searchProducts results.
- Use viewCart to show what's in the user's bag.
- Use removeFromCart to remove items.

ORDERS:
- Use viewOrders to show order history.
- Use getOrderDetails for a specific order.

WARDROBE:
- Use viewWardrobe to browse items the user already owns.
- Use addToWardrobe to save new wardrobe items.

STYLE:
- Use getStyleAdvice to get context for personalized recommendations based on weather, wardrobe, and preferences.

GUIDELINES:
- Keep responses concise -- 1-3 sentences plus tool results.
- When recommending products, call the relevant tool and let the results speak. Add a brief styling note.
- If the user is not logged in and tries an auth-required action, tell them to sign in first.
- When showing products, mention key details: name, price, and why it works for them.
- Be proactive: if someone asks about outfits for an occasion, also consider the weather.
- For cart actions, always confirm what was added/removed.
- You can chain tools: e.g., search for products, then recommend a complete outfit.
`;

  try {
    const result = await streamText({
      model: google('gemini-2.5-flash-lite'),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      maxSteps: 8,
      tools: {

        // ── Search Products ──
        searchProducts: tool({
          description: 'Search the WearWise store for products. Use filters to narrow results. Returns product cards with images, prices, and sizes.',
          parameters: z.object({
            query: z.string().optional().describe("Search term like 'jacket', 'blue dress', 'summer outfit'"),
            category: z.string().optional().describe("Category: Outerwear, Tops, Trousers, Dresses, Footwear, Accessories, Knitwear, Activewear, Suits, Loungewear"),
            occasion: z.string().optional().describe("Occasion: Work, Casual, Weekend, Date Night, Formal, Holiday, Gym, Brunch, Evening, Smart Casual"),
            priceMax: z.number().optional().describe('Maximum price in GBP'),
            colour: z.string().optional().describe('Colour name like Black, Navy, White'),
            weather: z.string().optional().describe('Weather: Cold, Mild, Warm, Hot, Rainy'),
          }),
          execute: async ({ query, category, occasion, priceMax, colour, weather }) => {
            const where: any = { isVisible: true, deletedAt: null };
            const AND: any[] = [];

            if (query) {
              AND.push({
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { description: { contains: query, mode: 'insensitive' } },
                  { category: { contains: query, mode: 'insensitive' } },
                ],
              });
            }
            if (category) AND.push({ category: { contains: category, mode: 'insensitive' } });
            if (occasion) AND.push({ occasions: { contains: occasion, mode: 'insensitive' } });
            if (colour) AND.push({ colourName: { contains: colour, mode: 'insensitive' } });
            if (weather) AND.push({ weather: { contains: weather, mode: 'insensitive' } });
            if (priceMax) AND.push({ price: { lte: priceMax } });
            if (AND.length > 0) where.AND = AND;

            try {
              const products = await prisma.product.findMany({
                where,
                take: 6,
                include: { images: true, stock: true, reviews: true },
                orderBy: { createdAt: 'desc' },
              });
              return { type: 'products', items: products.map(formatProduct) };
            } catch {
              return { type: 'error', error: 'Failed to search products.' };
            }
          },
        }),

        // ── Product Details ──
        getProductDetails: tool({
          description: 'Get full details for a specific product including all images, stock levels, reviews, and description.',
          parameters: z.object({
            productId: z.string().describe('The product ID'),
          }),
          execute: async ({ productId }) => {
            try {
              const p = await prisma.product.findUnique({
                where: { id: productId },
                include: { images: true, stock: true, reviews: true },
              });
              if (!p) return { type: 'error', error: 'Product not found.' };
              return {
                type: 'productDetail',
                product: {
                  ...formatProduct(p),
                  allImages: p.images.map((i) => i.url),
                  stock: p.stock.map((s) => ({ size: s.size, quantity: s.quantity })),
                  reviews: p.reviews.map((r) => ({ rating: r.rating, reviewer: r.reviewerName, text: r.text })),
                },
              };
            } catch {
              return { type: 'error', error: 'Failed to fetch product details.' };
            }
          },
        }),

        // ── Add to Cart ──
        addToCart: tool({
          description: 'Add a product to the user\'s shopping bag. Requires authentication. Always ask for size first if not specified.',
          parameters: z.object({
            productId: z.string().describe('The product ID to add'),
            size: z.string().describe('The size to add (e.g. S, M, L, 32, 9)'),
            quantity: z.number().optional().describe('Quantity to add, defaults to 1'),
          }),
          execute: async ({ productId, size, quantity = 1 }) => {
            if (!userId) return { type: 'authRequired', error: 'You need to sign in to add items to your bag. Head to /login to get started.' };

            try {
              const product = await prisma.product.findUnique({
                where: { id: productId },
                include: { stock: true, images: { where: { isPrimary: true }, take: 1 } },
              });
              if (!product) return { type: 'error', error: 'Product not found.' };

              const stockEntry = product.stock.find((s) => s.size === size);
              if (!stockEntry || stockEntry.quantity < quantity) {
                const available = product.stock.filter((s) => s.quantity > 0).map((s) => s.size);
                return { type: 'error', error: `Size ${size} is not available. Available sizes: ${available.join(', ')}` };
              }

              await prisma.cartItem.upsert({
                where: { userId_productId_size: { userId, productId, size } },
                update: { quantity: { increment: quantity } },
                create: { userId, productId, size, quantity },
              });

              return {
                type: 'cartAction',
                action: 'added',
                message: `Added ${product.name} (size ${size}) to your bag.`,
                product: { id: product.id, name: product.name, price: Number(product.price), size, image: product.images[0]?.url },
              };
            } catch {
              return { type: 'error', error: 'Failed to add item to cart.' };
            }
          },
        }),

        // ── View Cart ──
        viewCart: tool({
          description: 'Show the contents of the user\'s shopping bag with totals.',
          parameters: z.object({}),
          execute: async () => {
            if (!userId) return { type: 'authRequired', error: 'Sign in to view your bag.' };

            try {
              const items = await prisma.cartItem.findMany({
                where: { userId },
                include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
              });

              if (items.length === 0) return { type: 'cart', items: [], subtotal: 0, deliveryCost: 0, total: 0, itemCount: 0 };

              const cartItems = items.map((item) => ({
                id: item.id,
                productId: item.productId,
                name: item.product.name,
                price: Number(item.product.price),
                size: item.size,
                quantity: item.quantity,
                image: item.product.images[0]?.url,
              }));

              const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
              const deliveryCost = subtotal >= 50 ? 0 : 4.95;

              return {
                type: 'cart',
                items: cartItems,
                subtotal: Math.round(subtotal * 100) / 100,
                deliveryCost,
                total: Math.round((subtotal + deliveryCost) * 100) / 100,
                itemCount: cartItems.reduce((sum, i) => sum + i.quantity, 0),
              };
            } catch {
              return { type: 'error', error: 'Failed to load cart.' };
            }
          },
        }),

        // ── Remove from Cart ──
        removeFromCart: tool({
          description: 'Remove an item from the user\'s shopping bag.',
          parameters: z.object({
            productId: z.string().describe('Product ID to remove'),
            size: z.string().optional().describe('Specific size to remove. If omitted, removes all sizes of this product.'),
          }),
          execute: async ({ productId, size }) => {
            if (!userId) return { type: 'authRequired', error: 'Sign in to manage your bag.' };

            try {
              const where: any = { userId, productId };
              if (size) where.size = size;

              const items = await prisma.cartItem.findMany({ where, include: { product: true } });
              if (items.length === 0) return { type: 'error', error: 'Item not found in your bag.' };

              await prisma.cartItem.deleteMany({ where });
              const name = items[0].product.name;

              return {
                type: 'cartAction',
                action: 'removed',
                message: `Removed ${name}${size ? ` (size ${size})` : ''} from your bag.`,
              };
            } catch {
              return { type: 'error', error: 'Failed to remove item.' };
            }
          },
        }),

        // ── Recommendations ──
        getRecommendations: tool({
          description: 'Get smart outfit recommendations based on occasion, weather, and budget. Returns curated product selections.',
          parameters: z.object({
            occasion: z.string().optional().describe("E.g. 'Date Night', 'Work', 'Weekend', 'Brunch'"),
            weather: z.string().optional().describe("E.g. 'Cold', 'Warm', 'Rainy'"),
            budget: z.number().optional().describe('Maximum total budget in GBP'),
            style: z.string().optional().describe("E.g. 'Smart Casual', 'Formal', 'Relaxed'"),
          }),
          execute: async ({ occasion, weather, budget, style }) => {
            const where: any = { isVisible: true, deletedAt: null };
            const AND: any[] = [];

            if (occasion) AND.push({ occasions: { contains: occasion, mode: 'insensitive' } });
            if (weather) AND.push({ weather: { contains: weather, mode: 'insensitive' } });
            if (style) AND.push({ occasions: { contains: style, mode: 'insensitive' } });
            if (budget) AND.push({ price: { lte: budget } });
            if (AND.length > 0) where.AND = AND;

            try {
              const products = await prisma.product.findMany({
                where,
                take: 8,
                include: { images: true, stock: true, reviews: true },
                orderBy: { createdAt: 'desc' },
              });
              return { type: 'recommendations', items: products.map(formatProduct) };
            } catch {
              return { type: 'error', error: 'Failed to get recommendations.' };
            }
          },
        }),

        // ── View Orders ──
        viewOrders: tool({
          description: 'Show the user\'s order history with status and totals.',
          parameters: z.object({}),
          execute: async () => {
            if (!userId) return { type: 'authRequired', error: 'Sign in to view your orders.' };

            try {
              const orders = await prisma.order.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: { items: true },
              });

              if (orders.length === 0) return { type: 'orders', orders: [], message: 'No orders yet.' };

              return {
                type: 'orders',
                orders: orders.map((o) => ({
                  id: o.id,
                  orderNumber: o.orderNumber,
                  status: o.status,
                  total: Number(o.totalValue),
                  date: o.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                  itemCount: o.items.length,
                  items: o.items.map((i) => ({
                    name: i.productName,
                    size: i.size,
                    quantity: i.quantity,
                    price: Number(i.price),
                    image: i.imageUrl,
                  })),
                  trackingNumber: o.trackingNumber,
                })),
              };
            } catch {
              return { type: 'error', error: 'Failed to load orders.' };
            }
          },
        }),

        // ── Order Details ──
        getOrderDetails: tool({
          description: 'Get detailed information about a specific order by order number.',
          parameters: z.object({
            orderNumber: z.string().describe("Order number like 'WW00000001'"),
          }),
          execute: async ({ orderNumber }) => {
            if (!userId) return { type: 'authRequired', error: 'Sign in to view order details.' };

            try {
              const order = await prisma.order.findUnique({
                where: { orderNumber },
                include: { items: true },
              });
              if (!order || order.userId !== userId) return { type: 'error', error: 'Order not found.' };

              let address = null;
              try { address = JSON.parse(order.deliveryAddress); } catch { /* ignore */ }

              return {
                type: 'orderDetail',
                order: {
                  orderNumber: order.orderNumber,
                  status: order.status,
                  total: Number(order.totalValue),
                  subtotal: Number(order.subtotal),
                  deliveryCost: Number(order.deliveryCost),
                  date: order.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                  trackingNumber: order.trackingNumber,
                  address,
                  items: order.items.map((i) => ({
                    name: i.productName,
                    size: i.size,
                    quantity: i.quantity,
                    price: Number(i.price),
                    image: i.imageUrl,
                  })),
                },
              };
            } catch {
              return { type: 'error', error: 'Failed to load order details.' };
            }
          },
        }),

        // ── View Wardrobe ──
        viewWardrobe: tool({
          description: "Browse the user's personal wardrobe items they already own.",
          parameters: z.object({
            category: z.string().optional().describe("Filter by category: Tops, Trousers, Outerwear, Footwear, Dresses, Accessories"),
            colour: z.string().optional().describe('Filter by colour'),
          }),
          execute: async ({ category, colour }) => {
            if (!userId) return { type: 'authRequired', error: 'Sign in to view your wardrobe.' };

            try {
              const where: any = { userId };
              if (category) where.category = { contains: category, mode: 'insensitive' };
              if (colour) where.colour = { contains: colour, mode: 'insensitive' };

              const [items, totalCount] = await Promise.all([
                prisma.wardrobeItem.findMany({ where, take: 12, orderBy: { createdAt: 'desc' } }),
                prisma.wardrobeItem.count({ where: { userId } }),
              ]);

              return {
                type: 'wardrobe',
                items: items.map((i) => ({
                  id: i.id,
                  imageUrl: i.imageUrl,
                  category: i.category,
                  colour: i.colour,
                  tags: i.tags,
                })),
                totalCount,
              };
            } catch {
              return { type: 'error', error: 'Failed to load wardrobe.' };
            }
          },
        }),

        // ── Add to Wardrobe ──
        addToWardrobe: tool({
          description: 'Add a new item to the user\'s personal wardrobe.',
          parameters: z.object({
            imageUrl: z.string().describe('URL of the wardrobe item image'),
            category: z.string().optional().describe('Category: Tops, Trousers, Outerwear, Footwear, Dresses, Accessories'),
            colour: z.string().optional().describe('Colour of the item'),
          }),
          execute: async ({ imageUrl, category, colour }) => {
            if (!userId) return { type: 'authRequired', error: 'Sign in to manage your wardrobe.' };

            try {
              await prisma.wardrobeItem.create({
                data: { userId, imageUrl, category: category || null, colour: colour || null },
              });
              return { type: 'wardrobeAction', action: 'added', message: 'Added to your wardrobe.' };
            } catch {
              return { type: 'error', error: 'Failed to add to wardrobe.' };
            }
          },
        }),

        // ── Style Advice ──
        getStyleAdvice: tool({
          description: 'Get personalized style context based on the user\'s profile, wardrobe, and current weather. Use this to compose personalized advice.',
          parameters: z.object({
            occasion: z.string().optional().describe('What the advice is for'),
          }),
          execute: async ({ occasion }) => {
            try {
              let wardrobeSummary: any = null;
              let preferences = null;
              let sizes = null;

              if (userId) {
                const user = await prisma.user.findUnique({
                  where: { id: userId },
                  select: { stylePreferences: true, sizes: true },
                });
                preferences = user?.stylePreferences;
                sizes = user?.sizes;

                const wardrobeItems = await prisma.wardrobeItem.findMany({
                  where: { userId },
                  take: 20,
                });
                const categories = [...new Set(wardrobeItems.map((i) => i.category).filter(Boolean))];
                const colours = [...new Set(wardrobeItems.map((i) => i.colour).filter(Boolean))];
                wardrobeSummary = { totalItems: wardrobeItems.length, categories, colours };
              }

              return {
                type: 'styleContext',
                weather: weatherSummary,
                occasion: occasion || 'general',
                preferences,
                sizes,
                wardrobe: wardrobeSummary,
                isLoggedIn: !!userId,
              };
            } catch {
              return { type: 'error', error: 'Failed to get style context.' };
            }
          },
        }),

        // ── Trending ──
        getTrending: tool({
          description: 'Show the most popular and trending products based on reviews and ratings.',
          parameters: z.object({}),
          execute: async () => {
            try {
              const products = await prisma.product.findMany({
                where: { isVisible: true, deletedAt: null },
                include: { images: true, stock: true, reviews: true },
              });

              const sorted = products
                .map((p) => ({ ...p, avgRating: computeRating(p.reviews), reviewCount: p.reviews.length }))
                .sort((a, b) => b.reviewCount - a.reviewCount || b.avgRating - a.avgRating)
                .slice(0, 6);

              return { type: 'trending', items: sorted.map(formatProduct) };
            } catch {
              return { type: 'error', error: 'Failed to load trending products.' };
            }
          },
        }),
      },
    });

    return (result as any).toUIMessageStreamResponse();
  } catch (err) {
    console.error('AI API Error:', err);
    return new Response(JSON.stringify({ error: (err as any).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
