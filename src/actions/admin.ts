"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { OrderStatus, PaymentStatus } from "@/generated/prisma/enums"
import { startOfMonth, subMonths } from "date-fns"
import { sendOrderStatusUpdate } from "@/lib/email"

export async function checkAdminAccess() {
    const session = await auth()

    if (session.user.role !== "ADMIN") {
        redirect("/")
    }

    return session
}

export async function getDashboardStats() {
    await checkAdminAccess()

    const now = new Date()
    const monthStart = startOfMonth(now)
    const lastMonthStart = startOfMonth(subMonths(now, 1))

    // Get total stats
    const [
        totalOrders,
        totalRevenue,
        totalCustomers,
        totalProducts,
        monthOrders,
        monthRevenue,
        lastMonthRevenue,
        lowStockProducts,
        recentOrders,
    ] = await Promise.all([
        prisma.order.count(),
        prisma.order.aggregate({
            _sum: { total: true },
            where: { paymentStatus: "PAID" },
        }),
        prisma.user.count({
            where: { role: "CUSTOMER" },
        }),
        prisma.product.count({ where: { isActive: true } }),
        prisma.order.count({
            where: { createdAt: { gte: monthStart } },
        }),
        prisma.order.aggregate({
            _sum: { total: true },
            where: {
                paymentStatus: "PAID",
                createdAt: { gte: monthStart },
            },
        }),
        prisma.order.aggregate({
            _sum: { total: true },
            where: {
                paymentStatus: "PAID",
                createdAt: {
                    gte: lastMonthStart,
                    lt: monthStart,
                },
            },
        }),
        prisma.product.findMany({
            where: {
                isActive: true,
                stock: { lte: 10 },
            },
            take: 10,
            orderBy: { stock: "asc" },
        }),
        prisma.order.findMany({
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        }),
    ])

    const lastMonthRevenueValue = parseFloat(lastMonthRevenue._sum.total?.toString() || "0")
    const currentMonthRevenueValue = parseFloat(monthRevenue._sum.total?.toString() || "0")
    const revenueGrowth =
        lastMonthRevenueValue > 0
            ? ((currentMonthRevenueValue - lastMonthRevenueValue) / lastMonthRevenueValue) * 100
            : 0

    return {
        totalOrders,
        totalRevenue: parseFloat(totalRevenue._sum.total?.toString() || "0"),
        totalCustomers,
        totalProducts,
        monthOrders,
        monthRevenue: currentMonthRevenueValue,
        revenueGrowth,
        lowStockProducts,
        recentOrders,
    }
}

export async function getAllOrders({
    status,
    page = 1,
    limit = 20,
}: {
    status?: string
    page?: number
    limit?: number
} = {}) {
    await checkAdminAccess()

    const where = status ? { status: status as OrderStatus } : {}

    const [ordersRaw, total] = await Promise.all([
        prisma.order.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.order.count({ where }),
    ])

    // Serialize Decimal objects to numbers for client components
    const orders = ordersRaw.map(order => ({
        ...order,
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        tax: Number(order.tax),
        discount: Number(order.discount),
        total: Number(order.total),
        items: order.items.map(item => ({
            ...item,
            price: Number(item.price),
            product: {
                ...item.product,
                price: Number(item.product.price),
                compareAtPrice: item.product.compareAtPrice ? Number(item.product.compareAtPrice) : null,
                costPrice: item.product.costPrice ? Number(item.product.costPrice) : null,
                rating: Number(item.product.rating),
                discountValue: item.product.discountValue ? Number(item.product.discountValue) : null,
            }
        }))
    }))

    return {
        orders,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    }
}

export async function updateOrderStatus(orderId: string, status: string, paymentStatus: string, trackingNumber?: string) {
    await checkAdminAccess()

    // Get current order to check if order status changed
    const currentOrder = await prisma.order.findUnique({
        where: { id: orderId },
        select: { status: true, paymentStatus: true },
    })

    const orderStatusChanged = currentOrder?.status !== status
    const paymentStatusChanged = currentOrder?.paymentStatus !== paymentStatus

    const order = await prisma.order.update({
        where: { id: orderId },
        data: {
            status: status as OrderStatus,
            paymentStatus: paymentStatus as PaymentStatus,
            ...(trackingNumber && { trackingNumber }),
        },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
    })

    // Send confirmation email when payment is verified
    if (paymentStatusChanged && paymentStatus === "PAID") {
        const { sendOrderConfirmation } = await import("@/lib/email")

        const totalDiscount = parseFloat(order.discount.toString())
        const couponDiscount = order.couponCode ? totalDiscount : 0

        // Helper function to format variation details
        const formatVariationDetails = (variationDetails: string | null) => {
            if (!variationDetails) return ""
            try {
                const variations: Array<{ type: string; value: string }> = JSON.parse(variationDetails)
                return variations.map(v => `${v.type}: ${v.value}`).join(', ')
            } catch {
                return ""
            }
        }

        await sendOrderConfirmation({
            orderNumber: order.orderNumber,
            customerName: order.customerName || "Customer",
            customerEmail: order.customerEmail || "",
            items: order.items.map((item) => {
                const variationText = formatVariationDetails(item.variationDetails)
                return {
                    name: variationText
                        ? `${item.name} (${variationText})`
                        : item.name,
                    quantity: item.quantity,
                    price: parseFloat(item.price.toString()).toFixed(2),
                }
            }),
            subtotal: order.subtotal.toString(),
            shippingCost: order.shippingCost.toString(),
            discount: couponDiscount.toFixed(2),
            total: order.total.toString(),
            shippingAddress: order.shippingAddress || "",
            paymentMethod: order.paymentMethod,
            couponCode: order.couponCode,
            loyaltyPointsUsed: order.pointsUsed,
        })
    }

    // Only send status update email if order status changed (not just payment status)
    if (orderStatusChanged) {
        await sendOrderStatusUpdate({
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            status,
            trackingNumber: order.trackingNumber,
        })
    }

    return order
}

