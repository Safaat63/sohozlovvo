import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart3,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Star,
} from "lucide-react"
import { SalesChart } from "@/components/admin/sales-chart"
import Image from "next/image"

export default async function AnalyticsPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  // Get date range for last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    totalRevenue,
    totalOrders,
    totalProducts,
    totalCustomers,
    recentOrders,
    topProducts,
    lowStockProducts,
    recentReviews,
  ] = await Promise.all([
    // Total Revenue
    prisma.order.aggregate({
      where: {
        status: { in: ["DELIVERED", "SHIPPED"] },
      },
      _sum: { total: true },
    }),
    // Total Orders
    prisma.order.count(),
    // Total Products
    prisma.product.count({ where: { isActive: true } }),
    // Total Customers
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    // Recent Orders (last 30 days)
    prisma.order.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true,
      },
    }),
    // Top Selling Products
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    // Low Stock Products
    prisma.product.findMany({
      where: {
        isActive: true,
        stock: { lte: 10, gt: 0 },
      },
      orderBy: { stock: "asc" },
      take: 5,
      select: {
        id: true,
        name: true,
        stock: true,
        lowStockAlert: true,
      },
    }),
    // Recent Reviews
    prisma.review.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        product: { select: { name: true } },
        user: { select: { name: true } },
      },
    }),
  ])

  // Get product details for top sellers
  const topProductIds = topProducts.map((p) => p.productId)
  const topProductDetails = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, images: true, price: true },
  })

  const topProductsWithDetails = topProducts.map((item) => {
    const product = topProductDetails.find((p) => p.id === item.productId)
    return {
      ...item,
      product,
    }
  })

  const revenue = totalRevenue._sum.total || 0
  const avgOrderValue = totalOrders > 0 ? Number(revenue) / totalOrders : 0

  const salesByDate = recentOrders.reduce<Record<string, { total: number; orders: number }>>(
    (acc, order) => {
      const day = new Date(order.createdAt).toISOString().split("T")[0]
      const total = Number(order.total)
      if (!acc[day]) {
        acc[day] = { total: 0, orders: 0 }
      }
      acc[day].total += total
      acc[day].orders += 1
      return acc
    },
    {}
  )

  const salesData = Object.entries(salesByDate)
    .map(([date, values]) => ({ date, ...values }))
    .sort((a, b) => (a.date > b.date ? 1 : -1))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">Analytics Dashboard</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{Number(revenue).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From {totalOrders} orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{avgOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per order</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Active listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesChart data={salesData} />
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProductsWithDetails.map((item) => (
                <div key={item.productId} className="flex items-center gap-4">
                  {item.product?.images[0] && (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.product?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item._sum.quantity} sold
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">৳{item.product ? Number(item.product.price).toFixed(0) : 0}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No low stock products</p>
              ) : (
                lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Alert threshold: {product.lowStockAlert}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-orange-500">
                        {product.stock}
                      </span>
                      <span className="text-sm text-muted-foreground"> left</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Recent Orders (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">#{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">৳{Number(order.total).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Recent Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent reviews</p>
              ) : (
                recentReviews.map((review) => (
                  <div key={review.id} className="py-2 border-b last:border-0">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-sm">{review.user.name}</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {review.product.name}
                    </p>
                    {review.comment && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
