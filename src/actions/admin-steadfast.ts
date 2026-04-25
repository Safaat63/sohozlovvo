"use server"

import { checkAdminAccess } from "@/actions/admin"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const STEADFAST_BASE_URL = "https://portal.packzy.com/api/v1"

// Get headers for Steadfast API
function getSteadfastHeaders() {
    const apiKey = process.env.STEADFAST_API_KEY
    const secretKey = process.env.STEADFAST_SECRET_KEY

    if (!apiKey || !secretKey) {
        throw new Error("Steadfast API credentials not configured")
    }

    return {
        "Api-Key": apiKey,
        "Secret-Key": secretKey,
        "Content-Type": "application/json",
    }
}

// Type definitions
export type SteadfastConsignment = {
    consignment_id: number
    invoice: string
    tracking_code: string
    recipient_name: string
    recipient_phone: string
    recipient_address: string
    cod_amount: number
    status: string
    note: string | null
    created_at: string
    updated_at: string
}

export type SteadfastOrderResponse = {
    status: number
    message: string
    consignment: SteadfastConsignment
}

export type SteadfastDeliveryStatus =
    | "pending"
    | "delivered_approval_pending"
    | "partial_delivered_approval_pending"
    | "cancelled_approval_pending"
    | "unknown_approval_pending"
    | "delivered"
    | "partial_delivered"
    | "cancelled"
    | "hold"
    | "in_review"
    | "unknown"

export type SteadfastStatusResponse = {
    status: number
    delivery_status: SteadfastDeliveryStatus
}

export type SteadfastBalanceResponse = {
    status: number
    current_balance: number
}

export type SteadfastReturnRequest = {
    id: number
    user_id: number
    consignment_id: number
    reason: string | null
    status: "pending" | "approved" | "processing" | "completed" | "cancelled"
    created_at: string
    updated_at: string
}

export type PoliceStation = {
    id: number
    name: string
    district_id: number
}

// Create a single order with Steadfast
export async function createSteadfastOrder(orderId: string) {
    await checkAdminAccess()

    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: true,
                items: {
                    include: { product: true },
                },
            },
        })

        if (!order) {
            return { error: "Order not found" }
        }

        // Check if already sent to Steadfast
        if (order.trackingNumber) {
            return { error: "Order already has a tracking number" }
        }

        const itemDescriptions = order.items
            .map((item) => `${item.name} x${item.quantity}`)
            .join(", ")

        const payload = {
            invoice: order.orderNumber,
            recipient_name: order.customerName || order.user?.name || "Customer",
            recipient_phone: order.customerPhone || "",
            recipient_address: order.shippingAddress || "",
            cod_amount: order.paymentMethod === "COD" ? parseFloat(order.total.toString()) : 0,
            note: order.notes || "",
            item_description: itemDescriptions,
            total_lot: order.items.reduce((sum, item) => sum + item.quantity, 0),
            delivery_type: 0, // Home delivery
        }

        const response = await fetch(`${STEADFAST_BASE_URL}/create_order`, {
            method: "POST",
            headers: getSteadfastHeaders(),
            body: JSON.stringify(payload),
        })

        const data = await response.json() as SteadfastOrderResponse

        if (data.status === 200 && data.consignment) {
            // Update order with tracking info
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    trackingNumber: data.consignment.tracking_code,
                    status: "SHIPPED",
                },
            })

            revalidatePath("/admin/steadfast")
            revalidatePath(`/admin/steadfast/${orderId}`)
            revalidatePath("/admin/orders")

            return { success: true, consignment: data.consignment }
        }

        return { error: data.message || "Failed to create Steadfast order" }
    } catch (error) {
        console.error("Steadfast create order error:", error)
        return { error: error instanceof Error ? error.message : "Failed to create order with Steadfast" }
    }
}

// Bulk create orders with Steadfast
export async function createBulkSteadfastOrders(orderIds: string[]) {
    await checkAdminAccess()

    try {
        const orders = await prisma.order.findMany({
            where: {
                id: { in: orderIds },
                trackingNumber: null, // Only orders without tracking
            },
            include: {
                user: true,
                items: {
                    include: { product: true },
                },
            },
        })

        if (orders.length === 0) {
            return { error: "No eligible orders found" }
        }

        const data = orders.map((order) => ({
            invoice: order.orderNumber,
            recipient_name: order.customerName || order.user?.name || "Customer",
            recipient_phone: order.customerPhone || "",
            recipient_address: order.shippingAddress || "",
            cod_amount: order.paymentMethod === "COD" ? parseFloat(order.total.toString()) : 0,
            note: order.notes || "",
        }))

        const response = await fetch(`${STEADFAST_BASE_URL}/create_order/bulk-order`, {
            method: "POST",
            headers: getSteadfastHeaders(),
            body: JSON.stringify({ data: JSON.stringify(data) }),
        })

        const results = await response.json()

        // Update orders with tracking codes
        const successfulOrders = Array.isArray(results)
            ? results.filter((r: { status: string; tracking_code?: string }) => r.status === "success" && r.tracking_code)
            : []

        for (const result of successfulOrders) {
            const order = orders.find((o) => o.orderNumber === result.invoice)
            if (order) {
                await prisma.order.update({
                    where: { id: order.id },
                    data: {
                        trackingNumber: result.tracking_code,
                        status: "SHIPPED",
                    },
                })
            }
        }

        revalidatePath("/admin/steadfast")
        revalidatePath("/admin/orders")

        return {
            success: true,
            results,
            successCount: successfulOrders.length,
            totalCount: orders.length,
        }
    } catch (error) {
        console.error("Steadfast bulk create error:", error)
        return { error: error instanceof Error ? error.message : "Failed to create bulk orders" }
    }
}

