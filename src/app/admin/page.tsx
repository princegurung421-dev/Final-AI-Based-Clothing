import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/Card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default async function AdminOverviewPage() {
  const [totalOrders, totalProducts, users] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count()
  ])

  // Simple hardcoded chart data for MVP aesthetics
  const chartData = [
    { name: 'Mon', sales: 400 },
    { name: 'Tue', sales: 300 },
    { name: 'Wed', sales: 550 },
    { name: 'Thu', sales: 200 },
    { name: 'Fri', sales: 700 },
    { name: 'Sat', sales: 850 },
    { name: 'Sun', sales: 600 },
  ]

  return (
    <div>
      <h1 className="text-2xl font-medium tracking-tight mb-8">Dashboard Overview</h1>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="p-6 border-border shadow-sm">
           <h3 className="text-[13px] font-medium text-muted uppercase tracking-wider mb-2">Total Sales</h3>
           <p className="text-3xl font-medium">£3,600.00</p>
        </Card>
        <Card className="p-6 border-border shadow-sm">
           <h3 className="text-[13px] font-medium text-muted uppercase tracking-wider mb-2">Orders</h3>
           <p className="text-3xl font-medium">{totalOrders}</p>
        </Card>
        <Card className="p-6 border-border shadow-sm">
           <h3 className="text-[13px] font-medium text-muted uppercase tracking-wider mb-2">Products</h3>
           <p className="text-3xl font-medium">{totalProducts}</p>
        </Card>
        <Card className="p-6 border-border shadow-sm">
           <h3 className="text-[13px] font-medium text-muted uppercase tracking-wider mb-2">Customers</h3>
           <p className="text-3xl font-medium">{users}</p>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card className="p-6 border-border shadow-sm w-full h-[400px]">
        <h3 className="text-[15px] font-medium mb-6">Revenue this week</h3>
        <p className="text-muted text-[15px] p-12 text-center border border-dashed border-border rounded">
           [Sales Chart Placeholder: Next.js Recharts component renders here in a real env]
        </p>
      </Card>
    </div>
  )
}
