import { notFound } from "next/navigation"
import Link from "next/link"
import { getOrder } from "@/actions/orders"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDateTimeDhaka } from "@/lib/utils"
import { CheckCircle } from "lucide-react"
import Image from "next/image"
import { InvoiceButton } from "@/components/ui/invoice-button"
import { Currency } from "@/components/providers/currency-provider"
import { parseVariationDetails } from "@/lib/variant-utils"
import { Ga4Purchase } from "@/components/analytics/ga4-purchase"

export default async function OrderDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ new?: string }>
}) {
    const { id } = await params
    const { new: isNew } = await searchParams
    const order = await getOrder(id)
    type OrderType = NonNullable<Awaited<ReturnType<typeof getOrder>>>
    type OrderItem = OrderType["items"][number]
    type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning"

    if (!order) {
        notFound()
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

    const ga4Items = order.items.map((item: OrderItem) => {
        const variations = item.variationDetails ? parseVariationDetails(item.variationDetails) : []
        const variantLabel = variations.length > 0
            ? variations.map((v) => `${v.type}: ${v.value}`).join(" / ")
            : undefined

        return {
            item_id: item.productId,
            item_name: item.name,
            price: Number(item.price),
            quantity: item.quantity,
            item_variant: variantLabel,
            item_brand: item.product?.brand || undefined,
        }
    })

    return (
        <div className="container mx-auto px-4 py-6 md:py-8">
            <Ga4Purchase
                isNew={isNew === "true"}
                transactionId={order.orderNumber}
                value={Number(order.total)}
                tax={Number(order.tax ?? 0)}
                shipping={Number(order.shippingCost)}
                coupon={order.couponCode}
                items={ga4Items}
            />
            {isNew === "true" && (
                <Card className="mb-6 md:mb-8 border-green-500 bg-green-50">
                    <CardContent className="p-4 md:p-6">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-600 shrink-0" />
                            <div>
                                <h2 className="text-lg md:text-xl font-bold text-green-900">
                                    Order Placed Successfully!
                                </h2>
                                <p className="text-sm md:text-base text-green-700">
                                    Thank you for your order. We&apos;ll send you a confirmation email shortly.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">Order Details</h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Order #{order.orderNumber}
                    </p>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                    <InvoiceButton
                        order={{
                            orderNumber: order.orderNumber,
                            createdAt: order.createdAt.toISOString(),
                            customerName: order.customerName || "",
                            customerEmail: order.customerEmail || "",
                            customerPhone: order.customerPhone,
                            shippingAddress: order.shippingAddress,
                            items: order.items.map((item) => ({
                                name: item.name,
                                quantity: item.quantity,
                                price: item.price.toString(),
                                sku: item.sku,
                                variationDetails: item.variationDetails,
                                image: item.image,
                            })),
                            subtotal: order.subtotal.toString(),
                            shippingCost: order.shippingCost.toString(),
                            tax: order.tax.toString(),
                            discount: order.discount.toString(),
                            total: order.total.toString(),
                            paymentMethod: order.paymentMethod,
                            paymentStatus: order.paymentStatus,
                            couponCode: order.couponCode,
                        }}
                    />
                    <Badge variant={getStatusColor(order.status)} className="text-xs md:text-sm px-2 md:px-3 py-1">
                        {order.status}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    {/* Order Items */}
                    <Card>
                        <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                            <CardTitle className="text-lg md:text-xl">Order Items</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-4">
                            {order.items.map((item: OrderItem) => (
                                <div key={item.id} className="flex gap-3 md:gap-4 pb-4 border-b last:border-0 last:pb-0">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 overflow-hidden shrink-0">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                width={80}
                                                height={80}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/products/${item.product.slug}`}
                                            className="font-semibold text-sm md:text-base hover:text-blue-600 line-clamp-2"
                                        >
                                            {item.name}
                                        </Link>
                                        {item.sku && (
                                            <p className="text-xs md:text-sm text-muted-foreground">SKU: {item.sku}</p>
                                        )}
                                        {item.variationDetails && (() => {
                                            const variations = parseVariationDetails(item.variationDetails)
                                            return variations.length > 0 ? (
                                                <p className="text-xs md:text-sm text-blue-600 font-medium mt-1">
                                                    {variations.map(v => `${v.type}: ${v.value}`).join(" • ")}
                                                </p>
                                            ) : null
                                        })()}
                                        <p className="text-xs md:text-sm text-muted-foreground mt-1">
                                            Qty: {item.quantity}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <Currency value={item.price.toString()} className="font-semibold text-sm md:text-base" />
                                        <Currency
                                            value={parseFloat(item.price.toString()) * item.quantity}
                                            className="text-xs md:text-sm text-muted-foreground block"
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    <Card>
                        <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                            <CardTitle className="text-lg md:text-xl">Shipping Address</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                            <pre className="whitespace-pre-line text-xs md:text-sm">
                                {order.shippingAddress}
                            </pre>
                        </CardContent>
                    </Card>

                    {/* Order Timeline */}
                    <Card>
                        <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                            <CardTitle className="text-lg md:text-xl">Order Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                                    <div>
                                        <p className="font-semibold text-sm md:text-base">Order Placed</p>
                                        <p className="text-xs md:text-sm text-muted-foreground">
                                            {formatDateTimeDhaka(order.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                {order.status !== "PENDING" && (
                                    <div className="flex gap-3">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                                        <div>
                                            <p className="font-semibold text-sm md:text-base">Status Updated</p>
                                            <p className="text-xs md:text-sm text-muted-foreground">
                                                {formatDateTimeDhaka(order.updatedAt)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-4 md:space-y-6">
                    {/* Order Summary */}
                    <Card>
                        <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                            <CardTitle className="text-lg md:text-xl">Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-3 text-sm md:text-base">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <Currency value={order.subtotal.toString()} className="font-semibold" />
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="font-semibold">
                                    {parseFloat(order.shippingCost.toString()) === 0
                                        ? "FREE"
                                        : <Currency value={order.shippingCost.toString()} />}
                                </span>
                            </div>
                            {order.couponCode && parseFloat(order.discount.toString()) > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Coupon ({order.couponCode})</span>
                                    <span className="font-semibold">-<Currency value={order.discount.toString()} /></span>
                                </div>
                            )}
                            {order.pointsUsed > 0 && (
                                <div className="flex justify-between text-blue-600">
                                    <span>Loyalty Points ({order.pointsUsed})</span>
                                    <span className="font-semibold">-<Currency value={(order.pointsUsed / 10).toFixed(2)} /></span>
                                </div>
                            )}
                            {!order.couponCode && parseFloat(order.discount.toString()) > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span className="font-semibold">-<Currency value={order.discount.toString()} /></span>
                                </div>
                            )}
                            <div className="pt-3 border-t">
                                <div className="flex justify-between items-center">
                                    <span className="text-base md:text-lg font-semibold">Total</span>
                                    <Currency value={order.total.toString()} className="text-xl md:text-2xl font-bold" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Tracking */}
                    {order.trackingNumber && (
                        <Card className="border-blue-500 bg-blue-50">
                            <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                                <CardTitle className="text-base md:text-lg text-blue-900">📦 Shipment Tracking</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs md:text-sm text-blue-700">Tracking Number</span>
                                    <span className="font-mono font-bold text-sm md:text-base text-blue-900">{order.trackingNumber}</span>
                                </div>
                                <p className="text-xs text-blue-600">
                                    Use this number to track your shipment with the courier service.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment Information */}
                    <Card>
                        <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                            <CardTitle className="text-lg md:text-xl">Payment Information</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-3">
                            <div>
                                <p className="text-xs md:text-sm text-muted-foreground">Payment Method</p>
                                <p className="font-semibold text-sm md:text-base">{order.paymentMethod}</p>
                            </div>
                            <div>
                                <p className="text-xs md:text-sm text-muted-foreground">Payment Status</p>
                                <Badge variant={order.paymentStatus === "PAID" ? "success" : "warning"}>
                                    {order.paymentStatus}
                                </Badge>
                            </div>
                            {order.transactionId && (
                                <div>
                                    <p className="text-xs md:text-sm text-muted-foreground">Transaction ID</p>
                                    <p className="font-mono text-xs md:text-sm">{order.transactionId}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {order.pointsEarned > 0 && (
                        <Card className="border-green-500 bg-green-50">
                            <CardContent className="p-4">
                                <p className="text-xs md:text-sm text-green-900 font-semibold">
                                    🎉 You earned {order.pointsEarned} loyalty points!
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    <Button asChild className="w-full">
                        <Link href="/orders">View All Orders</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
