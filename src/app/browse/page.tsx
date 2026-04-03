import { prisma } from "@/lib/prisma"
import BrowseClient from "./BrowseClient"

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Await the searchParams mapping in Next 15 to ensure compatibility
  const params = await Promise.resolve(searchParams)

  // Parse filters
  const q = typeof params.q === 'string' ? params.q : undefined;
  const categoryParam = params.category;
  const categories = categoryParam ? (Array.isArray(categoryParam) ? categoryParam : [categoryParam]) : [];
  
  const occasionParam = params.occasion;
  const occasions = occasionParam ? (Array.isArray(occasionParam) ? occasionParam : [occasionParam]) : [];
  
  const colourParam = params.colour;
  const colours = colourParam ? (Array.isArray(colourParam) ? colourParam : [colourParam]) : [];
  
  const inStock = params.inStock === 'true';
  const sort = typeof params.sort === 'string' ? params.sort : 'newest';

  // Build Prisma Where Clause
  const whereClause: any = {
    isVisible: true,
  };

  if (q) {
    whereClause.name = {
      contains: q,
      // @ts-ignore (postgres specific ignore case if standard SQLite needs it, prisma handles it usually)
      mode: 'insensitive',
    };
  }

  if (categories.length > 0) {
    whereClause.category = {
      in: categories
    };
  }

  if (colours.length > 0) {
    whereClause.colourName = {
      in: colours
    }
  }

  // Occasions is stored as a JSON string array in SQLite FMP. 
  // Filtering JSON arrays in Prisma SQLite is tricky, we use simple string contains for MVP.
  if (occasions.length > 0) {
    whereClause.OR = occasions.map(occ => ({
      occasions: {
        contains: occ
      }
    }));
  }

  if (inStock) {
    whereClause.stock = {
      some: {
        quantity: {
          gt: 0
        }
      }
    }
  }

  // Determine sort order
  let orderByClause: any = { createdAt: 'desc' }; // default newest
  if (sort === 'price_asc') orderByClause = { price: 'asc' };
  if (sort === 'price_desc') orderByClause = { price: 'desc' };
  // popular could be based on order count or views, but we'll fallback to id for now
  if (sort === 'popular') orderByClause = { id: 'asc' }; 

  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: whereClause,
      orderBy: orderByClause,
      include: {
        images: true,
        stock: true,
        reviews: true,
      },
      // Pagination (max 24)
      take: 24,
    });
  } catch (e) {
    console.error("Browse Error:", e);
  }

  // Serialize Prisma decimal fields
  const serializedProducts = JSON.parse(JSON.stringify(products));

  return (
    <BrowseClient 
      initialProducts={serializedProducts} 
      initialCount={products.length} 
    />
  )
}