// Check delivery status by consignment ID
export async function checkStatusByConsignmentId(consignmentId: number) {
    await checkAdminAccess()

    try {
        const response = await fetch(`${STEADFAST_BASE_URL}/status_by_cid/${consignmentId}`, {
            method: "GET",
            headers: getSteadfastHeaders(),
        })

        const data = await response.json() as SteadfastStatusResponse

        if (data.status === 200) {
            return { success: true, deliveryStatus: data.delivery_status }
        }

        return { error: "Failed to get status" }
    } catch (error) {
        console.error("Steadfast status check error:", error)
        return { error: error instanceof Error ? error.message : "Failed to check status" }
    }
}

// Check delivery status by invoice
export async function checkStatusByInvoice(invoice: string) {
    await checkAdminAccess()

    try {
        const response = await fetch(`${STEADFAST_BASE_URL}/status_by_invoice/${encodeURIComponent(invoice)}`, {
            method: "GET",
            headers: getSteadfastHeaders(),
        })

        const data = await response.json() as SteadfastStatusResponse

        if (data.status === 200) {
            return { success: true, deliveryStatus: data.delivery_status }
        }

        return { error: "Failed to get status" }
    } catch (error) {
        console.error("Steadfast status check error:", error)
        return { error: error instanceof Error ? error.message : "Failed to check status" }
    }
}

// Check delivery status by tracking code
export async function checkStatusByTrackingCode(trackingCode: string) {
    await checkAdminAccess()

    try {
        const response = await fetch(`${STEADFAST_BASE_URL}/status_by_trackingcode/${encodeURIComponent(trackingCode)}`, {
            method: "GET",
            headers: getSteadfastHeaders(),
        })

        const data = await response.json() as SteadfastStatusResponse

        if (data.status === 200) {
            return { success: true, deliveryStatus: data.delivery_status }
        }

        return { error: "Failed to get status" }
    } catch (error) {
        console.error("Steadfast status check error:", error)
        return { error: error instanceof Error ? error.message : "Failed to check status" }
    }
}

// Get current balance
export async function getSteadfastBalance() {
    await checkAdminAccess()

    try {
        const response = await fetch(`${STEADFAST_BASE_URL}/get_balance`, {
            method: "GET",
            headers: getSteadfastHeaders(),
        })

        const data = await response.json() as SteadfastBalanceResponse

        if (data.status === 200) {
            return { success: true, balance: data.current_balance }
        }

        return { error: "Failed to get balance" }
    } catch (error) {
        console.error("Steadfast balance check error:", error)
        return { error: error instanceof Error ? error.message : "Failed to get balance" }
    }
}

// Create return request
export async function createReturnRequest(params: {
    consignmentId?: number
    invoice?: string
    trackingCode?: string
    reason?: string
}) {
    await checkAdminAccess()

    try {
        const payload: Record<string, string | number> = {}
        if (params.consignmentId) payload.consignment_id = params.consignmentId
        if (params.invoice) payload.invoice = params.invoice
        if (params.trackingCode) payload.tracking_code = params.trackingCode
        if (params.reason) payload.reason = params.reason

        const response = await fetch(`${STEADFAST_BASE_URL}/create_return_request`, {
            method: "POST",
            headers: getSteadfastHeaders(),
            body: JSON.stringify(payload),
        })

        const data = await response.json()

        if (data.id) {
            return { success: true, returnRequest: data as SteadfastReturnRequest }
        }

        return { error: data.message || "Failed to create return request" }
    } catch (error) {
        console.error("Steadfast return request error:", error)
        return { error: error instanceof Error ? error.message : "Failed to create return request" }
    }
}

