import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail
} from "lucide-react"
import Image from "next/image"

const statusIcons = {
  PENDING: Clock,
  VERIFIED: CheckCircle2,
  PROCESSING: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle2,
  CANCELLED: XCircle,
  RETURNED: XCircle,
}

const statusColors = {
  PENDING: "bg-yellow-500",
  VERIFIED: "bg-blue-500",
  PROCESSING: "bg-purple-500",
  SHIPPED: "bg-indigo-500",
  DELIVERED: "bg-green-500",
  CANCELLED: "bg-red-500",
  RETURNED: "bg-orange-500",
}

export default async function OrderTrackingPage({ params }: { params: { id: string } }) {
  const session = await auth()

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      address: true,
    },
  })

  if (!order) {
    notFound()
  }

  // Check if user owns this order
  if (!session?.user || (order.userId !== session.user.id && session.user.role !== "ADMIN")) {
    notFound()
  }

  const statusSteps = [
    { status: "PENDING", label: "Order Placed", timestamp: order.createdAt },
    { status: "VERIFIED", label: "Payment Verified" },
    { status: "PROCESSING", label: "Processing" },
    { status: "SHIPPED", label: "Shipped", trackingNumber: order.trackingNumber },
    { status: "DELIVERED", label: "Delivered" },
  ]

  const currentStatusIndex = statusSteps.findIndex(step => step.status === order.status)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 dark:text-white">Track Your Order</h1>
        <p className="text-muted-foreground mb-8">Order #{order.orderNumber}</p>

        {/* Status Timeline */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700" />
              <div
                className={`absolute left-4 top-8 w-0.5 ${statusColors[order.status as keyof typeof statusColors]} transition-all duration-500`}
                style={{
                  height: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`
                }}
              />

              {/* Status Steps */}
              <div className="space-y-8">
                {statusSteps.map((step, index) => {
                  const Icon = statusIcons[step.status as keyof typeof statusIcons]
                  const isPast = index <= currentStatusIndex
                  const isCurrent = index === currentStatusIndex

                  return (
                    <div key={step.status} className="relative flex items-start gap-4">
                      <div
                        className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${isPast
                          ? `${statusColors[step.status as keyof typeof statusColors]} border-transparent`
                          : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700'
                          }`}
                      >
                        <Icon className={`h-4 w-4 ${isPast ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className={`font-medium ${isPast ? 'dark:text-white' : 'text-muted-foreground'}`}>
                          {step.label}
                        </p>
                        {step.timestamp && isPast && (
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(step.timestamp), "PPp")}
                          </p>
                        )}
                        {step.trackingNumber && isPast && (
                          <p className="text-sm text-muted-foreground">
                            Tracking: {step.trackingNumber}
                          </p>
                        )}
                        {isCurrent && (
                          <Badge className="mt-1">Current Status</Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2 dark:text-white">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </h3>
              {order.shippingAddress ? (
                <div className="text-sm text-muted-foreground whitespace-pre-line">
                  {order.shippingAddress}
                </div>
              ) : order.address ? (
                <div className="text-sm text-muted-foreground">
                  <p>{order.address.name}</p>
                  <p>{order.address.street}</p>
                  <p>{order.address.city}, {order.address.state} {order.address.postalCode}</p>
                  <p>{order.address.country}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No address provided</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2 dark:text-white">
                <Phone className="h-5 w-5" />
                Contact Information
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                {order.customerName && <p>Name: {order.customerName}</p>}
                {order.customerEmail && (
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {order.customerEmail}
                  </p>
                )}
                {order.customerPhone && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {order.customerPhone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 dark:text-white">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0 dark:border-gray-800">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium dark:text-white">{item.name}</h4>
                    {item.variationDetails && (
                      <p className="text-sm text-muted-foreground">
                        {item.variationDetails}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium dark:text-white">৳{parseFloat(item.price.toString()).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t dark:border-gray-800 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="dark:text-white">৳{parseFloat(order.subtotal.toString()).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="dark:text-white">৳{parseFloat(order.shippingCost.toString()).toFixed(2)}</span>
              </div>
              {parseFloat(order.discount.toString()) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-green-600 dark:text-green-400">
                    -৳{parseFloat(order.discount.toString()).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg pt-2 border-t dark:border-gray-800">
                <span className="dark:text-white">Total</span>
                <span className="dark:text-white">৳{parseFloat(order.total.toString()).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
