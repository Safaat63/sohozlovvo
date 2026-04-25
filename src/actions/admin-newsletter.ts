"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getAllNewsletterSubscribers({
    page = 1,
    limit = 20,
}: {
    page?: number
    limit?: number
} = {}) {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    const [subscribers, total] = await Promise.all([
        prisma.newsletter.findMany({
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.newsletter.count(),
    ])

    return {
        subscribers,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    }
}

export async function exportNewsletterEmails() {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    const subscribers = await prisma.newsletter.findMany({
        where: { isActive: true },
        select: { email: true },
    })

    return subscribers.map(s => s.email).join(", ")
}

export async function deleteNewsletterSubscriber(id: string) {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    await prisma.newsletter.delete({
        where: { id },
    })

    revalidatePath("/admin/newsletter")
    return { success: true }
}

export async function toggleNewsletterStatus(id: string, isActive: boolean) {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    await prisma.newsletter.update({
        where: { id },
        data: { isActive },
    })

    revalidatePath("/admin/newsletter")
    return { success: true }
}

export async function bulkToggleNewsletterStatus(ids: string[], isActive: boolean) {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    if (!ids.length) return { error: "No subscribers selected" }

    try {
        await prisma.newsletter.updateMany({
            where: { id: { in: ids } },
            data: { isActive },
        })

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "BULK_TOGGLE_STATUS",
                entity: "NewsletterSubscriber",
                entityId: ids.join(","),
                changes: JSON.stringify({ isActive, count: ids.length }),
            },
        })

        revalidatePath("/admin/newsletter")
        return { success: true }
    } catch {
        return { error: "Failed to update subscriber status" }
    }
}

export async function bulkDeleteNewsletterSubscribers(ids: string[]) {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    if (!ids.length) return { error: "No subscribers selected" }

    try {
        await prisma.newsletter.deleteMany({
            where: { id: { in: ids } },
        })

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "BULK_DELETE",
                entity: "NewsletterSubscriber",
                entityId: ids.join(","),
                changes: JSON.stringify({ count: ids.length }),
            },
        })

        revalidatePath("/admin/newsletter")
        return { success: true }
    } catch {
        return { error: "Failed to delete subscribers" }
    }
}