// Get single return request
export async function getReturnRequest(id: number) {
    await checkAdminAccess()

    try {
        const response = await fetch(`${STEADFAST_BASE_URL}/get_return_request/${id}`, {
            method: "GET",
            headers: getSteadfastHeaders(),
        })

        const data = await response.json()
        return { success: true, returnRequest: data as SteadfastReturnRequest }
    } catch (error) {
        console.error("Steadfast get return request error:", error)
        return { error: error instanceof Error ? error.message : "Failed to get return request" }
    }
}

// Get all return requests
export async function getReturnRequests() {
    await checkAdminAccess()

    try {
        const response = await fetch(`${STEADFAST_BASE_URL}/get_return_requests`, {
            method: "GET",
            headers: getSteadfastHeaders(),
        })

        const data = await response.json()
        return { success: true, returnRequests: data as SteadfastReturnRequest[] }
    } catch (error) {
        console.error("Steadfast get return requests error:", error)
        return { error: error instanceof Error ? error.message : "Failed to get return requests" }
    }
}

// Get payments
export async function getSteadfastPayments() {
    await checkAdminAccess()

    try {
        const response = await fetch(`${STEADFAST_BASE_URL}/payments`, {
            method: "GET",
            headers: getSteadfastHeaders(),
        })

        const data = await response.json()
        return { success: true, payments: data }
    } catch (error) {
        console.error("Steadfast get payments error:", error)
        return { error: error instanceof Error ? error.message : "Failed to get payments" }
    }
}

// Get single payment with consignments
export async function getSteadfastPayment(paymentId: number) {
    await checkAdminAccess()

    try {
        const response = await fetch(`${STEADFAST_BASE_URL}/payments/${paymentId}`, {
            method: "GET",
            headers: getSteadfastHeaders(),
        })

        const data = await response.json()
        return { success: true, payment: data }
    } catch (error) {
        console.error("Steadfast get payment error:", error)
        return { error: error instanceof Error ? error.message : "Failed to get payment" }
    }
}

// Get police stations
export async function getPoliceStations() {
    await checkAdminAccess()

    try {
        const response = await fetch(`${STEADFAST_BASE_URL}/police_stations`, {
            method: "GET",
            headers: getSteadfastHeaders(),
        })

        const data = await response.json()
        return { success: true, policeStations: data as PoliceStation[] }
    } catch (error) {
        console.error("Steadfast get police stations error:", error)
        return { error: error instanceof Error ? error.message : "Failed to get police stations" }
    }
}
import { OrderStatus } from "@/generated/prisma/enums"

// Get orders for Steadfast page
export async function getOrdersForSteadfast(params: {
    page?: number
    limit?: number
    status?: string
    hasTracking?: boolean
}) {
    await checkAdminAccess()

    const page = params.page || 1
    const limit = params.limit || 20
    const skip = (page - 1) * limit

    const where: {
        status?: OrderStatus
        trackingNumber?: { not: null } | null
    } = {}

    if (params.status && Object.values(OrderStatus).includes(params.status as OrderStatus)) {
        where.status = params.status as OrderStatus
    }

    if (params.hasTracking === true) {
        where.trackingNumber = { not: null }
    } else if (params.hasTracking === false) {
        where.trackingNumber = null
    }

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            include: {
                user: { select: { name: true, email: true } },
                items: { include: { product: true } },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.order.count({ where }),
    ])

    // Serialize Decimal values to strings for client components
    const serializedOrders = orders.map((order) => ({
        ...order,
        subtotal: order.subtotal.toString(),
        shippingCost: order.shippingCost.toString(),
        tax: order.tax.toString(),
        discount: order.discount.toString(),
        total: order.total.toString(),
        items: order.items.map((item) => ({
            ...item,
            price: item.price.toString(),
            product: {
                ...item.product,
                price: item.product.price.toString(),
                compareAtPrice: item.product.compareAtPrice?.toString() || null,
                costPrice: item.product.costPrice?.toString() || null,
                rating: item.product.rating.toString(),
                discountValue: item.product.discountValue?.toString() || null,
            },
        })),
    }))

    return {
        orders: serializedOrders,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    }
}

// Get single order for Steadfast detail page
export async function getOrderForSteadfast(orderId: string) {
    await checkAdminAccess()

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            user: true,
            items: { include: { product: true } },
        },
    })

    if (!order) return null

    // Serialize Decimal values to strings for client components
    return {
        ...order,
        subtotal: order.subtotal.toString(),
        shippingCost: order.shippingCost.toString(),
        tax: order.tax.toString(),
        discount: order.discount.toString(),
        total: order.total.toString(),
        items: order.items.map((item) => ({
            ...item,
            price: item.price.toString(),
            product: {
                ...item.product,
                price: item.product.price.toString(),
                compareAtPrice: item.product.compareAtPrice?.toString() || null,
                costPrice: item.product.costPrice?.toString() || null,
                rating: item.product.rating.toString(),
                discountValue: item.product.discountValue?.toString() || null,
            },
        })),
    }
}
