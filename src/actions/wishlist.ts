"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getWishlist() {
    const session = await auth()

    if (!session?.user?.id) {
        return null
    }

    const wishlist = await prisma.wishlist.findUnique({
        where: { userId: session.user.id },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            category: true,
                            flashSales: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    })

    return wishlist
}

export async function getWishlistCount() {
    const session = await auth()

    if (!session?.user?.id) {
        return 0
    }

    const wishlist = await prisma.wishlist.findUnique({
        where: { userId: session.user.id },
        include: {
            _count: {
                select: { items: true },
            },
        },
    })

    return wishlist?._count.items || 0
}

export async function isInWishlist(productId: string) {
    const session = await auth()

    if (!session?.user?.id) {
        return false
    }

    const wishlist = await prisma.wishlist.findUnique({
        where: { userId: session.user.id },
    })

    if (!wishlist) {
        return false
    }

    const item = await prisma.wishlistItem.findUnique({
        where: {
            wishlistId_productId: {
                wishlistId: wishlist.id,
                productId,
            },
        },
    })

    return !!item
}

export async function addToWishlist(productId: string) {
    const session = await auth()

    if (!session?.user?.id) {
        return { error: "Please login to add items to wishlist" }
    }

    try {
        // Get or create wishlist
        let wishlist = await prisma.wishlist.findUnique({
            where: { userId: session.user.id },
        })

        if (!wishlist) {
            wishlist = await prisma.wishlist.create({
                data: { userId: session.user.id },
            })
        }

        // Check if item already exists
        const existingItem = await prisma.wishlistItem.findUnique({
            where: {
                wishlistId_productId: {
                    wishlistId: wishlist.id,
                    productId,
                },
            },
        })

        if (existingItem) {
            return { error: "Item already in wishlist" }
        }

        // Add item
        await prisma.wishlistItem.create({
            data: {
                wishlistId: wishlist.id,
                productId,
            },
        })

        revalidatePath("/wishlist")
        revalidatePath(`/products/${productId}`)

        return { success: true }
    } catch (error) {
        console.error("Error adding to wishlist:", error)
        return { error: "Failed to add to wishlist" }
    }
}

export async function removeFromWishlist(productId: string) {
    const session = await auth()

    if (!session?.user?.id) {
        return { error: "Please login" }
    }

    try {
        const wishlist = await prisma.wishlist.findUnique({
            where: { userId: session.user.id },
        })

        if (!wishlist) {
            return { error: "Wishlist not found" }
        }

        await prisma.wishlistItem.delete({
            where: {
                wishlistId_productId: {
                    wishlistId: wishlist.id,
                    productId,
                },
            },
        })

        revalidatePath("/wishlist")
        revalidatePath(`/products/${productId}`)

        return { success: true }
    } catch (error) {
        console.error("Error removing from wishlist:", error)
        return { error: "Failed to remove from wishlist" }
    }
}

export async function toggleWishlist(productId: string) {
    const isInList = await isInWishlist(productId)

    if (isInList) {
        return removeFromWishlist(productId)
    } else {
        return addToWishlist(productId)
    }
}
