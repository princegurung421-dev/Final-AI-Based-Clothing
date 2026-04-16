import { prisma } from "@/lib/prisma"
import OrderStatusDropdown from "./OrderStatusDropdown"

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
    }
  })

  return (
    <div>
      <h1 className="text-2xl font-medium tracking-tight mb-8">Manage Orders</h1>

      <div className="bg-white border border-border shadow-sm overflow-hidden">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-muted/5 border-b border-border text-muted">
            <tr>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-[12px]">Order ID</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-[12px]">Date</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-[12px]">Customer</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-[12px]">Total</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-[12px]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-muted/5 transition-colors">
                <td className="px-6 py-4 font-medium">{order.orderNumber}</td>
                <td className="px-6 py-4 text-muted">
                  {new Date(order.createdAt).toLocaleDateString('en-GB')}
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-foreground">{order.user?.name || 'Guest'}</p>
                  <p className="text-[12px] text-muted">{order.user?.email || 'N/A'}</p>
                </td>
                <td className="px-6 py-4 font-medium">£{Number(order.totalValue).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <OrderStatusDropdown orderId={order.id} currentStatus={order.status} />
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
