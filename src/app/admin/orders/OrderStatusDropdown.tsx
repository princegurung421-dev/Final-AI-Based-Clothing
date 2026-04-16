"use client"

import { updateOrderStatus } from "./actions"
import { useToast } from "@/components/ui/Toast"

export default function OrderStatusDropdown({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const { addToast } = useToast()

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    const res = await updateOrderStatus(orderId, newStatus)
    
    if (res.success) {
      addToast(`Order updated to ${newStatus}`, "success")
    } else {
      addToast("Failed to update status", "error")
    }
  }

  return (
    <select 
      defaultValue={currentStatus} 
      onChange={handleStatusChange}
      className="text-[13px] border border-border px-2 py-1 rounded bg-white focus:outline-none focus:border-primary"
    >
      <option value="PENDING">PENDING</option>
      <option value="PROCESSING">PROCESSING</option>
      <option value="SHIPPED">SHIPPED</option>
      <option value="DELIVERED">DELIVERED</option>
    </select>
  )
}
