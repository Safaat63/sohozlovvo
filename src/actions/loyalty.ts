"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function getUserLoyaltyPoints() {
    const session = await auth()

    if (!session?.user?.id) {
        return null
    }

    const loyaltyPoints = await prisma.loyaltyPoints.findUnique({
        where: { userId: session.user.id },
    })

    return loyaltyPoints?.points || 0
}

export async function updateLoyaltyPoints(userId: string, points: number) {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/")
    }

    try {
        await prisma.loyaltyPoints.upsert({
            where: { userId },
            create: {
                userId,
                points,
            },
            update: {
                points,
            },
        })

        revalidatePath("/admin/customers")
        revalidatePath(`/admin/customers/${userId}`)
        return { success: true }
    } catch (error) {
        console.error("Error updating loyalty points:", error)
        return { error: "Failed to update loyalty points" }
    }
}

export async function addLoyaltyPoints(userId: string, pointsToAdd: number) {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/")
    }

    try {
        await prisma.loyaltyPoints.upsert({
            where: { userId },
            create: {
                userId,
                points: pointsToAdd,
            },
            update: {
                points: {
                    increment: pointsToAdd,
                },
            },
        })

        revalidatePath("/admin/customers")
        revalidatePath(`/admin/customers/${userId}`)
        return { success: true }
    } catch (error) {
        console.error("Error adding loyalty points:", error)
        return { error: "Failed to add loyalty points" }
    }
}

export async function deductLoyaltyPoints(userId: string, pointsToDeduct: number) {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/")
    }

    try {
        const currentPoints = await prisma.loyaltyPoints.findUnique({
            where: { userId },
            select: { points: true },
        })

        if (!currentPoints || currentPoints.points < pointsToDeduct) {
            return { error: "Insufficient loyalty points" }
        }

        await prisma.loyaltyPoints.update({
            where: { userId },
            data: {
                points: {
                    decrement: pointsToDeduct,
                },
            },
        })

        revalidatePath("/admin/customers")
        revalidatePath(`/admin/customers/${userId}`)
        return { success: true }
    } catch (error) {
        console.error("Error deducting loyalty points:", error)
        return { error: "Failed to deduct loyalty points" }
    }
}
