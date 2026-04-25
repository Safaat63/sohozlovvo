"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { UserRole } from "@/generated/prisma/enums"

async function checkAdminAccess() {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/")
    }
    return session
}

export async function getCustomers({
    page = 1,
    limit = 20,
    search,
    role,
}: {
    page?: number
    limit?: number
    search?: string
    role?: "CUSTOMER" | "ADMIN" | "all"
} = {}) {
    await checkAdminAccess()

    const where: Record<string, unknown> = {}

    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
        ]
    }

    if (role === "ADMIN" || role === "CUSTOMER") {
        where.role = role
    }

    const [customers, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
                _count: {
                    select: { orders: true, reviews: true },
                },
                orders: {
                    select: { total: true },
                    where: { paymentStatus: "PAID" },
                },
                loyaltyPoints: {
                    select: { points: true },
                },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.user.count({ where }),
    ])

    // Calculate total spent for each customer
    const customersWithStats = customers.map((customer) => ({
        ...customer,
        totalSpent: customer.orders.reduce(
            (sum, order) => sum + parseFloat(order.total.toString()),
            0
        ),
        orderCount: customer._count.orders,
        reviewCount: customer._count.reviews,
        loyaltyPoints: customer.loyaltyPoints?.points || 0,
    }))

    return {
        customers: customersWithStats,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    }
}

export async function bulkUpdateCustomerRole(ids: string[], role: "CUSTOMER" | "ADMIN") {
    const session = await checkAdminAccess()

    if (!ids.length) return { error: "No customers selected" }
    if (!["CUSTOMER", "ADMIN"].includes(role)) return { error: "Invalid role" }
    if (ids.includes(session.user.id)) return { error: "You cannot change your own role" }

    try {
        await prisma.user.updateMany({
            where: { id: { in: ids } },
            data: { role },
        })

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "BULK_UPDATE_ROLE",
                entity: "User",
                entityId: ids.join(","),
                changes: JSON.stringify({ role, count: ids.length }),
            },
        })

        revalidatePath("/admin/customers")
        return { success: true }
    } catch {
        return { error: "Failed to update roles" }
    }
}

export async function bulkDeleteCustomers(ids: string[]) {
    const session = await checkAdminAccess()

    if (!ids.length) return { error: "No customers selected" }
    if (ids.includes(session.user.id)) return { error: "You cannot delete your own account" }

    try {
        await prisma.user.deleteMany({ where: { id: { in: ids } } })

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "BULK_DELETE",
                entity: "User",
                entityId: ids.join(","),
                changes: JSON.stringify({ count: ids.length }),
            },
        })

        revalidatePath("/admin/customers")
        return { success: true }
    } catch {
        return { error: "Failed to delete customers" }
    }
}

export async function getCustomer(id: string) {
    await checkAdminAccess()

    const customer = await prisma.user.findUnique({
        where: { id },
        include: {
            addresses: true,
            orders: {
                orderBy: { createdAt: "desc" },
                take: 10,
                include: {
                    items: true,
                },
            },
            reviews: {
                orderBy: { createdAt: "desc" },
                take: 5,
                include: {
                    product: {
                        select: { name: true, slug: true },
                    },
                },
            },
            loyaltyPoints: true,
        },
    })

    if (!customer) return null

    const totalSpent = await prisma.order.aggregate({
        where: { userId: id, paymentStatus: "PAID" },
        _sum: { total: true },
    })

    return {
        ...customer,
        totalSpent: parseFloat(totalSpent._sum.total?.toString() || "0"),
    }
}

export async function updateCustomerRole(id: string, role: string) {
    const session = await checkAdminAccess()

    // Only admins can change roles
    if (session.user.role !== "ADMIN") {
        return { error: "Only administrators can change user roles" }
    }

    if (!["CUSTOMER", "ADMIN"].includes(role)) {
        return { error: "Invalid role selection" }
    }

    // Can't change your own role
    if (id === session.user.id) {
        return { error: "You cannot change your own role" }
    }

    try {
        await prisma.user.update({
            where: { id },
            data: { role: role as UserRole },
        })

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "UPDATE_ROLE",
                entity: "User",
                entityId: id,
                changes: JSON.stringify({ newRole: role }),
            },
        })

        revalidatePath("/admin/customers")
        return { success: true }
    } catch {
        return { error: "Failed to update user role" }
    }
}

export async function deleteCustomer(id: string) {
    const session = await checkAdminAccess()

    // Only admins can delete users
    if (session.user.role !== "ADMIN") {
        return { error: "Only administrators can delete users" }
    }

    // Can't delete yourself
    if (id === session.user.id) {
        return { error: "You cannot delete your own account" }
    }

    try {
        const user = await prisma.user.delete({ where: { id } })

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "DELETE",
                entity: "User",
                entityId: id,
                changes: JSON.stringify({ email: user.email }),
            },
        })

        revalidatePath("/admin/customers")
        return { success: true }
    } catch {
        return { error: "Failed to delete user" }
    }
}
