"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

async function checkAdminAccess() {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/")
    }
    return session
}

export async function getAdminReviews({
    page = 1,
    limit = 20,
    search,
    rating,
    verified,
}: {
    page?: number
    limit?: number
    search?: string
    rating?: number
    verified?: "verified" | "unverified" | "all"
} = {}) {
    await checkAdminAccess()

    const where: Record<string, unknown> = {}

    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { comment: { contains: search, mode: "insensitive" } },
            { user: { name: { contains: search, mode: "insensitive" } } },
            { product: { name: { contains: search, mode: "insensitive" } } },
        ]
    }

    if (rating) {
        where.rating = rating
    }

    if (verified === "verified") {
        where.isVerified = true
    } else if (verified === "unverified") {
        where.isVerified = false
    }

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        images: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.review.count({ where }),
    ])

    return {
        reviews,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    }
}

export async function verifyReview(id: string, isVerified: boolean) {
    const session = await checkAdminAccess()

    await prisma.review.update({
        where: { id },
        data: { isVerified },
    })

    await prisma.auditLog.create({
        data: {
            userId: session.user.id,
            action: isVerified ? "VERIFY_REVIEW" : "UNVERIFY_REVIEW",
            entity: "Review",
            entityId: id,
        },
    })

    revalidatePath("/admin/reviews")
    return { success: true }
}

export async function deleteReview(id: string) {
    const session = await checkAdminAccess()

    const review = await prisma.review.findUnique({
        where: { id },
        include: { product: true },
    })

    if (!review) {
        return { error: "Review not found" }
    }

    await prisma.review.delete({
        where: { id },
    })

    // Update product rating
    const reviews = await prisma.review.findMany({
        where: { productId: review.productId },
        select: { rating: true },
    })

    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

    await prisma.product.update({
        where: { id: review.productId },
        data: {
            rating: avgRating,
            reviewCount: reviews.length,
        },
    })

    await prisma.auditLog.create({
        data: {
            userId: session.user.id,
            action: "DELETE_REVIEW",
            entity: "Review",
            entityId: id,
            changes: JSON.stringify({ productId: review.productId }),
        },
    })

    revalidatePath("/admin/reviews")
    return { success: true }
}
