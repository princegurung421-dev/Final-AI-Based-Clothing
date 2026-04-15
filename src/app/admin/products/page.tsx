import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/Button"

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      images: { take: 1 }
    }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-medium tracking-tight">Manage Products</h1>
        <Button>Add Product</Button>
      </div>

      <div className="bg-white border border-border shadow-sm overflow-hidden">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-muted/5 border-b border-border text-muted">
            <tr>
              <th className="px-6 py-4 w-16"></th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-[12px]">Product Name</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-[12px]">Category</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-[12px]">Price</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-[12px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map(product => {
               const primaryImage = product.images[0];
               return (
                 <tr key={product.id} className="hover:bg-muted/5 transition-colors">
                   <td className="px-6 py-4">
                     <div className="w-10 h-10 bg-muted/10 border border-border overflow-hidden">
                        {primaryImage && <img src={primaryImage.url} alt={product.name} className="w-full h-full object-cover" />}
                     </div>
                   </td>
                   <td className="px-6 py-4 font-medium">{product.name}</td>
                   <td className="px-6 py-4 text-muted">{product.category}</td>
                   <td className="px-6 py-4 font-medium">£{Number(product.price).toFixed(2)}</td>
                   <td className="px-6 py-4">
                     <div className="flex gap-3">
                       <button className="text-[13px] text-primary hover:underline">Edit</button>
                       <button className="text-[13px] text-error hover:underline">Delete</button>
                     </div>
                   </td>
                 </tr>
               )
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
