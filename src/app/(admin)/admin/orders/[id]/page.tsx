import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { checkAdminAccess } from "@/actions/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDateDhaka, formatDateTimeDhaka } from "@/lib/utils"
import Image from "next/image"
import { OrderStatusForm } from "./order-status-form"
import { InvoiceButton } from "@/components/invoice-button"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning"

async function getOrder(orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            user: true,
            items: {
                include: {
                    product: true,
                },
            },
            payment: true,
        },
    })

    if (!order) return null

    // Serialize Decimal fields to strings for Client Components
    return {
        ...order,
        subtotal: order.subtotal.toString(),
        shippingCost: order.shippingCost.toString(),
        tax: order.tax.toString(),
        discount: order.discount?.toString() || "0",
        total: order.total.toString(),
        items: order.items.map(item => ({
            ...item,
            price: item.price.toString(),
            product: item.product ? {
                ...item.product,
                price: item.product.price.toString(),
                compareAtPrice: item.product.compareAtPrice?.toString() || null,
                costPrice: item.product.costPrice?.toString() || null,
                weight: item.product.weight?.toString() || null,
                rating: item.product.rating.toString(),
                discountValue: item.product.discountValue?.toString() || null,
            } : null,
        })),
        payment: order.payment ? {
            ...order.payment,
            amount: order.payment.amount.toString(),
        } : null,
    }
}

export default async function AdminOrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    await checkAdminAccess()
    const { id } = await params
    const order = await getOrder(id)

    if (!order) {
        notFound()
    }

    const invoiceData = {
        orderNumber: order.orderNumber,
        createdAt: order.createdAt.toString(),
        customerName: order.customerName || order.user?.name || "Guest",
        customerEmail: order.customerEmail || order.user?.email || "",
        customerPhone: order.customerPhone,
        shippingAddress: order.shippingAddress || "",
        items: order.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            sku: item.sku,
        })),
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        tax: order.tax || "0",
        discount: order.discount || "0",
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        couponCode: order.couponCode,
    }

    const getStatusColor = (status: string): BadgeVariant => {
        switch (status) {
            case "PENDING":
                return "warning"
            case "VERIFIED":
            case "PROCESSING":
                return "default"
            case "SHIPPED":
                return "default"
            case "DELIVERED":
                return "success"
            case "CANCELLED":
            case "RETURNED":
                return "destructive"
            default:
                return "default"
        }
    }

    const getPaymentStatusColor = (status: string): BadgeVariant => {
        switch (status) {
            case "PAID":
                return "success"
            case "PENDING":
                return "warning"
            case "FAILED":
                return "destructive"
            default:
                return "default"
        }
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
            <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Order #{order.orderNumber}</h1>
                    <Badge variant={getStatusColor(order.status)} className="text-xs sm:text-sm px-3 py-1 w-fit">
                        {order.status}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <InvoiceButton order={invoiceData} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Order Info */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                        {/* Customer Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium mb-2 text-sm sm:text-base">Customer Information</h4>
                                <p className="text-sm">{order.customerName || order.user?.name || "Guest"}</p>
                                <p className="text-sm text-muted-foreground break-all">{order.customerEmail || order.user?.email}</p>
                                <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2 text-sm sm:text-base">Shipping Address</h4>
                                <p className="text-sm whitespace-pre-line">{order.shippingAddress}</p>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div>
                            <h4 className="font-medium mb-3 sm:mb-4 text-sm sm:text-base">Items</h4>
                            <div className="space-y-3">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 bg-muted rounded-lg">
                                        <div className="relative w-16 h-16 rounded overflow-hidden shrink-0">
                                            {item.image ? (
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs">
                                                    No image
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm sm:text-base">{item.name}</p>
                                            <p className="text-xs sm:text-sm text-muted-foreground">SKU: {item.sku}</p>
                                            <p className="text-xs sm:text-sm">Qty: {item.quantity} × ৳{item.price}</p>
                                        </div>
                                        <div className="text-left sm:text-right font-medium w-full sm:w-auto">
                                            ৳{(parseFloat(item.price) * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="border-t pt-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span>৳{order.subtotal}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Shipping</span>
                                    <span>৳{order.shippingCost}</span>
                                </div>
                                {order.couponCode && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Coupon ({order.couponCode})</span>
                                        <span>-৳{order.discount}</span>
                                    </div>
                                )}
                                {order.pointsUsed > 0 && (
                                    <div className="flex justify-between text-sm text-blue-600">
                                        <span>Loyalty Points ({order.pointsUsed})</span>
                                        <span>-৳{(order.pointsUsed / 10).toFixed(2)}</span>
                                    </div>
                                )}
                                {!order.couponCode && order.discount && parseFloat(order.discount) > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Discount</span>
                                        <span>-৳{order.discount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                    <span>Total</span>
                                    <span>৳{order.total}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Status & Actions */}
                <div className="space-y-4 sm:space-y-6">
                    {/* Payment Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Method</span>
                                <span className="font-medium">{order.paymentMethod.replace("_", " ")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Status</span>
                                <Badge variant={getPaymentStatusColor(order.paymentStatus)}>
                                    {order.paymentStatus}
                                </Badge>
                            </div>
                            {order.transactionId && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Transaction ID</span>
                                    <span className="font-mono text-sm">{order.transactionId}</span>
                                </div>
                            )}
                            {order.payment && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Paid At</span>
                                    <span className="text-sm">
                                        {order.payment.paidAt
                                            ? formatDateDhaka(order.payment.paidAt, "PP")
                                            : "Not paid yet"}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Order Tracking */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Tracking</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {order.trackingNumber ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Tracking Number</span>
                                        <span className="font-mono text-sm font-medium">{order.trackingNumber}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No tracking number added yet</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Update Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Update Order</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <OrderStatusForm
                                orderId={order.id}
                                currentStatus={order.status}
                                currentPaymentStatus={order.paymentStatus}
                                currentTrackingNumber={order.trackingNumber || ""}
                            />
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 mt-2 bg-green-500 rounded-full" />
                                    <div>
                                        <p className="text-sm font-medium">Order Created</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDateTimeDhaka(order.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                {order.updatedAt > order.createdAt && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full" />
                                        <div>
                                            <p className="text-sm font-medium">Last Updated</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDateTimeDhaka(order.updatedAt)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    {order.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm whitespace-pre-line">{order.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
