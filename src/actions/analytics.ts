"use server"

import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export async function trackPageView(path: string) {
    try {
        const headersList = await headers()
        const session = await auth()

        // Get visitor info from headers
        const userAgent = headersList.get("user-agent") || undefined
        const forwardedFor = headersList.get("x-forwarded-for")
        const ipAddress = forwardedFor?.split(",")[0].trim() || headersList.get("x-real-ip") || undefined
        const referrer = headersList.get("referer") || undefined

        // Get country/city from Cloudflare headers if available
        const country = headersList.get("cf-ipcountry") || undefined
        const city = headersList.get("cf-ipcity") || undefined

        await prisma.pageView.create({
            data: {
                path,
                userAgent,
                ipAddress,
                referrer,
                country,
                city,
                userId: session?.user?.id,
                sessionId: ipAddress ? `session_${ipAddress}_${new Date().getTime()}` : undefined,
            },
        })
    } catch (error) {
        console.error("Error tracking page view:", error)
        // Don't throw error - tracking failures shouldn't break the page
    }
}

export async function trackProductView(productId: string, slug: string, affiliateId?: string) {
    try {
        const headersList = await headers()
        const session = await auth()

        // Get visitor info from headers
        const userAgent = headersList.get("user-agent") || undefined
        const forwardedFor = headersList.get("x-forwarded-for")
        const ipAddress = forwardedFor?.split(",")[0].trim() || headersList.get("x-real-ip") || undefined
        const referrer = headersList.get("referer") || undefined

        // Get country/city from Cloudflare headers if available
        const country = headersList.get("cf-ipcountry") || undefined
        const city = headersList.get("cf-ipcity") || undefined

        await prisma.productView.create({
            data: {
                productId,
                slug,
                userAgent,
                ipAddress,
                referrer,
                country,
                city,
                userId: session?.user?.id,
                sessionId: ipAddress ? `session_${ipAddress}_${new Date().getTime()}` : undefined,
                affiliateId,
            },
        })
    } catch (error) {
        console.error("Error tracking product view:", error)
        // Don't throw error - tracking failures shouldn't break the page
    }
}

export async function getPageViews(path?: string, startDate?: Date, endDate?: Date) {
    const where = {
        ...(path && { path }),
        ...(startDate && endDate && {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        }),
    }

    const views = await prisma.pageView.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 1000,
    })

    return views
}

export async function getProductViewStats(productId?: string, startDate?: Date, endDate?: Date) {
    const where = {
        ...(productId && { productId }),
        ...(startDate && endDate && {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        }),
    }

    const views = await prisma.productView.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
            product: {
                select: {
                    name: true,
                    slug: true,
                    images: true,
                },
            },
        },
        take: 1000,
    })

    return views
}

export async function getTopProductsByViews(limit: number = 10, days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const topProducts = await prisma.productView.groupBy({
        by: ["productId"],
        where: {
            createdAt: {
                gte: startDate,
            },
        },
        _count: {
            id: true,
        },
        orderBy: {
            _count: {
                id: "desc",
            },
        },
        take: limit,
    })

    // Get product details
    const productsWithDetails = await Promise.all(
        topProducts.map(async (item) => {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    images: true,
                    price: true,
                },
            })
            return {
                ...product,
                viewCount: item._count.id,
            }
        })
    )

    return productsWithDetails
}

export async function getPageViewsByPath(days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const viewsByPath = await prisma.pageView.groupBy({
        by: ["path"],
        where: {
            createdAt: {
                gte: startDate,
            },
        },
        _count: {
            id: true,
        },
        orderBy: {
            _count: {
                id: "desc",
            },
        },
        take: 20,
    })

    return viewsByPath.map((item) => ({
        path: item.path,
        views: item._count.id,
    }))
}

export async function getDailyViewsStats(days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const pageViews = await prisma.pageView.findMany({
        where: {
            createdAt: {
                gte: startDate,
            },
        },
        select: {
            createdAt: true,
        },
    })

    const productViews = await prisma.productView.findMany({
        where: {
            createdAt: {
                gte: startDate,
            },
        },
        select: {
            createdAt: true,
        },
    })

    // Group by date
    const dailyStats: Record<string, { pageViews: number; productViews: number }> = {}

    pageViews.forEach((view) => {
        const date = view.createdAt.toISOString().split("T")[0]
        if (!dailyStats[date]) {
            dailyStats[date] = { pageViews: 0, productViews: 0 }
        }
        dailyStats[date].pageViews++
    })

    productViews.forEach((view) => {
        const date = view.createdAt.toISOString().split("T")[0]
        if (!dailyStats[date]) {
            dailyStats[date] = { pageViews: 0, productViews: 0 }
        }
        dailyStats[date].productViews++
    })

    // Convert to array and sort by date
    const result = Object.entries(dailyStats)
        .map(([date, stats]) => ({
            date,
            ...stats,
            totalViews: stats.pageViews + stats.productViews,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

    return result
}
