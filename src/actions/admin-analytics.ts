"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns"

export async function getAnalyticsData(period: "today" | "week" | "month" | "year" = "month") {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    const now = new Date()
    let startDate: Date
    let endDate: Date = now

    switch (period) {
        case "today":
            startDate = startOfDay(now)
            endDate = endOfDay(now)
            break
        case "week":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
        case "month":
            startDate = startOfMonth(now)
            endDate = endOfMonth(now)
            break
        case "year":
            startDate = new Date(now.getFullYear(), 0, 1)
            break
        default:
            startDate = startOfMonth(now)
    }

    const [
        totalRevenue,
        ordersCount,
        customersCount,
        productsCount,
        recentOrders,
        topProducts,
        categoryStats,
    ] = await Promise.all([
        // Total Revenue
        prisma.order.aggregate({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                status: { notIn: ["CANCELLED", "RETURNED"] },
            },
            _sum: { total: true },
        }),

        // Orders Count
        prisma.order.count({
            where: {
                createdAt: { gte: startDate, lte: endDate },
            },
        }),

        // New Customers
        prisma.user.count({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                role: "CUSTOMER",
            },
        }),

        // Total Products
        prisma.product.count({
            where: { isActive: true },
        }),

        // Recent Orders
        prisma.order.findMany({
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: { name: true, email: true },
                },
            },
        }),

        // Top Products
        prisma.orderItem.groupBy({
            by: ["productId"],
            where: {
                order: {
                    createdAt: { gte: startDate, lte: endDate },
                    status: { notIn: ["CANCELLED", "RETURNED"] },
                },
            },
            _sum: { quantity: true },
            _count: true,
            orderBy: {
                _sum: { quantity: "desc" },
            },
            take: 5,
        }),

        // Category Stats
        prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true },
                },
            },
            take: 10,
        }),
    ])

    // Get product details for top products
    const topProductIds = topProducts.map((p) => p.productId)
    const topProductDetails = await prisma.product.findMany({
        where: { id: { in: topProductIds } },
        select: { id: true, name: true, images: true, price: true },
    })

    const topProductsWithDetails = topProducts.map((p) => {
        const product = topProductDetails.find((pd) => pd.id === p.productId)
        return {
            ...product,
            totalSold: p._sum.quantity || 0,
            orderCount: p._count,
        }
    })

    // Revenue by day for chart (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const dailyRevenue = await prisma.order.groupBy({
        by: ["createdAt"],
        where: {
            createdAt: { gte: thirtyDaysAgo },
            status: { notIn: ["CANCELLED", "RETURNED"] },
        },
        _sum: { total: true },
    })

    return {
        revenue: parseFloat(totalRevenue._sum.total?.toString() || "0"),
        ordersCount,
        customersCount,
        productsCount,
        recentOrders: recentOrders.map((order) => ({
            ...order,
            total: parseFloat(order.total.toString()),
            subtotal: parseFloat(order.subtotal.toString()),
            shippingCost: parseFloat(order.shippingCost.toString()),
            discount: parseFloat(order.discount.toString()),
            tax: parseFloat(order.tax.toString()),
        })),
        topProducts: topProductsWithDetails.map((p) => ({
            ...p,
            price: p?.price ? parseFloat(p.price.toString()) : 0,
        })),
        categoryStats,
        dailyRevenue: dailyRevenue.map((d) => ({
            date: d.createdAt.toISOString().split("T")[0],
            revenue: parseFloat(d._sum.total?.toString() || "0"),
        })),
    }
}

export async function getLowStockProducts() {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    const products = await prisma.product.findMany({
        where: {
            isActive: true,
            stock: {
                lte: prisma.product.fields.lowStockAlert,
            },
        },
        orderBy: { stock: "asc" },
        take: 10,
    })

    return products.map((p) => ({
        ...p,
        price: parseFloat(p.price.toString()),
        compareAtPrice: p.compareAtPrice ? parseFloat(p.compareAtPrice.toString()) : null,
        costPrice: p.costPrice ? parseFloat(p.costPrice.toString()) : null,
        weight: p.weight ? parseFloat(p.weight.toString()) : null,
        rating: parseFloat(p.rating.toString()),
    }))
}

