import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { getOrders } from "@/actions/orders"
import { Button } from "@/components/ui/button"
import { formatDateDhaka } from "@/lib/utils"
import Image from "next/image"
import { Currency } from "@/components/providers/currency-provider"
import { ChevronRight, Package, ShoppingBag, ArrowRight } from "lucide-react"

export default async function OrdersPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/auth/login?callbackUrl=/orders")
    }

    const orders = await getOrders()
    type OrdersResult = Awaited<ReturnType<typeof getOrders>>
    type OrderItem = OrdersResult[number]["items"][number]
    type OrderType = OrdersResult[number]

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            case "VERIFIED":
            case "CONFIRMED":
            case "PROCESSING":
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            case "SHIPPED":
                return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
            case "DELIVERED":
                return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            case "CANCELLED":
            case "RETURNED":
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
        }
    }

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Breadcrumb */}
            <div className="bg-card border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                            Home
                        </Link>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <Link href="/account" className="text-muted-foreground hover:text-primary transition-colors">
                            Account
                        </Link>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground font-medium">My Orders</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Orders</h1>
                        <p className="text-muted-foreground mt-1">
                            {orders.length} {orders.length === 1 ? "order" : "orders"} placed
                        </p>
                    </div>
                    <Link href="/products">
                        <Button variant="outline" className="rounded-xl">
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Continue Shopping
                        </Button>
                    </Link>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-border shadow-soft">
                        <div className="flex flex-col items-center justify-center py-16 md:py-24">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                                <Package className="h-10 w-10 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground mb-2">No orders yet</h2>
                            <p className="text-muted-foreground mb-6 text-center max-w-md">
                                When you place your first order, it will appear here
                            </p>
                            <Link href="/products">
                                <Button className="rounded-xl h-12 px-8">
                                    Start Shopping
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order: OrderType) => (
                            <div
                                key={order.id}
                                className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden hover:shadow-hover transition-all"
                            >
                                {/* Order Header */}
                                <div className="p-4 md:p-6 border-b border-border bg-muted/30">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <Package className="h-5 w-5 text-muted-foreground" />
                                                <span className="font-bold text-foreground">
                                                    Order #{order.orderNumber}
                                                </span>
                                            </div>
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Placed on {formatDateDhaka(order.createdAt, "MMM d, yyyy")}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-4 md:p-6">
                                    <div className="space-y-4">
                                        {order.items.slice(0, 3).map((item: OrderItem) => (
                                            <div key={item.id} className="flex gap-4">
                                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-muted overflow-hidden shrink-0">
                                                    {item.image ? (
                                                        <Image
                                                            src={item.image}
                                                            alt={item.name}
                                                            width={80}
                                                            height={80}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-foreground line-clamp-1">
                                                        {item.name}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Qty: {item.quantity}
                                                    </p>
                                                    <Currency
                                                        value={item.price.toString()}
                                                        className="text-sm font-semibold text-foreground mt-1"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {order.items.length > 3 && (
                                            <p className="text-sm text-muted-foreground pl-20 md:pl-24">
                                                +{order.items.length - 3} more {order.items.length - 3 === 1 ? "item" : "items"}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Order Footer */}
                                <div className="p-4 md:p-6 border-t border-border bg-muted/30">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Order Total</p>
                                            <Currency
                                                value={order.total.toString()}
                                                className="text-xl md:text-2xl font-bold text-foreground"
                                            />
                                        </div>
                                        <Link href={`/orders/${order.id}`}>
                                            <Button className="rounded-xl w-full sm:w-auto">
                                                View Details
                                                <ArrowRight className="h-4 w-4 ml-2" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
