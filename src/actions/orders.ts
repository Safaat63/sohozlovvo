"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getCart, clearCart } from "@/actions/cart"
import { getPublicSettings } from "@/actions/settings"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { PaymentMethod, PaymentStatus, OrderStatus } from "@/generated/prisma/enums"
import { validateCoupon } from "@/actions/admin-coupons"
import { validateBDPhoneNumber, validateEmail } from "@/lib/validation"
import { getAffiliateByCode, getAffiliateByCoupon, trackAffiliateOrder } from "@/actions/affiliates"
import { sendPushNotificationToAdmins } from "@/actions/push-notifications"

const checkoutSchema = z.object({
    name: z.string().min(2, "Please enter your full name (at least 2 characters)"),
    email: z.string().email("Please enter a valid email address").refine((email) => {
        const result = validateEmail(email)
        return result.valid
    }, { message: "Temporary/disposable email addresses are not allowed" }),
    phone: z.string().refine((phone) => validateBDPhoneNumber(phone), {
        message: "Please enter a valid Bangladesh phone number (e.g., +880 17XXXXXXXX)"
    }),
    street: z.string().min(5, "Please enter your complete street address (at least 5 characters)"),
    city: z.string().min(2, "Please enter your city name"),
    state: z.string().min(2, "Please enter your state/division"),
    postalCode: z.string().min(2, "Please enter a valid postal code"),
    paymentMethod: z.enum(["CARD", "BKASH", "NAGAD", "ROCKET", "COD", "MANUAL"]),
    transactionId: z.string().optional(),
    notes: z.string().optional(),
})

