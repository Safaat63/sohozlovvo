import Link from "next/link"
import { getDashboardStats, getSalesData } from "@/actions/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Users, Package, DollarSign, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { formatDateDhaka } from "@/lib/utils"
import { SalesChart } from "@/components/admin/sales-chart"

export default async function AdminDashboardPage() {
    const [stats, rawSalesData] = await Promise.all([
        getDashboardStats(),
        getSalesData(30),
    ])

    const salesData = rawSalesData.map((entry) => ({
        ...entry,
        total: Number(entry.total),
        orders: Number(entry.orders),
    }))

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-bold dark:text-white">Dashboard</h1>
                <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none">
                        <Link href="/admin/orders">Manage Orders</Link>
                    </Button>
                    <Button asChild size="sm" className="flex-1 sm:flex-none">
                        <Link href="/admin/products/new">Add Product</Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs md:text-sm font-medium dark:text-white">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg md:text-2xl font-bold">৳{Number(stats.totalRevenue).toFixed(0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.revenueGrowth >= 0 ? (
                                <span className="text-green-600 flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    +{Number(stats.revenueGrowth).toFixed(1)}%
                                </span>
                            ) : (
                                <span className="text-red-600 flex items-center gap-1">
                                    <TrendingDown className="h-3 w-3" />
                                    {Number(stats.revenueGrowth).toFixed(1)}%
                                </span>
                            )}
                        </p>
                    </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs md:text-sm font-medium dark:text-white">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg md:text-2xl font-bold">{stats.totalOrders}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.monthOrders} this month
                        </p>
                    </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs md:text-sm font-medium dark:text-white">Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg md:text-2xl font-bold">{stats.totalCustomers}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Registered users
                        </p>
                    </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs md:text-sm font-medium dark:text-white">Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg md:text-2xl font-bold">{stats.totalProducts}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Active products
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                    <CardTitle className="text-base md:text-lg dark:text-white">Revenue & Orders (Last 30 days)</CardTitle>
                </CardHeader>
                <CardContent>
                    <SalesChart data={salesData} />
                </CardContent>
            </Card>

            <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2">
                {/* Low Stock Products */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base md:text-lg dark:text-white">
                            <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                            Low Stock Alert
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.lowStockProducts.length === 0 ? (
                            <p className="text-muted-foreground text-sm">All products are well stocked</p>
                        ) : (
                            <div className="space-y-3 md:space-y-4">
                                {stats.lowStockProducts.map((product) => (
                                    <div key={product.id} className="flex items-center justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <Link href={`/admin/products/${product.id}`} className="font-medium hover:text-blue-600 text-sm md:text-base line-clamp-1">
                                                {product.name}
                                            </Link>
                                            <p className="text-xs md:text-sm text-muted-foreground">SKU: {product.sku || "N/A"}</p>
                                        </div>
                                        <Badge variant={product.stock === 0 ? "destructive" : "warning"} className="shrink-0">
                                            {product.stock} left
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base md:text-lg dark:text-white">Recent Orders</CardTitle>
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/admin/orders">View All</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 md:space-y-4">
                            {stats.recentOrders.map((order) => (
                                <div key={order.id} className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/admin/orders/${order.id}`} className="font-medium hover:text-blue-600 text-sm md:text-base">
                                            #{order.orderNumber}
                                        </Link>
                                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                                            {order.customerName || order.user?.name || "Guest"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDateDhaka(order.createdAt, "PP")}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-semibold text-sm md:text-base">৳{order.total.toString()}</p>
                                        <Badge variant="outline" className="mt-1 text-xs">
                                            {order.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
