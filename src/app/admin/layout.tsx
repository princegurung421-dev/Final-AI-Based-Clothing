import Link from "next/link"
import { LayoutDashboard, Package, ShoppingCart, Mail, Tag } from "lucide-react"

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row flex-grow min-h-[calc(100vh-64px)] bg-[#F5F4F0]">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-border shrink-0 flex flex-col p-6">
         <h2 className="text-[13px] font-medium text-muted uppercase tracking-wider mb-8">Admin Panel</h2>
         
         <nav className="flex flex-col gap-2">
           <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/5 transition-colors text-[14px] font-medium text-foreground">
             <LayoutDashboard className="w-4 h-4 text-muted" /> Overview
           </Link>
           <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/5 transition-colors text-[14px] font-medium text-foreground">
             <Package className="w-4 h-4 text-muted" /> Products
           </Link>
           <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/5 transition-colors text-[14px] font-medium text-foreground">
             <ShoppingCart className="w-4 h-4 text-muted" /> Orders
           </Link>
           <Link href="/admin/promos" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/5 transition-colors text-[14px] font-medium text-foreground">
             <Tag className="w-4 h-4 text-muted" /> Promo codes
           </Link>
           <Link href="/admin/contact" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/5 transition-colors text-[14px] font-medium text-foreground">
             <Mail className="w-4 h-4 text-muted" /> Messages
           </Link>
         </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto w-full">
         <div className="max-w-5xl mx-auto">
           {children}
         </div>
      </main>
    </div>
  )
}
