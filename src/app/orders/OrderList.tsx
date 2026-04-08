"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { cn } from "@/lib/utils"

export default function OrderList({ orders }: { orders: any[] }) {
  const [expandedOrderId, setExpandedOrderId] = React.useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => prev === id ? null : id)
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'text-error border-error/20 bg-error/5';
      case 'PROCESSING': return 'text-amber-600 border-amber-600/20 bg-amber-600/5';
      case 'SHIPPED': return 'text-blue-600 border-blue-600/20 bg-blue-600/5';
      case 'DELIVERED': return 'text-success border-success/20 bg-success/5';
      default: return 'text-muted border-border bg-white';
    }
  }

  if (orders.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-24 flex flex-col items-center justify-center flex-grow text-center mt-12 mb-12 border border-dashed border-border rounded-lg bg-muted/5">
        <h1 className="text-xl font-medium mb-2">You haven't placed any orders yet.</h1>
        <p className="text-muted mb-6 text-[15px]">When you do, their details and status will appear here.</p>
        <Link href="/browse">
          <Button>Start shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 md:px-8 py-12 flex flex-col flex-grow">
      <h1 className="text-3xl font-medium tracking-tight mb-12">Order History</h1>

      <div className="flex flex-col gap-6">
        {orders.map(order => {
          const isExpanded = expandedOrderId === order.id;
          const items = order.items || [];
          
          // Generate thumbnails summary
          const maxThumbs = 4;
          const displayItems = items.slice(0, maxThumbs);
          const extraCount = items.length - maxThumbs;
          
          let parsedAddress: any = {};
          try { parsedAddress = JSON.parse(order.deliveryAddress); } catch(e) {}

          return (
            <Card key={order.id} className="overflow-hidden border border-border shadow-sm">
              {/* Order Summary (Always visible) */}
              <div className="p-6 md:p-8 flex flex-col gap-6">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                     <p className="text-[13px] text-muted mb-1 uppercase tracking-wider">Order Number</p>
                     <p className="font-medium text-[15px]">{order.orderNumber}</p>
                  </div>
                  <div>
                     <p className="text-[13px] text-muted mb-1 uppercase tracking-wider text-right md:text-left">Date</p>
                     <p className="font-medium text-[15px]">
                       {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                     </p>
                  </div>
                  <div>
                     <p className="text-[13px] text-muted mb-1 uppercase tracking-wider text-right md:text-left">Total</p>
                     <p className="font-medium text-[15px]">£{Number(order.totalValue).toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col items-start md:items-end w-full md:w-auto mt-2 md:mt-0">
                     <span className={cn("px-3 py-1 rounded-full text-[12px] font-medium border uppercase tracking-wider", getStatusColor(order.status))}>
                       {order.status}
                     </span>
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-border pt-6">
                  <div className="flex gap-2">
                    {displayItems.map((item: any, i: number) => (
                       <div key={i} className="w-14 h-16 bg-muted/5 border border-border relative overflow-hidden">
                         <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                       </div>
                    ))}
                    {extraCount > 0 && (
                       <div className="w-14 h-16 bg-muted/10 border border-border flex items-center justify-center text-[12px] font-medium text-muted">
                         +{extraCount}
                       </div>
                    )}
                  </div>
                  <button 
                    onClick={() => toggleExpand(order.id)}
                    className="text-[14px] text-primary hover:underline font-medium"
                  >
                    {isExpanded ? "Hide details" : "Order details"}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="bg-[#F9F8F6] p-6 md:p-8 border-t border-border animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    
                    {/* Item List */}
                    <div className="flex flex-col gap-6">
                      <h3 className="font-medium text-[15px] border-b border-border pb-2">Items</h3>
                      <div className="flex flex-col gap-4">
                        {items.map((item: any) => (
                           <div key={item.id} className="flex gap-4">
                             <div className="w-16 h-20 shrink-0 bg-white border border-border">
                               <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                             </div>
                             <div className="flex flex-col min-w-0">
                               <p className="text-[14px] font-medium mb-1 truncate">{item.productName}</p>
                               <p className="text-[13px] text-muted mb-1">Size: {item.size}</p>
                               <div className="flex justify-between items-center mt-auto text-[14px]">
                                 <span className="text-muted">Qty: {item.quantity}</span>
                                 <span className="font-medium">£{Number(item.price).toFixed(2)}</span>
                               </div>
                             </div>
                           </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Details & Address */}
                    <div className="flex flex-col gap-8">
                      <div>
                        <h3 className="font-medium text-[15px] border-b border-border pb-2 mb-4">Payment Summary</h3>
                        <div className="flex justify-between text-[14px] mb-2 text-muted">
                          <span>Subtotal</span>
                          <span>£{Number(order.subtotal).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[14px] mb-4 text-muted">
                          <span>Delivery</span>
                          <span>{Number(order.deliveryCost) === 0 ? "Free" : `£${Number(order.deliveryCost).toFixed(2)}`}</span>
                        </div>
                        <div className="flex justify-between text-[15px] font-medium">
                          <span>Total</span>
                          <span>£{Number(order.totalValue).toFixed(2)}</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-[15px] border-b border-border pb-2 mb-4">Delivery Address</h3>
                        <div className="text-[14px] text-muted leading-relaxed">
                          <p>{parsedAddress.fullName}</p>
                          <p>{parsedAddress.addressLine1}</p>
                          {parsedAddress.addressLine2 && <p>{parsedAddress.addressLine2}</p>}
                          <p>{parsedAddress.city}</p>
                          <p>{parsedAddress.postcode}</p>
                          <p>{parsedAddress.country}</p>
                        </div>
                      </div>

                      {order.status === 'SHIPPED' && order.trackingNumber && (
                        <div>
                           <h3 className="font-medium text-[15px] border-b border-border pb-2 mb-4">Tracking</h3>
                           <p className="text-[14px] text-muted">Tracking Ref: <span className="font-medium text-foreground">{order.trackingNumber}</span></p>
                        </div>
                      )}

                      <div className="pt-4 mt-auto">
                        <Link href="mailto:support@wearwise.test" className="text-[14px] text-primary hover:underline">
                          Need help with this order?
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
