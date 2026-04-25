import { notFound } from "next/navigation"
import Link from "next/link"
import { getOrderForSteadfast } from "@/actions/admin-steadfast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDateTimeDhaka } from "@/lib/utils"
import { ArrowLeft, Package, User, MapPin, Phone, Mail, CreditCard } from "lucide-react"
import Image from "next/image"
import { SteadfastOrderActions } from "./steadfast-order-actions"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning"

function getStatusColor(status: string): BadgeVariant {
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

function getPaymentStatusColor(status: string): BadgeVariant {
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

export default async function SteadfastOrderDetailPage({
    params,
}: {
    params: Promise<{ orderId: string }>
}) {
    const { orderId } = await params
    const order = await getOrderForSteadfast(orderId)

    if (!order) {
        notFound()
    }

    const codAmount = order.paymentMethod === "COD" ? parseFloat(order.total.toString()) : 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/steadfast">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold dark:text-white">
                            Order {order.orderNumber}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {formatDateTimeDhaka(order.createdAt)}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
                    <Badge variant={getPaymentStatusColor(order.paymentStatus)}>
                        {order.paymentStatus}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Steadfast Actions */}
                    <SteadfastOrderActions
                        orderId={order.id}
                        orderNumber={order.orderNumber}
                        trackingNumber={order.trackingNumber}
                        codAmount={codAmount}
                    />

                    {/* Order Items */}
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Order Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-4 p-3 border rounded-lg dark:border-gray-700"
                                    >
                                        <div className="relative w-16 h-16 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                                            {item.image ? (
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium truncate">{item.name}</h4>
                                            {item.sku && (
                                                <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                                            )}
                                            {item.variationDetails && (
                                                <p className="text-xs text-muted-foreground">
                                                    {JSON.parse(item.variationDetails)
                                                        .map((v: { type: string; value: string }) => `${v.type}: ${v.value}`)
                                                        .join(", ")}
                                                </p>
                                            )}
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-sm text-muted-foreground">
                                                    Qty: {item.quantity}
                                                </span>
                                                <span className="font-medium">
                                                    ৳{parseFloat(item.price.toString()).toFixed(0)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="mt-6 pt-4 border-t dark:border-gray-700 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>৳{parseFloat(order.subtotal.toString()).toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>৳{parseFloat(order.shippingCost.toString()).toFixed(0)}</span>
                                </div>
                                {order.discount && parseFloat(order.discount.toString()) > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Discount</span>
                                        <span>-৳{parseFloat(order.discount.toString()).toFixed(0)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg pt-2 border-t dark:border-gray-700">
                                    <span>Total</span>
                                    <span>৳{parseFloat(order.total.toString()).toFixed(0)}</span>
                                </div>
                                {order.paymentMethod === "COD" && (
                                    <div className="text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 p-2 rounded mt-2">
                                        Cash on Delivery: ৳{codAmount.toFixed(0)}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Customer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>{order.customerName || order.user?.name || "Guest"}</span>
                            </div>
                            {(order.customerEmail || order.user?.email) && (
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm break-all">
                                        {order.customerEmail || order.user?.email}
                                    </span>
                                </div>
                            )}
                            {order.customerPhone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{order.customerPhone}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Shipping Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap">
                                {order.shippingAddress || "No address provided"}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Payment Info */}
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Payment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Method</span>
                                <span className="font-medium">{order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <Badge variant={getPaymentStatusColor(order.paymentStatus)}>
                                    {order.paymentStatus}
                                </Badge>
                            </div>
                            {order.transactionId && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Transaction ID</span>
                                    <span className="text-sm font-mono">{order.transactionId}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    {order.notes && (
                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-lg">Order Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
