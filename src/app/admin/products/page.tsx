import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus, Edit2, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { DeleteProductButton } from "./DeleteProductButton"
import { EmbedBackfillButton } from "./EmbedBackfillButton"

export const dynamic = "force-dynamic"

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      stock: true,
    },
  })
  const missingEmbeddings = products.filter(p => !p.embedding).length

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Manage Products</h1>
          <p className="text-[13px] text-muted mt-1">{products.length} total · {products.filter(p => !p.deletedAt).length} active</p>
        </div>
        <div className="flex items-center gap-6">
          <EmbedBackfillButton missing={missingEmbeddings} total={products.length} />
          <Link href="/admin/products/new">
            <Button>
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-muted/5 border-b border-border text-muted">
            <tr>
              <th className="px-6 py-4 w-16"></th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px]">Name</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px]">Category</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px]">Price</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px]">Stock</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px]">Status</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map(product => {
              const primaryImage = product.images[0]
              const totalStock = product.stock.reduce((sum, s) => sum + s.quantity, 0)
              const isDeleted = !!product.deletedAt
              const isHidden = !product.isVisible && !isDeleted
              return (
                <tr key={product.id} className={`hover:bg-muted/5 transition-colors ${isDeleted ? "opacity-50" : ""}`}>
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 bg-muted/10 border border-border rounded overflow-hidden">
                      {primaryImage && <img src={primaryImage.url} alt={product.name} className="w-full h-full object-cover" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{product.name}</td>
                  <td className="px-6 py-4 text-muted">{product.category}</td>
                  <td className="px-6 py-4 font-medium">
                    £{Number(product.price).toFixed(2)}
                    {product.salePrice && (
                      <span className="ml-2 text-[12px] text-error line-through">£{Number(product.salePrice).toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted">{totalStock}</td>
                  <td className="px-6 py-4">
                    {isDeleted ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-error/10 text-error">Deleted</span>
                    ) : isHidden ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-amber-50 text-amber-700">
                        <EyeOff className="w-3 h-3" /> Hidden
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">Live</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3 items-center">
                      <Link href={`/admin/products/${product.id}/edit`} className="text-[13px] text-primary hover:underline flex items-center gap-1">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </Link>
                      {!isDeleted && <DeleteProductButton id={product.id} name={product.name} />}
                    </div>
                  </td>
                </tr>
              )
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted">
                  No products yet. <Link href="/admin/products/new" className="text-primary hover:underline">Add your first one.</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
