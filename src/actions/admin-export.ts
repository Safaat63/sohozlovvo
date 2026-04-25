"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function exportProductsToCSV() {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    const products = await prisma.product.findMany({
        include: {
            category: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
    })

    const csvHeader = "ID,Name,SKU,Price,Compare Price,Cost Price,Stock,Brand,Category,Status,Created Date\n"
    const csvRows = products.map((product) =>
        `${product.id},"${product.name}",${product.sku || ""},${product.price},${product.compareAtPrice || ""},${product.costPrice || ""},${product.stock},${product.brand || ""},${product.category?.name || ""},${product.isActive ? "Active" : "Inactive"},${new Date(product.createdAt).toLocaleDateString()}`
    ).join("\n")

    return csvHeader + csvRows
}

export async function exportOrdersToCSV(startDate?: Date, endDate?: Date) {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    const orders = await prisma.order.findMany({
        where: {
            ...(startDate && endDate ? {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            } : {}),
        },
        include: {
            user: true,
            items: true,
        },
        orderBy: { createdAt: "desc" },
    })

    const csvHeader = "Order Number,Customer Name,Email,Phone,Total,Status,Payment Method,Payment Status,Items Count,Created At\n"
    const csvRows = orders.map(o =>
        `"${o.orderNumber}","${o.customerName || o.user?.name || ''}","${o.customerEmail || o.user?.email || ''}","${o.customerPhone || ''}","${o.total}","${o.status}","${o.paymentMethod}","${o.paymentStatus}","${o.items.length}","${o.createdAt.toISOString()}"`
    ).join("\n")

    return csvHeader + csvRows
}

export async function exportCustomersToCSV() {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    const customers = await prisma.user.findMany({
        where: { role: "CUSTOMER" },
        include: {
            orders: true,
            _count: {
                select: { orders: true },
            },
        },
        orderBy: { createdAt: "desc" },
    })

    const csvHeader = "ID,Name,Email,Phone,Total Orders,Created At\n"
    const csvRows = customers.map(c =>
        `"${c.id}","${c.name || ''}","${c.email}","${c.phone || ''}","${c._count.orders}","${c.createdAt.toISOString()}"`
    ).join("\n")

    return csvHeader + csvRows
}

export async function exportNewsletterToCSV() {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    const subscribers = await prisma.newsletter.findMany({
        orderBy: { createdAt: "desc" },
    })

    const csvHeaders = "Email,Status,Subscribed Date,Last Updated\n"
    const csvRows = subscribers
        .map((sub) =>
            `${sub.email},${sub.isActive ? "Active" : "Unsubscribed"},${new Date(sub.createdAt).toLocaleDateString()},${new Date(sub.updatedAt).toLocaleDateString()}`
        )
        .join("\n")

    return csvHeaders + csvRows
}
