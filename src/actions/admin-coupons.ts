"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { DiscountType } from "@/generated/prisma/enums"

async function checkAdminAccess() {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/")
    }
    return session
}

const couponSchema = z.object({
    code: z.string().min(3, "Code must be at least 3 characters").toUpperCase(),
    description: z.string().optional(),
    discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "BUY_X_GET_Y"]),
    discountValue: z.coerce.number().positive("Discount value must be positive"),
    minPurchaseAmount: z.coerce.number().optional().nullable(),
    maxDiscountAmount: z.coerce.number().optional().nullable(),
    usageLimit: z.coerce.number().int().optional().nullable(),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
})

export async function getCoupons({
    page = 1,
    limit = 20,
    search,
    status,
}: {
    page?: number
    limit?: number
    search?: string
    status?: "active" | "inactive" | "expired" | "all"
} = {}) {
    await checkAdminAccess()

    const now = new Date()
    const where: Record<string, unknown> = {}

    if (search) {
        where.OR = [
            { code: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
        ]
    }

    if (status === "active") {
        where.isActive = true
        where.OR = [
            ...(search ? where.OR as any[] : []),
            { endDate: null },
            { endDate: { gte: now } },
        ]
    } else if (status === "inactive") {
        where.isActive = false
    } else if (status === "expired") {
        where.endDate = { lt: now }
    }

    const [coupons, total] = await Promise.all([
        prisma.coupon.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.coupon.count({ where }),
    ])

    return {
        coupons,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    }
}

export async function getCoupon(id: string) {
    await checkAdminAccess()

    return prisma.coupon.findUnique({ where: { id } })
}

export async function createCoupon(formData: FormData) {
    const session = await checkAdminAccess()

    const data = {
        code: (formData.get("code") as string).toUpperCase(),
        description: formData.get("description") as string || undefined,
        discountType: formData.get("discountType") as string,
        discountValue: parseFloat(formData.get("discountValue") as string),
        minPurchaseAmount: formData.get("minPurchaseAmount") ? parseFloat(formData.get("minPurchaseAmount") as string) : null,
        maxDiscountAmount: formData.get("maxDiscountAmount") ? parseFloat(formData.get("maxDiscountAmount") as string) : null,
        usageLimit: formData.get("usageLimit") ? parseInt(formData.get("usageLimit") as string) : null,
        startDate: formData.get("startDate") as string || null,
        endDate: formData.get("endDate") as string || null,
        isActive: formData.get("isActive") === "true",
    }

    const validated = couponSchema.safeParse(data)
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    try {
        const coupon = await prisma.coupon.create({
            data: {
                ...validated.data,
                discountType: validated.data.discountType as DiscountType,
                startDate: validated.data.startDate ? new Date(validated.data.startDate) : null,
                endDate: validated.data.endDate ? new Date(validated.data.endDate) : null,
            },
        })

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "CREATE",
                entity: "Coupon",
                entityId: coupon.id,
                changes: JSON.stringify(validated.data),
            },
        })

        revalidatePath("/admin/coupons")
        return { success: true, coupon }
    } catch (error: unknown) {
        if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
            return { error: "A coupon with this code already exists" }
        }
        return { error: "Failed to create coupon" }
    }
}

export async function updateCoupon(id: string, formData: FormData) {
    const session = await checkAdminAccess()

    const data = {
        code: (formData.get("code") as string).toUpperCase(),
        description: formData.get("description") as string || undefined,
        discountType: formData.get("discountType") as string,
        discountValue: parseFloat(formData.get("discountValue") as string),
        minPurchaseAmount: formData.get("minPurchaseAmount") ? parseFloat(formData.get("minPurchaseAmount") as string) : null,
        maxDiscountAmount: formData.get("maxDiscountAmount") ? parseFloat(formData.get("maxDiscountAmount") as string) : null,
        usageLimit: formData.get("usageLimit") ? parseInt(formData.get("usageLimit") as string) : null,
        startDate: formData.get("startDate") as string || null,
        endDate: formData.get("endDate") as string || null,
        isActive: formData.get("isActive") === "true",
    }

    const validated = couponSchema.safeParse(data)
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    try {
        const coupon = await prisma.coupon.update({
            where: { id },
            data: {
                ...validated.data,
                discountType: validated.data.discountType as DiscountType,
                startDate: validated.data.startDate ? new Date(validated.data.startDate) : null,
                endDate: validated.data.endDate ? new Date(validated.data.endDate) : null,
            },
        })

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "UPDATE",
                entity: "Coupon",
                entityId: coupon.id,
                changes: JSON.stringify(validated.data),
            },
        })

        revalidatePath("/admin/coupons")
        return { success: true, coupon }
    } catch (error: unknown) {
        if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
            return { error: "A coupon with this code already exists" }
        }
        return { error: "Failed to update coupon" }
    }
}