// View analytics
export async function getViewAnalyticsDashboard(days: number = 30) {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [pageViews, productViews, topProducts, topPages] = await Promise.all([
        prisma.pageView.count({
            where: { createdAt: { gte: startDate } },
        }),
        prisma.productView.count({
            where: { createdAt: { gte: startDate } },
        }),
        // Top products by views
        prisma.productView.groupBy({
            by: ["productId"],
            where: { createdAt: { gte: startDate } },
            _count: { id: true },
            orderBy: { _count: { id: "desc" } },
            take: 10,
        }),
        // Top pages by views
        prisma.pageView.groupBy({
            by: ["path"],
            where: { createdAt: { gte: startDate } },
            _count: { id: true },
            orderBy: { _count: { id: "desc" } },
            take: 10,
        }),
    ])

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
        topProducts.map(async (item) => {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
                select: { id: true, name: true, slug: true, images: true },
            })
            return {
                ...product,
                viewCount: item._count.id,
            }
        })
    )

    // Get daily view stats
    const allPageViews = await prisma.pageView.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
    })

    const allProductViews = await prisma.productView.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
    })

    const dailyStats: Record<string, { pageViews: number; productViews: number }> = {}

    allPageViews.forEach((view) => {
        const date = view.createdAt.toISOString().split("T")[0]
        if (!dailyStats[date]) dailyStats[date] = { pageViews: 0, productViews: 0 }
        dailyStats[date].pageViews++
    })

    allProductViews.forEach((view) => {
        const date = view.createdAt.toISOString().split("T")[0]
        if (!dailyStats[date]) dailyStats[date] = { pageViews: 0, productViews: 0 }
        dailyStats[date].productViews++
    })

    const dailyViewsArray = Object.entries(dailyStats)
        .map(([date, stats]) => ({
            date,
            pageViews: stats.pageViews,
            productViews: stats.productViews,
            totalViews: stats.pageViews + stats.productViews,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

    return {
        totalPageViews: pageViews,
        totalProductViews: productViews,
        topProducts: topProductsWithDetails,
        topPages: topPages.map((item) => ({
            path: item.path,
            views: item._count.id,
        })),
        dailyViews: dailyViewsArray,
    }
}

export async function getProductViewAnalytics(productId: string, days: number = 30) {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const views = await prisma.productView.findMany({
        where: {
            productId,
            createdAt: { gte: startDate },
        },
        select: {
            createdAt: true,
            country: true,
            referrer: true,
            affiliateId: true,
        },
    })

    // Group by date
    const dailyViews: Record<string, number> = {}
    const viewsByCountry: Record<string, number> = {}
    const viewsByReferrer: Record<string, number> = {}
    let affiliateViews = 0

    views.forEach((view) => {
        const date = view.createdAt.toISOString().split("T")[0]
        dailyViews[date] = (dailyViews[date] || 0) + 1

        if (view.country) {
            viewsByCountry[view.country] = (viewsByCountry[view.country] || 0) + 1
        }

        if (view.referrer) {
            try {
                const referrerDomain = new URL(view.referrer).hostname
                viewsByReferrer[referrerDomain] = (viewsByReferrer[referrerDomain] || 0) + 1
            } catch {
                viewsByReferrer["Direct"] = (viewsByReferrer["Direct"] || 0) + 1
            }
        } else {
            viewsByReferrer["Direct"] = (viewsByReferrer["Direct"] || 0) + 1
        }

        if (view.affiliateId) {
            affiliateViews++
        }
    })

    return {
        totalViews: views.length,
        affiliateViews,
        dailyViews: Object.entries(dailyViews)
            .map(([date, count]) => ({ date, views: count }))
            .sort((a, b) => a.date.localeCompare(b.date)),
        viewsByCountry: Object.entries(viewsByCountry)
            .map(([country, count]) => ({ country, views: count }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 10),
        viewsByReferrer: Object.entries(viewsByReferrer)
            .map(([referrer, count]) => ({ referrer, views: count }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 10),
    }
}
