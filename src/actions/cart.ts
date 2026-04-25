"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

/**
 * UPDATED CART ACTIONS FOR VARIANT COMBINATION SYSTEM
 * 
 * This file handles cart operations with the new ProductVariantCombination system.
 * Key changes:
 * - Uses combinationId instead of variationOptionId
 * - Fetches combinations with their options
 * - Validates stock against combinations
 */

export async function getCart() {
    const session = await auth()
    const cookieStore = await cookies()

    let cart

    if (session?.user?.id) {
        // Get cart for logged-in user
        cart = await prisma.cart.findUnique({
            where: { userId: session.user.id },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                variations: {
                                    include: {
                                        options: true,
                                    },
                                },
                            },
                            // Include discount fields for cart calculations
                        },
                        combination: {
                            include: {
                                options: {
                                    include: {
                                        option: {
                                            include: {
                                                variation: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })
    } else {
        // Get cart for guest user using session ID
        const sessionId = cookieStore.get("cart_session")?.value

        if (sessionId) {
            cart = await prisma.cart.findUnique({
                where: { sessionId },
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    variations: {
                                        include: {
                                            options: true,
                                        },
                                    },
                                },
                            },
                            combination: {
                                include: {
                                    options: {
                                        include: {
                                            option: {
                                                include: {
                                                    variation: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            })
        }
    }

    return cart
}

export async function addToCart(
    productId: string,
    quantity = 1,
    combinationId?: string // CHANGED from variationOptionId
) {
    const session = await auth()
    const cookieStore = await cookies()

    // Check if product exists
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
            variations: {
                include: {
                    options: true,
                },
            },
        },
    })

    if (!product) {
        return { error: "Product not found" }
    }

    // Determine effective stock and price
    let effectiveStock = product.stock
    let effectivePrice = Number(product.price)

    if (combinationId) {
        // Validate combination
        const combination = await prisma.productVariantCombination.findUnique({
            where: { id: combinationId },
            include: {
                options: {
                    include: {
                        option: true,
                    },
                },
            },
        })

        if (!combination) {
            return { error: "Selected variant not found" }
        }

        if (!combination.isActive) {
            return { error: "Selected variant is not available" }
        }

        if (combination.productId !== productId) {
            return { error: "Invalid variant for this product" }
        }

        effectiveStock = combination.stock

        // Use combination price if set, otherwise use base product price
        if (combination.price !== null) {
            effectivePrice = Number(combination.price)
        }
    }

    // Check stock
    if (effectiveStock < quantity) {
        return { error: "Insufficient stock" }
    }

    // Apply product discount to the effective price if applicable
    if (product.discountType && product.discountValue && Number(product.discountValue) > 0) {
        const now = new Date()
        let isDiscountValid = true

        if (product.discountStartDate && now < new Date(product.discountStartDate)) {
            isDiscountValid = false
        }
        if (product.discountEndDate && now > new Date(product.discountEndDate)) {
            isDiscountValid = false
        }

        if (isDiscountValid) {
            if (product.discountType === "PERCENTAGE") {
                const discount = (effectivePrice * Number(product.discountValue)) / 100
                effectivePrice = effectivePrice - discount
            } else if (product.discountType === "FIXED_AMOUNT") {
                effectivePrice = effectivePrice - Number(product.discountValue)
            }
            effectivePrice = Math.max(0, effectivePrice)
        }
    }

    let cart

    if (session?.user?.id) {
        // Handle logged-in user
        cart = await prisma.cart.upsert({
            where: { userId: session.user.id },
            create: {
                userId: session.user.id,
            },
            update: {},
        })

        // Check if item already exists
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId,
                combinationId: combinationId ?? null,
            },
        })

        if (existingItem) {
            // Update quantity
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: {
                    quantity: { increment: quantity },
                },
            })
        } else {
            // Create new cart item
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    combinationId,
                    quantity,
                },
            })
        }
    } else {
        // Handle guest user
        let sessionId = cookieStore.get("cart_session")?.value

        if (!sessionId) {
            sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`
                ; (await cookies()).set("cart_session", sessionId, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 60 * 60 * 24 * 30, // 30 days
                })
        }

        cart = await prisma.cart.upsert({
            where: { sessionId },
            create: {
                sessionId,
            },
            update: {},
        })

        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId,
                combinationId: combinationId ?? null,
            },
        })

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: {
                    quantity: { increment: quantity },
                },
            })
        } else {
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    combinationId,
                    quantity,
                },
            })
        }
    }

    revalidatePath("/cart")
    revalidatePath("/")

    return { success: true }
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
    const session = await auth()
    const cookieStore = await cookies()

    // Get cart item with combination
    const cartItem = await prisma.cartItem.findUnique({
        where: { id: itemId },
        include: {
            product: true,
            combination: true,
            cart: true,
        },
    })

    if (!cartItem) {
        return { error: "Cart item not found" }
    }

    // Verify ownership
    const sessionId = cookieStore.get("cart_session")?.value
    if (
        (session?.user?.id && cartItem.cart.userId !== session.user.id) ||
        (!session?.user?.id && cartItem.cart.sessionId !== sessionId)
    ) {
        return { error: "Unauthorized" }
    }

    // Check stock
    const availableStock = cartItem.combination
        ? cartItem.combination.stock
        : cartItem.product.stock

    if (quantity > availableStock) {
        return { error: "Insufficient stock" }
    }

    if (quantity <= 0) {
        await prisma.cartItem.delete({ where: { id: itemId } })
    } else {
        await prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity },
        })
    }

    revalidatePath("/cart")
    revalidatePath("/")

    return { success: true }
}

export async function removeCartItem(itemId: string) {
    const session = await auth()
    const cookieStore = await cookies()

    const cartItem = await prisma.cartItem.findUnique({
        where: { id: itemId },
        include: { cart: true },
    })

    if (!cartItem) {
        return { error: "Cart item not found" }
    }

    // Verify ownership
    const sessionId = cookieStore.get("cart_session")?.value
    if (
        (session?.user?.id && cartItem.cart.userId !== session.user.id) ||
        (!session?.user?.id && cartItem.cart.sessionId !== sessionId)
    ) {
        return { error: "Unauthorized" }
    }

    await prisma.cartItem.delete({ where: { id: itemId } })

    revalidatePath("/cart")
    revalidatePath("/")

    return { success: true }
}

export async function clearCart() {
    const session = await auth()
    const cookieStore = await cookies()

    let cart

    if (session?.user?.id) {
        cart = await prisma.cart.findUnique({
            where: { userId: session.user.id },
        })
    } else {
        const sessionId = cookieStore.get("cart_session")?.value
        if (sessionId) {
            cart = await prisma.cart.findUnique({
                where: { sessionId },
            })
        }
    }

    if (cart) {
        await prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        })
    }

    revalidatePath("/cart")
    revalidatePath("/")

    return { success: true }
}

export async function mergeGuestCart() {
    const session = await auth()
    const cookieStore = await cookies()

    if (!session?.user?.id) {
        return { error: "Not authenticated" }
    }

    const sessionId = cookieStore.get("cart_session")?.value
    if (!sessionId) {
        return { success: true }
    }

    const guestCart = await prisma.cart.findUnique({
        where: { sessionId },
        include: {
            items: true,
        },
    })

    if (!guestCart || guestCart.items.length === 0) {
        return { success: true }
    }

    const userCart = await prisma.cart.upsert({
        where: { userId: session.user.id },
        create: {
            userId: session.user.id,
        },
        update: {},
    })

    // Merge items
    for (const item of guestCart.items) {
        const existing = await prisma.cartItem.findFirst({
            where: {
                cartId: userCart.id,
                productId: item.productId,
                combinationId: item.combinationId,
            },
        })

        if (existing) {
            await prisma.cartItem.update({
                where: { id: existing.id },
                data: {
                    quantity: { increment: item.quantity },
                },
            })
        } else {
            await prisma.cartItem.create({
                data: {
                    cartId: userCart.id,
                    productId: item.productId,
                    combinationId: item.combinationId,
                    quantity: item.quantity,
                },
            })
        }
    }

    // Delete guest cart
    await prisma.cart.delete({ where: { id: guestCart.id } })

        // Clear session cookie
        ; (await cookies()).delete("cart_session")

    revalidatePath("/cart")
    revalidatePath("/")

    return { success: true }
}

// Backward compatibility exports
export const updateCartItem = updateCartItemQuantity
export const removeFromCart = removeCartItem