export async function deleteCoupon(id: string) {
    const session = await checkAdminAccess()

    try {
        const coupon = await prisma.coupon.delete({ where: { id } })

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "DELETE",
                entity: "Coupon",
                entityId: id,
                changes: JSON.stringify({ code: coupon.code }),
            },
        })

        revalidatePath("/admin/coupons")
        return { success: true }
    } catch {
        return { error: "Failed to delete coupon" }
    }
}

export async function toggleCouponStatus(id: string) {
    await checkAdminAccess()

    const coupon = await prisma.coupon.findUnique({ where: { id } })
    if (!coupon) return { error: "Coupon not found" }

    await prisma.coupon.update({
        where: { id },
        data: { isActive: !coupon.isActive },
    })

    revalidatePath("/admin/coupons")
    return { success: true }
}

// Validate and apply coupon at checkout
export async function validateCoupon(code: string, subtotal: number) {
    const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
    })

    if (!coupon) {
        return { valid: false, error: "Invalid coupon code" }
    }

    if (!coupon.isActive) {
        return { valid: false, error: "This coupon is no longer active" }
    }

    const now = new Date()
    if (coupon.startDate && coupon.startDate > now) {
        return { valid: false, error: "This coupon is not yet valid" }
    }

    if (coupon.endDate && coupon.endDate < now) {
        return { valid: false, error: "This coupon has expired" }
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return { valid: false, error: "This coupon has reached its usage limit" }
    }

    const minPurchase = coupon.minPurchaseAmount ? parseFloat(coupon.minPurchaseAmount.toString()) : 0
    if (subtotal < minPurchase) {
        return { valid: false, error: `Minimum purchase amount is ৳${minPurchase}` }
    }

    // Calculate discount
    let discount = 0
    if (coupon.discountType === "PERCENTAGE") {
        discount = subtotal * (parseFloat(coupon.discountValue.toString()) / 100)
    } else if (coupon.discountType === "FIXED_AMOUNT") {
        discount = parseFloat(coupon.discountValue.toString())
    }

    // Apply max discount limit
    const maxDiscount = coupon.maxDiscountAmount ? parseFloat(coupon.maxDiscountAmount.toString()) : Infinity
    discount = Math.min(discount, maxDiscount, subtotal)

    return {
        valid: true,
        coupon: {
            id: coupon.id,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: parseFloat(coupon.discountValue.toString()),
        },
        discount,
    }
}

export async function bulkToggleCouponStatus(ids: string[], isActive: boolean) {
    const session = await checkAdminAccess()

    if (!ids.length) return { error: "No coupons selected" }

    try {
        await prisma.coupon.updateMany({
            where: { id: { in: ids } },
            data: { isActive },
        })

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "BULK_TOGGLE_STATUS",
                entity: "Coupon",
                entityId: ids.join(","),
                changes: JSON.stringify({ isActive, count: ids.length }),
            },
        })

        revalidatePath("/admin/coupons")
        return { success: true }
    } catch {
        return { error: "Failed to update coupon status" }
    }
}

export async function bulkDeleteCoupons(ids: string[]) {
    const session = await checkAdminAccess()

    if (!ids.length) return { error: "No coupons selected" }

    try {
        await prisma.coupon.deleteMany({
            where: { id: { in: ids } },
        })

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "BULK_DELETE",
                entity: "Coupon",
                entityId: ids.join(","),
                changes: JSON.stringify({ count: ids.length }),
            },
        })

        revalidatePath("/admin/coupons")
        return { success: true }
    } catch {
        return { error: "Failed to delete coupons" }
    }
}
