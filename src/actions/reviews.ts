"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const reviewSchema = z.object({
    productId: z.string(),
    rating: z.coerce.number().int().min(1).max(5),
    title: z.string().optional(),
    comment: z.string().optional(),
})

export async function createReview(formData: FormData) {
    const session = await auth()

    if (!session?.user) {
        return { error: "You must be logged in to leave a review" }
    }

    const data = {
        productId: formData.get("productId") as string,
        rating: parseInt(formData.get("rating") as string),
        title: formData.get("title") as string || undefined,
        comment: formData.get("comment") as string || undefined,
    }

    const validated = reviewSchema.safeParse(data)
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    // Check if user has purchased this product
    const hasPurchased = await prisma.orderItem.findFirst({
        where: {
            productId: validated.data.productId,
            order: {
                userId: session.user.id,
                status: "DELIVERED",
            },
        },
    })

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
        where: {
            productId: validated.data.productId,
            userId: session.user.id,
        },
    })

    if (existingReview) {
        return { error: "You have already reviewed this product" }
    }

    try {
        const review = await prisma.review.create({
            data: {
                ...validated.data,
                userId: session.user.id,
                isVerified: !!hasPurchased,
            },
        })

        // Update product rating
        const reviews = await prisma.review.aggregate({
            where: { productId: validated.data.productId },
            _avg: { rating: true },
            _count: true,
        })

        await prisma.product.update({
            where: { id: validated.data.productId },
            data: {
                rating: reviews._avg.rating || 0,
                reviewCount: reviews._count,
            },
        })

        const product = await prisma.product.findUnique({
            where: { id: validated.data.productId },
            select: { slug: true },
        })

        revalidatePath(`/products/${product?.slug}`)
        return { success: true, review }
    } catch {
        return { error: "Failed to create review" }
    }
}

export async function getProductReviews(productId: string, page = 1, limit = 10) {
    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where: { productId },
            include: {
                user: {
                    select: { name: true, image: true },
                },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.review.count({ where: { productId } }),
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

export async function deleteReview(reviewId: string) {
    const session = await auth()

    if (!session?.user) {
        return { error: "Unauthorized" }
    }

    const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: { product: { select: { slug: true } } },
    })

    if (!review) {
        return { error: "Review not found" }
    }

    // Only the author or admin can delete
    if (review.userId !== session.user.id && session.user.role !== "ADMIN") {
        return { error: "Unauthorized" }
    }

    try {
        await prisma.review.delete({ where: { id: reviewId } })

        // Update product rating
        const reviews = await prisma.review.aggregate({
            where: { productId: review.productId },
            _avg: { rating: true },
            _count: true,
        })

        await prisma.product.update({
            where: { id: review.productId },
            data: {
                rating: reviews._avg.rating || 0,
                reviewCount: reviews._count,
            },
        })

        revalidatePath(`/products/${review.product.slug}`)
        return { success: true }
    } catch {
        return { error: "Failed to delete review" }
    }
}