export async function createOrder(formData: FormData) {
    try {
        const session = await auth()
        const cart = await getCart()
        const settings = await getPublicSettings()

        if (!cart || cart.items.length === 0) {
            return { error: "Your cart is empty" }
        }

        const data = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            street: formData.get("street") as string,
            city: formData.get("city") as string,
            state: formData.get("state") as string,
            postalCode: formData.get("postalCode") as string,
            paymentMethod: formData.get("paymentMethod") as string,
            transactionId: (() => {
                const value = formData.get("transactionId")
                return value && typeof value === "string" && value.trim() !== "" ? value : undefined
            })(),
            notes: (() => {
                const value = formData.get("notes")
                return value && typeof value === "string" && value.trim() !== "" ? value : undefined
            })(),
        }

        const validatedFields = checkoutSchema.safeParse(data)

        if (!validatedFields.success) {
            return {
                error: validatedFields.error.issues[0].message,
            }
        }

        const { name, email, phone, street, city, state, postalCode, paymentMethod, transactionId, notes } = validatedFields.data

        // Check stock availability using combination stock if applicable
        for (const item of cart.items) {
            const availableStock = item.combination ? item.combination.stock : item.product.stock
            if (availableStock < item.quantity) {
                return {
                    error: `Sorry, ${item.product.name} only has ${availableStock} units available`,
                }
            }
        }

        // Calculate totals with discount support
        const subtotal = cart.items.reduce((sum, item) => {
            // Use combination price if exists, otherwise base product price
            let basePrice = item.combination?.price
                ? parseFloat(item.combination.price.toString())
                : parseFloat(item.product.price.toString())

            // Apply product discount if applicable
            if (item.product.discountType && item.product.discountValue) {
                const discountValue = Number(item.product.discountValue)
                const now = new Date()
                let isDiscountValid = true

                if (item.product.discountStartDate && now < new Date(item.product.discountStartDate)) {
                    isDiscountValid = false
                }
                if (item.product.discountEndDate && now > new Date(item.product.discountEndDate)) {
                    isDiscountValid = false
                }

                if (isDiscountValid && discountValue > 0) {
                    if (item.product.discountType === "PERCENTAGE") {
                        basePrice = basePrice - (basePrice * discountValue / 100)
                    } else if (item.product.discountType === "FIXED_AMOUNT") {
                        basePrice = basePrice - discountValue
                    }
                    basePrice = Math.max(0, basePrice)
                }
            }

            return sum + basePrice * item.quantity
        }, 0)

        const defaultShippingCost = parseFloat(settings.shipping_cost || "0")
        const freeShippingThreshold = parseFloat(settings.free_shipping_threshold || "0")
        const shippingCost = freeShippingThreshold > 0 && subtotal > freeShippingThreshold ? 0 : defaultShippingCost

        // Handle coupon
        const couponCode = (formData.get("couponCode") as string | null)?.trim() || null
        let couponDiscount = 0
        let couponId: string | null = null

        if (couponCode) {
            const couponResult = await validateCoupon(couponCode, subtotal)
            if (!couponResult.valid) {
                return { error: couponResult.error || "Invalid coupon" }
            }
            couponDiscount = couponResult.discount ?? 0
            couponId = couponResult.coupon?.id ?? null

            if (couponId) {
                await prisma.coupon.update({
                    where: { id: couponId },
                    data: { usageCount: { increment: 1 } },
                })
            }
        }

        // Handle loyalty points redemption
        const loyaltyPointsUsed = formData.get("loyaltyPointsUsed")
            ? parseInt(formData.get("loyaltyPointsUsed") as string)
            : 0
        const loyaltyDiscount = formData.get("loyaltyDiscount")
            ? parseFloat(formData.get("loyaltyDiscount") as string)
            : 0

        const totalDiscount = couponDiscount + loyaltyDiscount
        const total = Math.max(0, subtotal + shippingCost - totalDiscount)

        // Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`

        // Create shipping address string
        const shippingAddress = `${name}\n${street}\n${city}, ${state} ${postalCode}\nPhone: ${phone}`

        // Create order with new combination system
        const order = await prisma.order.create({
            data: {
                orderNumber,
                userId: session?.user?.id,
                customerName: name,
                customerEmail: email,
                customerPhone: phone,
                shippingAddress,
                status: OrderStatus.PENDING,
                subtotal,
                shippingCost,
                discount: totalDiscount,
                couponCode: couponCode || null,
                total,
                paymentMethod: paymentMethod as PaymentMethod,
                paymentStatus: paymentMethod === "COD" ? PaymentStatus.PENDING : PaymentStatus.PENDING,
                transactionId,
                notes,
                items: {
                    create: cart.items.map((item) => {
                        // Calculate the final price for this item (with discounts applied)
                        let itemPrice = item.combination?.price
                            ? parseFloat(item.combination.price.toString())
                            : parseFloat(item.product.price.toString())

                        // Apply product discount
                        if (item.product.discountType && item.product.discountValue) {
                            const discountValue = Number(item.product.discountValue)
                            const now = new Date()
                            let isDiscountValid = true

                            if (item.product.discountStartDate && now < new Date(item.product.discountStartDate)) {
                                isDiscountValid = false
                            }
                            if (item.product.discountEndDate && now > new Date(item.product.discountEndDate)) {
                                isDiscountValid = false
                            }

                            if (isDiscountValid && discountValue > 0) {
                                if (item.product.discountType === "PERCENTAGE") {
                                    itemPrice = itemPrice - (itemPrice * discountValue / 100)
                                } else if (item.product.discountType === "FIXED_AMOUNT") {
                                    itemPrice = itemPrice - discountValue
                                }
                                itemPrice = Math.max(0, itemPrice)
                            }
                        }

                        // Build variation info from combination for display purposes
                        const variationLabel = item.combination?.options
                            ?.map(o => `${o.option.variation.variationName}: ${o.option.optionName}`)
                            .join(", ") || null

                        return {
                            productId: item.product.id,
                            combinationId: item.combinationId ?? null,
                            quantity: item.quantity,
                            price: itemPrice,
                            // Store structured variation details as JSON for historical record
                            variationDetails: item.combination?.options && item.combination.options.length > 0
                                ? JSON.stringify(
                                    item.combination.options.map(o => ({
                                        type: o.option.variation.variationName,
                                        value: o.option.optionName,
                                    }))
                                )
                                : null,
                            name: item.product.name,
                            image: item.product.images[0],
                            sku: item.combination?.sku ?? item.product.sku,
                        }
                    }),
                },
                payment: {
                    create: {
                        amount: total,
                        method: paymentMethod as PaymentMethod,
                        status: PaymentStatus.PENDING,
                        transactionId,
                    },
                },
            },
        })

        // Update product stock
        for (const item of cart.items) {
            if (item.combinationId) {
                // Update stock for variant combination
                await prisma.productVariantCombination.update({
                    where: { id: item.combinationId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                })
            } else {
                // Update base product stock
                await prisma.product.update({
                    where: { id: item.product.id },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                })
            }
        }

        // Clear cart
        await clearCart()

        // Handle loyalty points
        if (session?.user?.id) {
            // Deduct used points
            if (loyaltyPointsUsed > 0) {
                await prisma.loyaltyPoints.update({
                    where: { userId: session.user.id },
                    data: {
                        points: {
                            decrement: loyaltyPointsUsed,
                        },
                    },
                })

                // Update order with points used
                await prisma.order.update({
                    where: { id: order.id },
                    data: { pointsUsed: loyaltyPointsUsed },
                })
            }

            // Award loyalty points (1 point per ৳100 spent)
            const pointsEarned = Math.floor(total / 100)

            await prisma.loyaltyPoints.upsert({
                where: { userId: session.user.id },
                create: {
                    userId: session.user.id,
                    points: pointsEarned,
                },
                update: {
                    points: {
                        increment: pointsEarned,
                    },
                },
            })

            await prisma.order.update({
                where: { id: order.id },
                data: { pointsEarned },
            })
        }

        // Track affiliate referral
        const referralCode = (formData.get("referralCode") as string | null)?.trim() || null
        let affiliateCode: string | null = null

        // Check for referral code from URL parameter
        if (referralCode) {
            const affiliate = await getAffiliateByCode(referralCode)
            if (affiliate) {
                affiliateCode = affiliate.code
            }
        }

        // If no referral code, check if coupon is linked to an affiliate
        if (!affiliateCode && couponCode) {
            const affiliate = await getAffiliateByCoupon(couponCode)
            if (affiliate) {
                affiliateCode = affiliate.code
            }
        }

        // Track affiliate order if we found an affiliate
        if (affiliateCode) {
            await trackAffiliateOrder(order.id, affiliateCode)
        }

        // Send push notification to all admins about new order
        try {
            await sendPushNotificationToAdmins({
                title: '🛒 New Order Received!',
                body: `Order #${order.orderNumber} - ${name} - ৳${total.toFixed(2)}`,
                url: `/admin/orders/${order.id}`,
                icon: '/icon-192x192.png',
                badge: '/badge-72x72.png',
                tag: `order-${order.id}`,
                data: {
                    type: 'new-order',
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                    total: total,
                },
            })
        } catch (error) {
            // Don't fail the order if notification fails
            console.error('Failed to send admin notification:', error)
        }

        revalidatePath("/orders")
        revalidatePath("/cart")

        return {
            success: true,
            orderId: order.id,
            orderNumber: order.orderNumber,
        }
    } catch (error) {
        console.error("Order creation error:", error)
        return {
            error: "Something went wrong. Please try again.",
        }
    }
}

export async function getOrders(userId?: string) {
    const session = await auth()

    if (!session?.user?.id && !userId) {
        return []
    }

    const orders = await prisma.order.findMany({
        where: {
            userId: userId || session?.user?.id,
        },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    return orders
}

export async function getOrder(orderId: string) {
    const session = await auth()

    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            OR: [
                { userId: session?.user?.id },
                // Allow viewing order if not logged in but is the customer
                { userId: null },
            ],
        },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
            payment: true,
        },
    })

    return order
}
