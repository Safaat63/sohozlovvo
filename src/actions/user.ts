"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function getUserProfile() {
    const session = await auth()

    if (!session?.user?.id) {
        return null
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            image: true,
            createdAt: true,
            _count: {
                select: {
                    orders: true,
                    addresses: true,
                    reviews: true,
                },
            },
            loyaltyPoints: {
                select: {
                    points: true,
                },
            },
            orders: {
                take: 3,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    orderNumber: true,
                    createdAt: true,
                    status: true,
                    total: true,
                    items: {
                        take: 3,
                        select: {
                            id: true,
                            product: {
                                select: {
                                    name: true,
                                    images: true,
                                },
                            },
                        },
                    },
                },
            },
            wishlist: {
                select: {
                    items: {
                        select: { id: true },
                    },
                },
            },
        },
    })

    if (!user) return null

    const recentOrders = user.orders.map((order) => ({
        ...order,
        total: Number(order.total),
    }))

    const { orders, wishlist, ...rest } = user

    return {
        ...rest,
        recentOrders,
        wishlistCount: wishlist?.items.length || 0,
    }
}

export async function updateUserProfile(formData: FormData) {
    const session = await auth()

    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    try {
        const name = formData.get("name") as string
        const phone = formData.get("phone") as string
        const image = formData.get("image") as string

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name,
                phone: phone || null,
                image: image || null,
            },
        })

        revalidatePath("/account")
        return { success: true }
    } catch (error) {
        console.error("Error updating profile:", error)
        return { error: "Failed to update profile" }
    }
}

export async function changePassword(formData: FormData) {
    const session = await auth()

    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    try {
        const currentPassword = formData.get("currentPassword") as string
        const newPassword = formData.get("newPassword") as string
        const confirmPassword = formData.get("confirmPassword") as string

        if (!currentPassword || !newPassword || !confirmPassword) {
            return { error: "All fields are required" }
        }

        if (newPassword !== confirmPassword) {
            return { error: "New passwords do not match" }
        }

        if (newPassword.length < 6) {
            return { error: "Password must be at least 6 characters" }
        }

        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { password: true },
        })

        if (!user?.password) {
            return { error: "Cannot change password for this account type" }
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

        if (!isPasswordValid) {
            return { error: "Current password is incorrect" }
        }

        // Hash new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 12)

        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword },
        })

        return { success: true }
    } catch (error) {
        console.error("Error changing password:", error)
        return { error: "Failed to change password" }
    }
}
