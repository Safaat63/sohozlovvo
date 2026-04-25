"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

async function checkAdminAccess() {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/")
    }
    return session
}

const flashSaleSchema = z.object({
    productId: z.string().min(1, "Product is required"),
    salePrice: z.coerce.number().positive("Sale price must be positive"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    stockLimit: z.coerce.number().int().min(0).optional().nullable(),
    isActive: z.boolean().default(true),
})

export async function getFlashSales({
    page = 1,
    limit = 20,
    status,
}: {
    page?: number
    limit?: number
    status?: "active" | "upcoming" | "ended" | "all"
} = {}) {
    await checkAdminAccess()

    const now = new Date()
    const where: Record<string, unknown> = {}

    if (status === "active") {
        where.isActive = true
        where.startDate = { lte: now }
        where.endDate = { gte: now }
    } else if (status === "upcoming") {
        where.startDate = { gt: now }
    } else if (status === "ended") {
        where.endDate = { lt: now }
    }

    const [flashSales, total] = await Promise.all([
        prisma.flashSale.findMany({
            where,
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        price: true,
                        images: true,
                        stock: true,
                    },
                },
            },
            orderBy: { startDate: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.flashSale.count({ where }),
    ])

    return {
        flashSales: flashSales.map((fs) => ({
            ...fs,
            salePrice: fs.salePrice.toString(),
            product: {
                ...fs.product,
                price: fs.product.price.toString(),
            },
        })),
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    }
}

export async function getFlashSale(id: string) {
    await checkAdminAccess()

    const flashSale = await prisma.flashSale.findUnique({
        where: { id },
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    price: true,
                    images: true,
                },
            },
        },
    })

    if (!flashSale) return null

    return {
        ...flashSale,
        salePrice: flashSale.salePrice.toString(),
        product: {
            ...flashSale.product,
            price: flashSale.product.price.toString(),
        },
    }
}

export async function createFlashSale(formData: FormData) {
    const session = await checkAdminAccess()

    const data = {
        productId: formData.get("productId") as string,
        salePrice: parseFloat(formData.get("salePrice") as string),
        startDate: new Date(formData.get("startDate") as string),
        endDate: new Date(formData.get("endDate") as string),
        stockLimit: formData.get("stockLimit") ? parseInt(formData.get("stockLimit") as string) : null,
        isActive: formData.get("isActive") === "true",
    }

    const validated = flashSaleSchema.safeParse(data)
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    if (validated.data.endDate <= validated.data.startDate) {
        return { error: "End date must be after start date" }
    }

    // Check for overlapping flash sales on the same product
    const existing = await prisma.flashSale.findFirst({
        where: {
            productId: validated.data.productId,
            OR: [
                {
                    startDate: { lte: validated.data.endDate },
                    endDate: { gte: validated.data.startDate },
                },
            ],
        },
    })

    if (existing) {
        return { error: "Product already has a flash sale during this period" }
    }

    try {
        const flashSale = await prisma.flashSale.create({
            data: validated.data,
        })

        // Try to create audit log, but don't fail if user ID doesn't exist
        try {
            await prisma.auditLog.create({
                data: {
                    userId: session.user.id,
                    action: "CREATE_FLASH_SALE",
                    entity: "FlashSale",
                    entityId: flashSale.id,
                },
            })
        } catch (error) {
            console.error("Failed to create audit log:", error)
        }

        revalidatePath("/admin/flash-sales")
        return { success: true, id: flashSale.id }
    } catch {
        return { error: "Failed to create flash sale" }
    }
}

export async function updateFlashSale(id: string, formData: FormData) {
    const session = await checkAdminAccess()

    const data = {
        productId: formData.get("productId") as string,
        salePrice: parseFloat(formData.get("salePrice") as string),
        startDate: new Date(formData.get("startDate") as string),
        endDate: new Date(formData.get("endDate") as string),
        stockLimit: formData.get("stockLimit") ? parseInt(formData.get("stockLimit") as string) : null,
        isActive: formData.get("isActive") === "true",
    }

    const validated = flashSaleSchema.safeParse(data)
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    if (validated.data.endDate <= validated.data.startDate) {
        return { error: "End date must be after start date" }
    }

    // Check for overlapping flash sales (excluding current one)
    const existing = await prisma.flashSale.findFirst({
        where: {
            productId: validated.data.productId,
            id: { not: id },
            OR: [
                {
                    startDate: { lte: validated.data.endDate },
                    endDate: { gte: validated.data.startDate },
                },
            ],
        },
    })

    if (existing) {
        return { error: "Product already has a flash sale during this period" }
    }

    try {
        await prisma.flashSale.update({
            where: { id },
            data: validated.data,
        })

        // Try to create audit log, but don't fail if user ID doesn't exist
        try {
            await prisma.auditLog.create({
                data: {
                    userId: session.user.id,
                    action: "UPDATE_FLASH_SALE",
                    entity: "FlashSale",
                    entityId: id,
                },
            })
        } catch (error) {
            console.error("Failed to create audit log:", error)
        }

        revalidatePath("/admin/flash-sales")
        return { success: true }
    } catch {
        return { error: "Failed to update flash sale" }
    }
}

export async function deleteFlashSale(id: string) {
    const session = await checkAdminAccess()

    try {
        await prisma.flashSale.delete({
            where: { id },
        })

        // Try to create audit log, but don't fail if user ID doesn't exist
        try {
            await prisma.auditLog.create({
                data: {
                    userId: session.user.id,
                    action: "DELETE_FLASH_SALE",
                    entity: "FlashSale",
                    entityId: id,
                },
            })
        } catch (error) {
            console.error("Failed to create audit log:", error)
        }

        revalidatePath("/admin/flash-sales")
        return { success: true }
    } catch {
        return { error: "Failed to delete flash sale" }
    }
}

export async function toggleFlashSale(id: string, isActive: boolean) {
    const session = await checkAdminAccess()

    await prisma.flashSale.update({
        where: { id },
        data: { isActive },
    })

    // Try to create audit log, but don't fail if user ID doesn't exist
    try {
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: isActive ? "ACTIVATE_FLASH_SALE" : "DEACTIVATE_FLASH_SALE",
                entity: "FlashSale",
                entityId: id,
            },
        })
    } catch (error) {
        console.error("Failed to create audit log:", error)
    }

    revalidatePath("/admin/flash-sales")
    return { success: true }
}

export async function getProductsForFlashSale() {
    await checkAdminAccess()

    const products = await prisma.product.findMany({
        where: { isActive: true },
        select: {
            id: true,
            name: true,
            price: true,
            images: true,
        },
        orderBy: { name: "asc" },
    })

    return products.map((p) => ({
        ...p,
        price: p.price.toString(),
    }))
}
