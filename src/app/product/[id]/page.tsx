import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ProductClient from "./ProductClient"
import { auth } from "@/auth"

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = await Promise.resolve(params); // Next 15 awaits params
  const session = await auth();

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      stock: true,
      reviews: {
        orderBy: { date: 'desc' }
      }
    }
  });

  if (!product) {
    notFound();
  }

  // Fetch related products (Wear it with)
  let parsedOccasions = [];
  try {
    parsedOccasions = JSON.parse(product.occasions);
  } catch(e) {}
  
  const occasionTag = parsedOccasions[0];
  
  const relatedWhere: any = {
    id: { not: product.id },
    category: { not: product.category },
    isVisible: true
  };

  if (occasionTag) {
     relatedWhere.occasions = { contains: occasionTag };
  }

  const relatedProducts = await prisma.product.findMany({
    where: relatedWhere,
    take: 4,
    include: {
      images: {
        take: 1
      }
    }
  });

  // Serialize to prevent trailing Decimal props terminal noise
  const serializedProduct = JSON.parse(JSON.stringify(product));

  return (
    <ProductClient 
      product={serializedProduct} 
      relatedProducts={relatedProducts} 
      user={session?.user || null}
    />
  )
}