export async function bulkUpdateOrders({
    ids,
    status,
    paymentStatus,
}: {
    ids: string[]
    status?: OrderStatus
    paymentStatus?: PaymentStatus
}) {
    await checkAdminAccess()
    if (!ids.length) return { error: "No orders selected" }
    if (!status && !paymentStatus) return { error: "Select a status to update" }

    await prisma.order.updateMany({
        where: { id: { in: ids } },
        data: {
            ...(status ? { status } : {}),
            ...(paymentStatus ? { paymentStatus } : {}),
        },
    })

    revalidatePath("/admin/orders")
    return { success: true }
}

export async function deleteOrder(id: string) {
    await checkAdminAccess()

    if (!id) return { error: "Order ID is required" }

    try {
        // Delete related payment records first (due to foreign key constraint)
        await prisma.payment.deleteMany({
            where: { orderId: id },
        })

        // Delete affiliate referral if exists
        await prisma.affiliateReferral.deleteMany({
            where: { orderId: id },
        })

        // Delete the order
        await prisma.order.delete({
            where: { id },
        })

        revalidatePath("/admin/orders")
        return { success: true }
    } catch (error) {
        console.error("Error deleting order:", error)
        return { error: "Failed to delete order" }
    }
}

export async function deleteOrders(ids: string[]) {
    await checkAdminAccess()

    if (!ids.length) return { error: "No orders selected" }

    try {
        // Delete in correct order due to foreign key constraints
        await prisma.payment.deleteMany({
            where: { orderId: { in: ids } },
        })

        await prisma.affiliateReferral.deleteMany({
            where: { orderId: { in: ids } },
        })

        await prisma.order.deleteMany({
            where: { id: { in: ids } },
        })

        revalidatePath("/admin/orders")
        return { success: true }
    } catch (error) {
        console.error("Error deleting orders:", error)
        return { error: "Failed to delete orders" }
    }
}

export async function getSalesData(days = 30) {
    await checkAdminAccess()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const orders = await prisma.order.findMany({
        where: {
            createdAt: { gte: startDate },
            paymentStatus: "PAID",
        },
        select: {
            createdAt: true,
            total: true,
        },
    })

    const dailyTotals = new Map<string, { date: string; total: number; orders: number }>()

    for (const order of orders) {
        const dayKey = order.createdAt.toISOString().slice(0, 10) // YYYY-MM-DD
        const current = dailyTotals.get(dayKey) ?? { date: dayKey, total: 0, orders: 0 }
        const orderTotal = parseFloat(order.total.toString())
        dailyTotals.set(dayKey, {
            date: dayKey,
            total: current.total + orderTotal,
            orders: current.orders + 1,
        })
    }

    return Array.from(dailyTotals.values()).sort((a, b) => a.date.localeCompare(b.date))
}

export async function getAllFeedback({
    status,
    type,
    page = 1,
    limit = 20,
}: {
    status?: string
    type?: string
    page?: number
    limit?: number
} = {}) {
    await checkAdminAccess()

    const where: any = {}
    if (status && status !== "all") where.status = status
    if (type && type !== "all") where.type = type

    const [feedback, total] = await Promise.all([
        prisma.feedback.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.feedback.count({ where }),
    ])

    const pages = Math.ceil(total / limit)

    return {
        feedback,
        pagination: {
            page,
            limit,
            total,
            pages,
        },
    }
}

export async function updateFeedbackStatus({
    ids,
    status,
}: {
    ids: string[]
    status: string
}) {
    await checkAdminAccess()

    if (!ids.length) return { error: "No feedback selected" }

    await prisma.feedback.updateMany({
        where: { id: { in: ids } },
        data: { status },
    })

    revalidatePath("/admin/feedback")
    revalidatePath("/(admin)/admin/feedback/[id]", 'page')
    return { success: true }
}

export async function deleteFeedback(ids: string[]) {
    await checkAdminAccess()

    if (!ids.length) return { error: "No feedback selected" }

    await prisma.feedback.deleteMany({
        where: { id: { in: ids } },
    })

    revalidatePath("/admin/feedback")
    return { success: true }
}
