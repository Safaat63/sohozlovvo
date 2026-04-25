"use server"

import { prisma } from "@/lib/prisma"
import { parseVariationDetails } from "@/lib/variant-utils"

type Variation = { type: string; value: string }

type TrackingItem = {
    id: string
    name: string
    variationDetails: string | null
    quantity: number
    price: number
    image: string | null
    variations: Variation[]
    variationText: string
}

type TrackingData = {
    orderNumber: string
    status: string
    paymentStatus: string
    trackingNumber: string | null
    items: TrackingItem[]
}

export async function getOrderTracking(orderNumber: string): Promise<{ data?: TrackingData; error?: string }> {
    if (!orderNumber || !orderNumber.trim()) {
        return { error: "Order number is required" }
    }

    try {
        const order = await prisma.order.findFirst({
            where: { orderNumber: orderNumber.trim() },
            select: {
                orderNumber: true,
                status: true,
                paymentStatus: true,
                trackingNumber: true,
                items: {
                    select: {
                        id: true,
                        name: true,
                        variationDetails: true,
                        quantity: true,
                        price: true,
                        image: true,
                    },
                },
            },
        })

        if (!order) {
            return { error: "Order not found" }
        }

        const items = order.items.map((item) => {
            const variations = item.variationDetails ? parseVariationDetails(item.variationDetails) : []
            const variationText = variations.length
                ? variations.map((v) => `${v.type}: ${v.value}`).join(", ")
                : ""

            return {
                id: item.id,
                name: item.name,
                variationDetails: item.variationDetails,
                quantity: item.quantity,
                price: parseFloat(item.price.toString()),
                image: item.image,
                variations,
                variationText,
            }
        })

        return {
            data: {
                orderNumber: order.orderNumber,
                status: order.status,
                paymentStatus: order.paymentStatus,
                trackingNumber: order.trackingNumber,
                items,
            },
        }
    } catch (error) {
        console.error("Error fetching order tracking:", error)
        return { error: "Failed to fetch order details" }
    }
}
