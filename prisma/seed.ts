import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database with expanded catalog...')

  // Clear existing items in dependency order
  await prisma.review.deleteMany()
  await prisma.productStock.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.wardrobeItem.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  // ─── Seed Users ────────────────────────────────────────────

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@wearwise.test',
      name: 'WearWise Admin',
      role: 'ADMIN',
      hashedPassword: bcrypt.hashSync('admin123', 10),
      location: 'London',
    },
  })

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@wearwise.test',
      name: 'Alex Morgan',
      role: 'USER',
      hashedPassword: bcrypt.hashSync('demo123', 10),
      location: 'London',
      stylePreferences: JSON.stringify(['Smart Casual', 'Weekend', 'Date Night']),
      sizes: JSON.stringify({ top: 'M', bottom: '32', shoe: '9' }),
    },
  })

  console.log(`Created admin: ${adminUser.email} and demo: ${demoUser.email}`)

  // ─── Seed Products ─────────────────────────────────────────

  const products = [
    // ── Outerwear ──
    {
      name: 'Classic Beige Trench Coat',
      description: 'A timeless tailored trench coat featuring a double-breasted front and belted waist. Perfect for mild transitional weather.',
      category: 'Outerwear',
      price: 220.00,
      colourName: 'Beige',
      colourHex: '#F5F5DC',
      occasions: JSON.stringify(['Work', 'Smart Casual', 'Formal']),
      weather: JSON.stringify(['Mild', 'Rainy']),
      season: JSON.stringify(['Autumn/Winter', 'Spring/Summer']),
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=800', isPrimary: false },
        ],
      },
      reviews: {
        create: [
          { rating: 5, reviewerName: 'Sarah M.', text: 'Absolutely stunning coat. The tailoring is impeccable.' },
          { rating: 4, reviewerName: 'Lucy K.', text: 'Great quality, runs slightly large. Size down.' },
          { rating: 5, reviewerName: 'Emily R.', text: 'Worth every penny. Gets compliments constantly.' },
        ],
      },
      stock: { create: [{ size: 'S', quantity: 5 }, { size: 'M', quantity: 8 }, { size: 'L', quantity: 3 }] },
    },
    {
      name: 'Denim Trucker Jacket',
      description: 'The ultimate layering piece. Woven from 14oz Japanese selvedge denim for a sturdy feel that breaks in beautifully over time.',
      category: 'Outerwear',
      price: 165.00,
      colourName: 'Indigo',
      colourHex: '#00416A',
      occasions: JSON.stringify(['Casual', 'Weekend']),
      weather: JSON.stringify(['Mild', 'Cold']),
      season: JSON.stringify(['Autumn/Winter', 'Spring/Summer']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      reviews: {
        create: [
          { rating: 5, reviewerName: 'Tom B.', text: 'Japanese selvedge quality is unmistakable.' },
          { rating: 4, reviewerName: 'Mark H.', text: 'Stiff at first but breaks in perfectly.' },
        ],
      },
      stock: { create: [{ size: 'S', quantity: 10 }, { size: 'M', quantity: 15 }, { size: 'L', quantity: 8 }] },
    },
    {
      name: 'Quilted Puffer Vest',
      description: 'Lightweight diamond-quilted puffer vest with recycled down fill. Perfect for layering in changeable weather.',
      category: 'Outerwear',
      price: 135.00,
      colourName: 'Olive',
      colourHex: '#556B2F',
      occasions: JSON.stringify(['Casual', 'Weekend', 'Smart Casual']),
      weather: JSON.stringify(['Cold', 'Mild']),
      season: JSON.stringify(['Autumn/Winter']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1544923246-77307dd270aa?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      reviews: {
        create: [{ rating: 5, reviewerName: 'James D.', text: 'Brilliant for autumn walks. Light but very warm.' }],
      },
      stock: { create: [{ size: 'S', quantity: 6 }, { size: 'M', quantity: 12 }, { size: 'L', quantity: 7 }, { size: 'XL', quantity: 4 }] },
    },

    // ── Tops ──
    {
      name: 'Cashmere Roll Neck Sweater',
      description: 'Luxuriously soft pure cashmere roll neck sweater. Provides exceptional warmth and a highly sophisticated silhouette.',
      category: 'Tops',
      price: 150.00,
      colourName: 'Charcoal',
      colourHex: '#36454F',
      occasions: JSON.stringify(['Work', 'Smart Casual', 'Date Night']),
      weather: JSON.stringify(['Cold']),
      season: JSON.stringify(['Autumn/Winter']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      reviews: {
        create: [
          { rating: 5, reviewerName: 'James T.', text: 'Incredibly soft. True luxury knitwear.' },
          { rating: 5, reviewerName: 'Sophie L.', text: 'Bought three colours. Obsessed.' },
        ],
      },
      stock: { create: [{ size: 'M', quantity: 15 }, { size: 'L', quantity: 0 }, { size: 'XL', quantity: 4 }] },
    },
    {
      name: 'Relaxed Linen Blend Shirt',
      description: 'A breathable linen-cotton blend shirt perfect for summer days. Washed for exceptional softness from day one.',
      category: 'Tops',
      price: 65.00,
      colourName: 'Light Blue',
      colourHex: '#ADD8E6',
      occasions: JSON.stringify(['Casual', 'Weekend', 'Holiday']),
      weather: JSON.stringify(['Warm', 'Hot']),
      season: JSON.stringify(['Spring/Summer']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      reviews: {
        create: [{ rating: 4, reviewerName: 'David R.', text: 'Perfect summer shirt. Breathes well.' }],
      },
      stock: { create: [{ size: 'S', quantity: 6 }, { size: 'M', quantity: 10 }, { size: 'L', quantity: 5 }] },
    },
    {
      name: 'Heavyweight Cotton T-Shirt',
      description: 'A premium everyday basic constructed from dense 220gsm organic cotton. Holds its shape wash after wash.',
      category: 'Tops',
      price: 35.00,
      colourName: 'Black',
      colourHex: '#000000',
      occasions: JSON.stringify(['Casual', 'Weekend', 'Gym']),
      weather: JSON.stringify(['Warm', 'Mild']),
      season: JSON.stringify(['All year']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      reviews: {
        create: [
          { rating: 5, reviewerName: 'Chris W.', text: 'Best basic tee on the market. Heavy and substantial.' },
          { rating: 5, reviewerName: 'Anna P.', text: 'Bought the whole colour range.' },
          { rating: 4, reviewerName: 'Mike S.', text: 'Great quality for the price.' },
        ],
      },
      stock: { create: [{ size: 'S', quantity: 20 }, { size: 'M', quantity: 18 }, { size: 'L', quantity: 22 }, { size: 'XL', quantity: 15 }] },
    },
    {
      name: 'Merino Wool Polo',
      description: 'Fine gauge merino wool polo knit. Temperature-regulating, naturally odour-resistant, and endlessly versatile.',
      category: 'Tops',
      price: 95.00,
      colourName: 'Forest Green',
      colourHex: '#228B22',
      occasions: JSON.stringify(['Work', 'Smart Casual', 'Date Night']),
      weather: JSON.stringify(['Mild', 'Cold']),
      season: JSON.stringify(['Autumn/Winter', 'All year']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      reviews: {
        create: [{ rating: 5, reviewerName: 'Henry J.', text: 'Elevated casual. Works under a blazer or on its own.' }],
      },
      stock: { create: [{ size: 'S', quantity: 8 }, { size: 'M', quantity: 14 }, { size: 'L', quantity: 9 }] },
    },
    {
      name: 'Oversized Striped Breton Top',
      description: 'Classic Breton stripe in a relaxed oversized fit. Organic cotton jersey with a slightly heavier weight for structure.',
      category: 'Tops',
      price: 48.00,
      colourName: 'Navy/White',
      colourHex: '#000080',
      occasions: JSON.stringify(['Casual', 'Weekend', 'Holiday']),
      weather: JSON.stringify(['Mild', 'Warm']),
      season: JSON.stringify(['Spring/Summer', 'All year']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      stock: { create: [{ size: 'S', quantity: 11 }, { size: 'M', quantity: 16 }, { size: 'L', quantity: 8 }] },
    },

    // ── Trousers ──
    {
      name: 'Tailored Navy Chinos',
      description: 'Mid-weight cotton twill trousers tailored for a slim, tapered fit. With a touch of stretch for day-long comfort.',
      category: 'Trousers',
      price: 85.00,
      colourName: 'Navy',
      colourHex: '#000080',
      occasions: JSON.stringify(['Work', 'Smart Casual', 'Weekend']),
      weather: JSON.stringify(['Mild', 'Warm']),
      season: JSON.stringify(['All year']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      reviews: {
        create: [
          { rating: 5, reviewerName: 'Oliver G.', text: 'Perfect fit. The slight stretch is a game-changer.' },
          { rating: 4, reviewerName: 'Ben T.', text: 'Great office trouser. Could be slightly longer.' },
        ],
      },
      stock: { create: [{ size: '30', quantity: 8 }, { size: '32', quantity: 14 }, { size: '34', quantity: 10 }, { size: '36', quantity: 5 }] },
    },
    {
      name: 'Wide-Leg Linen Trousers',
      description: 'Airy wide-leg trousers crafted from sustainably sourced European linen. Features a subtle elasticated waistband.',
      category: 'Trousers',
      price: 115.00,
      colourName: 'Sand',
      colourHex: '#C2B280',
      occasions: JSON.stringify(['Casual', 'Weekend', 'Holiday']),
      weather: JSON.stringify(['Warm', 'Hot']),
      season: JSON.stringify(['Spring/Summer']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      reviews: {
        create: [{ rating: 5, reviewerName: 'Ella F.', text: 'So breezy and comfortable. Perfect for holidays.' }],
      },
      stock: { create: [{ size: 'XS', quantity: 4 }, { size: 'S', quantity: 12 }, { size: 'M', quantity: 8 }] },
    },
    {
      name: 'Slim Fit Selvedge Jeans',
      description: 'Japanese selvedge denim in a modern slim fit. Raw indigo that develops unique character with every wear.',
      category: 'Trousers',
      price: 145.00,
      colourName: 'Raw Indigo',
      colourHex: '#1A237E',
      occasions: JSON.stringify(['Casual', 'Weekend', 'Date Night']),
      weather: JSON.stringify(['Mild', 'Cold']),
      season: JSON.stringify(['All year']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      reviews: {
        create: [
          { rating: 5, reviewerName: 'Alex K.', text: 'These are the only jeans I wear now. Incredible quality.' },
          { rating: 5, reviewerName: 'Ryan M.', text: 'The fading after 6 months is beautiful.' },
        ],
      },
      stock: { create: [{ size: '30', quantity: 10 }, { size: '32', quantity: 18 }, { size: '34', quantity: 12 }, { size: '36', quantity: 6 }] },
    },

    // ── Dresses & Skirts ──
    {
      name: 'Silk Slip Dress',
      description: 'Elegant bias-cut silk slip dress that drapes beautifully. Features adjustable fine straps and a refined v-neckline.',
      category: 'Dresses',
      price: 195.00,
      colourName: 'Champagne',
      colourHex: '#F7E7CE',
      occasions: JSON.stringify(['Date Night', 'Formal', 'Evening']),
      weather: JSON.stringify(['Warm', 'Mild']),
      season: JSON.stringify(['Spring/Summer', 'All year']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      reviews: {
        create: [
          { rating: 5, reviewerName: 'Isabella C.', text: 'Wore this to a wedding. Absolute showstopper.' },
          { rating: 5, reviewerName: 'Grace H.', text: 'The silk quality is extraordinary.' },
        ],
      },
      stock: { create: [{ size: 'XS', quantity: 3 }, { size: 'S', quantity: 6 }, { size: 'M', quantity: 6 }] },
    },
    {
      name: 'Pleated Midi Skirt',
      description: 'A beautifully fluid midi skirt with knife pleats that create movement with every step. Hidden side zip closure.',
      category: 'Dresses',
      price: 130.00,
      colourName: 'Blush',
      colourHex: '#DE5D83',
      occasions: JSON.stringify(['Work', 'Formal', 'Date Night']),
      weather: JSON.stringify(['Mild', 'Warm']),
      season: JSON.stringify(['Spring/Summer']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      reviews: {
        create: [{ rating: 4, reviewerName: 'Charlotte D.', text: 'Beautiful movement. Pairs wonderfully with a silk blouse.' }],
      },
      stock: { create: [{ size: 'S', quantity: 7 }, { size: 'M', quantity: 11 }, { size: 'L', quantity: 9 }] },
    },
    {
      name: 'Cotton Wrap Dress',
      description: 'Flattering wrap silhouette in crisp cotton poplin. Adjustable tie waist and flared hem for a feminine finish.',
      category: 'Dresses',
      price: 88.00,
      colourName: 'Terracotta',
      colourHex: '#E2725B',
      occasions: JSON.stringify(['Casual', 'Weekend', 'Brunch']),
      weather: JSON.stringify(['Warm', 'Mild']),
      season: JSON.stringify(['Spring/Summer']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      reviews: {
        create: [
          { rating: 5, reviewerName: 'Mia W.', text: 'Perfect brunch dress. Love the terracotta colour.' },
          { rating: 4, reviewerName: 'Olivia N.', text: 'Flattering on every body type.' },
        ],
      },
      stock: { create: [{ size: 'XS', quantity: 5 }, { size: 'S', quantity: 9 }, { size: 'M', quantity: 12 }, { size: 'L', quantity: 7 }] },
    },

    // ── Footwear ──
    {
      name: 'Minimalist Leather Trainers',
      description: 'Clean, understated white leather trainers. Handcrafted in Portugal with tonal stitching and a durable rubber sole.',
      category: 'Footwear',
      price: 110.00,
      colourName: 'White',
      colourHex: '#FFFFFF',
      occasions: JSON.stringify(['Casual', 'Weekend', 'Smart Casual']),
      weather: JSON.stringify(['Mild', 'Warm']),
      season: JSON.stringify(['All year']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      reviews: {
        create: [
          { rating: 5, reviewerName: 'Oliver S.', text: 'Perfect daily trainers. Clean and timeless.' },
          { rating: 5, reviewerName: 'Liam P.', text: 'Very comfortable from day one.' },
          { rating: 4, reviewerName: 'Chris W.', text: 'Good material, keep them clean.' },
        ],
      },
      stock: { create: [{ size: '7', quantity: 5 }, { size: '8', quantity: 8 }, { size: '9', quantity: 10 }, { size: '10', quantity: 12 }] },
    },
    {
      name: 'Chunky Chelsea Boots',
      description: 'Classic Chelsea boots reinterpreted with an exaggerated rubber lug sole. Handcrafted using premium vegetable-tanned leather.',
      category: 'Footwear',
      price: 245.00,
      colourName: 'Black',
      colourHex: '#000000',
      occasions: JSON.stringify(['Smart Casual', 'Work', 'Weekend']),
      weather: JSON.stringify(['Cold', 'Rainy']),
      season: JSON.stringify(['Autumn/Winter', 'All year']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      reviews: {
        create: [
          { rating: 5, reviewerName: 'Daniel K.', text: 'Built like a tank. Gorgeous leather.' },
          { rating: 4, reviewerName: 'Josh L.', text: 'Takes a few wears to break in but worth it.' },
        ],
      },
      stock: { create: [{ size: '7', quantity: 2 }, { size: '8', quantity: 5 }, { size: '9', quantity: 7 }, { size: '10', quantity: 4 }] },
    },
    {
      name: 'Suede Loafers',
      description: 'Unlined suede penny loafers with hand-stitched moccasin construction. The epitome of effortless sophistication.',
      category: 'Footwear',
      price: 175.00,
      colourName: 'Tan',
      colourHex: '#D2B48C',
      occasions: JSON.stringify(['Smart Casual', 'Work', 'Date Night']),
      weather: JSON.stringify(['Mild', 'Warm']),
      season: JSON.stringify(['Spring/Summer', 'All year']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      reviews: {
        create: [{ rating: 5, reviewerName: 'William T.', text: 'Incredibly comfortable. Wear them sockless in summer.' }],
      },
      stock: { create: [{ size: '8', quantity: 6 }, { size: '9', quantity: 10 }, { size: '10', quantity: 8 }, { size: '11', quantity: 3 }] },
    },
    {
      name: 'Canvas Espadrilles',
      description: 'Handmade in Spain with traditional jute rope sole and premium cotton canvas upper. The quintessential summer shoe.',
      category: 'Footwear',
      price: 55.00,
      colourName: 'Navy',
      colourHex: '#000080',
      occasions: JSON.stringify(['Casual', 'Holiday', 'Weekend']),
      weather: JSON.stringify(['Warm', 'Hot']),
      season: JSON.stringify(['Spring/Summer']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      stock: { create: [{ size: '8', quantity: 10 }, { size: '9', quantity: 14 }, { size: '10', quantity: 8 }] },
    },

    // ── Accessories ──
    {
      name: 'Structured Canvas Tote Bag',
      description: 'Durable heavyweight canvas tote bag with reinforced leather straps. Includes an internal zip pocket for valuables.',
      category: 'Accessories',
      price: 45.00,
      colourName: 'Olive',
      colourHex: '#808000',
      occasions: JSON.stringify(['Casual', 'Work', 'Weekend']),
      weather: JSON.stringify(['Mild', 'Warm', 'Cold']),
      season: JSON.stringify(['All year']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      reviews: {
        create: [{ rating: 4, reviewerName: 'Emma B.', text: 'Great everyday bag. Sturdy construction.' }],
      },
      stock: { create: [{ size: 'OS', quantity: 20 }] },
    },
    {
      name: 'Wool-Cashmere Scarf',
      description: 'Generously sized scarf in a luxurious wool-cashmere blend. Subtle herringbone pattern adds quiet distinction.',
      category: 'Accessories',
      price: 68.00,
      colourName: 'Camel',
      colourHex: '#C19A6B',
      occasions: JSON.stringify(['Work', 'Smart Casual', 'Formal']),
      weather: JSON.stringify(['Cold', 'Mild']),
      season: JSON.stringify(['Autumn/Winter']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      stock: { create: [{ size: 'OS', quantity: 15 }] },
    },
    {
      name: 'Leather Belt',
      description: 'Full-grain vegetable-tanned leather belt with a brushed nickel buckle. Ages beautifully with wear.',
      category: 'Accessories',
      price: 52.00,
      colourName: 'Dark Brown',
      colourHex: '#3B2F2F',
      occasions: JSON.stringify(['Work', 'Smart Casual', 'Formal']),
      weather: JSON.stringify(['Mild', 'Warm', 'Cold']),
      season: JSON.stringify(['All year']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      stock: { create: [{ size: '32', quantity: 10 }, { size: '34', quantity: 14 }, { size: '36', quantity: 8 }] },
    },
    {
      name: 'Bucket Hat',
      description: 'Relaxed cotton bucket hat with a downturned brim. Lightweight and packable for summer adventures.',
      category: 'Accessories',
      price: 28.00,
      colourName: 'Stone',
      colourHex: '#D2C6B2',
      occasions: JSON.stringify(['Casual', 'Holiday', 'Weekend']),
      weather: JSON.stringify(['Warm', 'Hot']),
      season: JSON.stringify(['Spring/Summer']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      stock: { create: [{ size: 'S/M', quantity: 12 }, { size: 'L/XL', quantity: 10 }] },
    },
    {
      name: 'Sunglasses',
      description: 'Acetate frame sunglasses with polarised lenses. Classic rounded shape with UV400 protection.',
      category: 'Accessories',
      price: 85.00,
      colourName: 'Tortoiseshell',
      colourHex: '#8B4513',
      occasions: JSON.stringify(['Casual', 'Holiday', 'Weekend', 'Smart Casual']),
      weather: JSON.stringify(['Warm', 'Hot', 'Mild']),
      season: JSON.stringify(['Spring/Summer', 'All year']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      reviews: {
        create: [{ rating: 5, reviewerName: 'Lily P.', text: 'Polarised lenses make a huge difference. Love the shape.' }],
      },
      stock: { create: [{ size: 'OS', quantity: 25 }] },
    },

    // ── Knitwear ──
    {
      name: 'Cable Knit Cardigan',
      description: 'Chunky cable-knit cardigan in a relaxed fit. Made from a premium lambswool blend for warmth without weight.',
      category: 'Knitwear',
      price: 125.00,
      colourName: 'Cream',
      colourHex: '#FFFDD0',
      occasions: JSON.stringify(['Casual', 'Weekend', 'Smart Casual']),
      weather: JSON.stringify(['Cold', 'Mild']),
      season: JSON.stringify(['Autumn/Winter']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1434389677669-e08b4cda3a94?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      reviews: {
        create: [
          { rating: 5, reviewerName: 'Kate R.', text: 'Cosy perfection. Live in this all winter.' },
          { rating: 5, reviewerName: 'Hannah M.', text: 'Beautiful texture. Feels expensive.' },
        ],
      },
      stock: { create: [{ size: 'S', quantity: 7 }, { size: 'M', quantity: 14 }, { size: 'L', quantity: 10 }] },
    },

    // ── Activewear ──
    {
      name: 'Performance Running Shorts',
      description: 'Ultralight running shorts with built-in compression liner. Reflective details and zip pocket for essentials.',
      category: 'Activewear',
      price: 42.00,
      colourName: 'Black',
      colourHex: '#000000',
      occasions: JSON.stringify(['Gym', 'Active']),
      weather: JSON.stringify(['Warm', 'Hot', 'Mild']),
      season: JSON.stringify(['All year']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1562886877-aaaa5c14c2e9?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      stock: { create: [{ size: 'S', quantity: 15 }, { size: 'M', quantity: 20 }, { size: 'L', quantity: 12 }] },
    },
    {
      name: 'Seamless Training Top',
      description: 'Four-way stretch seamless top with moisture-wicking technology. Ergonomic design follows natural movement.',
      category: 'Activewear',
      price: 38.00,
      colourName: 'Sage',
      colourHex: '#4A7C59',
      occasions: JSON.stringify(['Gym', 'Active', 'Casual']),
      weather: JSON.stringify(['Warm', 'Mild']),
      season: JSON.stringify(['All year']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      stock: { create: [{ size: 'XS', quantity: 8 }, { size: 'S', quantity: 14 }, { size: 'M', quantity: 18 }, { size: 'L', quantity: 10 }] },
    },

    // ── Suits & Formalwear ──
    {
      name: 'Slim Fit Wool Blazer',
      description: 'Impeccably tailored blazer in pure Italian wool. Half-canvas construction for a natural drape.',
      category: 'Suits',
      price: 295.00,
      colourName: 'Charcoal',
      colourHex: '#36454F',
      occasions: JSON.stringify(['Work', 'Formal', 'Date Night', 'Smart Casual']),
      weather: JSON.stringify(['Mild', 'Cold']),
      season: JSON.stringify(['Autumn/Winter', 'All year']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      reviews: {
        create: [
          { rating: 5, reviewerName: 'Richard B.', text: 'Exceptional tailoring. Rivals blazers at twice the price.' },
          { rating: 5, reviewerName: 'Sebastian F.', text: 'The half-canvas construction gives it a beautiful shape.' },
        ],
      },
      stock: { create: [{ size: '38', quantity: 4 }, { size: '40', quantity: 8 }, { size: '42', quantity: 6 }, { size: '44', quantity: 3 }] },
    },

    // ── Loungewear ──
    {
      name: 'Organic Cotton Joggers',
      description: 'Relaxed-fit joggers in brushed-back organic cotton fleece. Ribbed cuffs and drawstring waist for a clean finish.',
      category: 'Loungewear',
      price: 58.00,
      colourName: 'Grey Marl',
      colourHex: '#9E9E9E',
      occasions: JSON.stringify(['Casual', 'Weekend', 'Gym']),
      weather: JSON.stringify(['Cold', 'Mild']),
      season: JSON.stringify(['Autumn/Winter', 'All year']),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&q=80&w=800', isPrimary: true }],
      },
      reviews: {
        create: [{ rating: 5, reviewerName: 'Sam G.', text: 'Softest joggers I own. Perfect WFH trousers.' }],
      },
      stock: { create: [{ size: 'S', quantity: 10 }, { size: 'M', quantity: 20 }, { size: 'L', quantity: 15 }, { size: 'XL', quantity: 8 }] },
    },
  ]

  const createdProducts: any[] = []
  for (const product of products) {
    const created = await prisma.product.create({ data: product })
    createdProducts.push(created)
  }

  console.log(`Created ${createdProducts.length} products`)

  // ─── Seed Wardrobe Items for Demo User ─────────────────────

  const wardrobeItems = [
    { userId: demoUser.id, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400', category: 'Tops', colour: 'White', tags: JSON.stringify({ Casual: true, Weekend: true }) },
    { userId: demoUser.id, imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=400', category: 'Trousers', colour: 'Blue', tags: JSON.stringify({ Casual: true, Weekend: true }) },
    { userId: demoUser.id, imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=400', category: 'Outerwear', colour: 'Black', tags: JSON.stringify({ Work: true, 'Smart Casual': true }) },
    { userId: demoUser.id, imageUrl: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&q=80&w=400', category: 'Footwear', colour: 'White', tags: JSON.stringify({ Casual: true, Gym: true }) },
    { userId: demoUser.id, imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=400', category: 'Tops', colour: 'Navy', tags: JSON.stringify({ Work: true, 'Smart Casual': true, 'Date Night': true }) },
  ]

  for (const item of wardrobeItems) {
    await prisma.wardrobeItem.create({ data: item })
  }

  console.log(`Created ${wardrobeItems.length} wardrobe items for demo user`)

  // ─── Seed Sample Orders for Demo User ──────────────────────

  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'WW00000001',
      userId: demoUser.id,
      status: 'DELIVERED',
      subtotal: 370.00,
      deliveryCost: 0.00,
      totalValue: 370.00,
      deliveryAddress: JSON.stringify({ fullName: 'Alex Morgan', addressLine1: '42 Kensington Gardens', city: 'London', postcode: 'W8 4PG', country: 'United Kingdom' }),
      trackingNumber: 'RM928374650GB',
      items: {
        create: [
          { productId: createdProducts[0].id, productName: 'Classic Beige Trench Coat', size: 'M', quantity: 1, price: 220.00, imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800' },
          { productId: createdProducts[3].id, productName: 'Cashmere Roll Neck Sweater', size: 'M', quantity: 1, price: 150.00, imageUrl: 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&q=80&w=800' },
        ],
      },
    },
  })

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'WW00000002',
      userId: demoUser.id,
      status: 'SHIPPED',
      subtotal: 195.00,
      deliveryCost: 4.95,
      totalValue: 199.95,
      deliveryAddress: JSON.stringify({ fullName: 'Alex Morgan', addressLine1: '42 Kensington Gardens', city: 'London', postcode: 'W8 4PG', country: 'United Kingdom' }),
      trackingNumber: 'RM837261540GB',
      items: {
        create: [
          { productId: createdProducts[5].id, productName: 'Heavyweight Cotton T-Shirt', size: 'M', quantity: 2, price: 35.00, imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800' },
          { productId: createdProducts[8].id, productName: 'Tailored Navy Chinos', size: '32', quantity: 1, price: 85.00, imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800' },
          { productId: createdProducts[20].id, productName: 'Structured Canvas Tote Bag', size: 'OS', quantity: 1, price: 45.00, imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800' },
        ],
      },
    },
  })

  console.log(`Created sample orders: ${order1.orderNumber}, ${order2.orderNumber}`)
  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
