"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { notifyStockAlerts } from "@/actions/stock-alerts"

async function checkAdminAccess() {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/")
    }
    return session
}

// Helper to serialize Decimal fields to numbers for client components
function serializeProduct(product: any) {
    return {
        ...product,
        price: product.price ? Number(product.price) : 0,
        compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
        costPrice: product.costPrice ? Number(product.costPrice) : null,
        weight: product.weight ? Number(product.weight) : null,
        rating: product.rating ? Number(product.rating) : 0,
        discountValue: product.discountValue ? Number(product.discountValue) : null,
    }
}

const productSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    slug: z.string().min(2, "Slug must be at least 2 characters"),
    description: z.string().optional(),
    price: z.coerce.number().positive("Price must be positive"),
    compareAtPrice: z.coerce.number().optional().nullable(),
    costPrice: z.coerce.number().optional().nullable(),
    sku: z.string().optional().nullable(),
    stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
    lowStockAlert: z.coerce.number().int().min(0).default(10),
    brand: z.string().optional().nullable(),
    categoryId: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    images: z.array(z.string()).default([]),
    discountType: z.string().optional().nullable(),
    discountValue: z.coerce.number().optional().nullable(),
    discountStartDate: z.date().optional().nullable(),
    discountEndDate: z.date().optional().nullable(),
})

export async function getAdminProducts({
    page = 1,
    limit = 20,
    search,
    categoryId,
    status,
}: {
    page?: number
    limit?: number
    search?: string
    categoryId?: string
    status?: "active" | "inactive" | "all"
} = {}) {
    await checkAdminAccess()

    const where: Record<string, unknown> = {}

    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { sku: { contains: search, mode: "insensitive" } },
        ]
    }

    if (categoryId) {
        where.categoryId = categoryId
    }

    if (status === "active") {
        where.isActive = true
    } else if (status === "inactive") {
        where.isActive = false
    }

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            include: {
                category: true,
                _count: {
                    select: { orderItems: true, reviews: true },
                },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.product.count({ where }),
    ])

    // Serialize Decimal fields
    const serializedProducts = products.map((product) => ({
        ...product,
        price: product.price.toString(),
        compareAtPrice: product.compareAtPrice?.toString() || null,
        costPrice: product.costPrice?.toString() || null,
        rating: product.rating.toString(),
        discountValue: product.discountValue?.toString() || null,
    }))

    return {
        products: serializedProducts,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    }
}

export async function getAdminProduct(id: string) {
    await checkAdminAccess()

    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            category: true,
            specifications: true,
            variations: {
                include: {
                    options: true,
                },
            },
            combinations: {
                include: {
                    options: {
                        include: {
                            option: true,
                        },
                    },
                },
            },
        },
    })

    if (!product) return null

    // Serialize Decimal fields to plain JS values for the client
    return {
        ...product,
        price: product.price.toString(),
        compareAtPrice: product.compareAtPrice?.toString() || null,
        costPrice: product.costPrice?.toString() || null,
        weight: product.weight?.toString() || null,
        rating: product.rating.toString(),
        discountValue: product.discountValue?.toString() || null,
        variations: product.variations.map((v) => ({
            ...v,
            options: v.options.map((o) => ({
                id: o.id,
                optionName: o.optionName,
                isActive: o.isActive,
                image: o.image || null,
                hexCode: o.hexCode || null,
            })),
        })),
        combinations: product.combinations.map((c) => ({
            id: c.id,
            sku: c.sku,
            stock: c.stock,
            price: c.price?.toString() || null,
            isActive: c.isActive,
            options: c.options.map((o) => ({
                optionId: o.optionId,
            })),
        })),
    }
}

export async function createProduct(formData: FormData) {
    const session = await checkAdminAccess()

    const data = {
        name: formData.get("name") as string,
        slug: formData.get("slug") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        compareAtPrice: formData.get("compareAtPrice") ? parseFloat(formData.get("compareAtPrice") as string) : null,
        costPrice: formData.get("costPrice") ? parseFloat(formData.get("costPrice") as string) : null,
        sku: formData.get("sku") as string || null,
        stock: parseInt(formData.get("stock") as string) || 0,
        lowStockAlert: parseInt(formData.get("lowStockAlert") as string) || 10,
        brand: formData.get("brand") as string || null,
        categoryId: formData.get("categoryId") as string || null,
        isActive: formData.get("isActive") === "true",
        isFeatured: formData.get("isFeatured") === "true",
        images: JSON.parse(formData.get("images") as string || "[]"),
        discountType: formData.get("discountType") as string || null,
        discountValue: formData.get("discountValue") ? parseFloat(formData.get("discountValue") as string) : null,
        discountStartDate: formData.get("discountStartDate") ? new Date(formData.get("discountStartDate") as string) : null,
        discountEndDate: formData.get("discountEndDate") ? new Date(formData.get("discountEndDate") as string) : null,
    }

    const validated = productSchema.safeParse(data)
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    try {
        const variationsData = formData.get("variations")
        const variations = variationsData ? JSON.parse(variationsData as string) : []
        const combinationsData = formData.get("combinations")
        const combinationsInput = combinationsData ? JSON.parse(combinationsData as string) : []

        // Prepare product data with proper type conversions
        const productData: any = {
            name: validated.data.name,
            slug: validated.data.slug,
            description: validated.data.description,
            price: validated.data.price,
            compareAtPrice: validated.data.compareAtPrice,
            costPrice: validated.data.costPrice,
            sku: validated.data.sku,
            stock: validated.data.stock,
            lowStockAlert: validated.data.lowStockAlert,
            brand: validated.data.brand,
            categoryId: validated.data.categoryId,
            isActive: validated.data.isActive,
            isFeatured: validated.data.isFeatured,
            images: validated.data.images,
        }

        // Add discount fields if they exist and are valid
        if (validated.data.discountType &&
            validated.data.discountType !== "" &&
            validated.data.discountType !== "none" &&
            (validated.data.discountType === "PERCENTAGE" || validated.data.discountType === "FIXED_AMOUNT")) {
            productData.discountType = validated.data.discountType
            productData.discountValue = validated.data.discountValue
            productData.discountStartDate = validated.data.discountStartDate
            productData.discountEndDate = validated.data.discountEndDate
        }

        // Create product with variations
        const product = await prisma.product.create({
            data: {
                ...productData,
                variations: {
                    create: variations.map((v: { variationName: string; options: { optionName: string; isActive?: boolean; image?: string | null; hexCode?: string | null }[] }) => ({
                        variationName: v.variationName,
                        options: {
                            create: v.options.map((o: { optionName: string; isActive?: boolean; image?: string | null; hexCode?: string | null }) => ({
                                optionName: o.optionName,
                                isActive: o.isActive ?? true,
                                image: o.image || null,
                                hexCode: o.hexCode || null,
                            })),
                        },
                    })),
                },
            },
            include: {
                variations: {
                    include: {
                        options: true,
                    },
                },
            },
        })

        // Create combinations if provided
        if (combinationsInput.length > 0 && product.variations.length > 0) {
            // Build a map of optionName -> optionId for quick lookup
            const optionNameToId: Record<string, string> = {}
            for (const variation of product.variations) {
                for (const option of variation.options) {
                    optionNameToId[option.optionName] = option.id
                }
            }

            // Create each combination
            for (const comboInput of combinationsInput) {
                // comboInput.optionNames contains the option names for this combination
                const optionNames: string[] = comboInput.optionNames || []
                const realOptionIds = optionNames
                    .map((name: string) => optionNameToId[name])
                    .filter((id: string | undefined): id is string => !!id)

                if (realOptionIds.length > 0) {
                    await prisma.productVariantCombination.create({
                        data: {
                            productId: product.id,
                            price: comboInput.price,
                            stock: comboInput.stock || 0,
                            sku: comboInput.sku,
                            isActive: comboInput.isActive ?? true,
                            options: {
                                create: realOptionIds.map((optionId: string) => ({
                                    optionId,
                                })),
                            },
                        },
                    })
                }
            }
        }

        // Log action - wrapped in try-catch to not block product creation
        try {
            if (session.user.id) {
                await prisma.auditLog.create({
                    data: {
                        userId: session.user.id,
                        action: "CREATE",
                        entity: "Product",
                        entityId: product.id,
                        changes: JSON.stringify(validated.data),
                    },
                })
            }
        } catch (auditError) {
            console.error("Failed to create audit log:", auditError)
            // Don't throw - product was created successfully
        }

        revalidatePath("/admin/products")
        revalidatePath("/products")
        return { success: true, product: serializeProduct(product) }
    } catch (error: unknown) {
        console.error("Product creation error:", error)
        if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
            return { error: "A product with this slug or SKU already exists" }
        }
        return { error: "Failed to create product" }
    }
}

export async function updateProduct(id: string, formData: FormData) {
    const session = await checkAdminAccess()

    const existingProduct = await prisma.product.findUnique({
        where: { id },
        select: { stock: true },
    })

    const data = {
        name: formData.get("name") as string,
        slug: formData.get("slug") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        compareAtPrice: formData.get("compareAtPrice") ? parseFloat(formData.get("compareAtPrice") as string) : null,
        costPrice: formData.get("costPrice") ? parseFloat(formData.get("costPrice") as string) : null,
        sku: formData.get("sku") as string || null,
        stock: parseInt(formData.get("stock") as string) || 0,
        lowStockAlert: parseInt(formData.get("lowStockAlert") as string) || 10,
        brand: formData.get("brand") as string || null,
        categoryId: formData.get("categoryId") as string || null,
        isActive: formData.get("isActive") === "true",
        isFeatured: formData.get("isFeatured") === "true",
        images: JSON.parse(formData.get("images") as string || "[]"),
        discountType: formData.get("discountType") as string || null,
        discountValue: formData.get("discountValue") ? parseFloat(formData.get("discountValue") as string) : null,
        discountStartDate: formData.get("discountStartDate") ? new Date(formData.get("discountStartDate") as string) : null,
        discountEndDate: formData.get("discountEndDate") ? new Date(formData.get("discountEndDate") as string) : null,
    }

    const validated = productSchema.safeParse(data)
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    try {
        const variationsData = formData.get("variations")
        const variations = variationsData ? JSON.parse(variationsData as string) : []
        const combinationsData = formData.get("combinations")
        const combinationsInput = combinationsData ? JSON.parse(combinationsData as string) : []

        // Delete existing variations, options, and combinations (cascade delete)
        await prisma.productVariantCombination.deleteMany({
            where: { productId: id },
        })
        await prisma.productVariation.deleteMany({
            where: { productId: id },
        })

        // Prepare product data with proper type conversions
        const productData: any = {
            name: validated.data.name,
            slug: validated.data.slug,
            description: validated.data.description,
            price: validated.data.price,
            compareAtPrice: validated.data.compareAtPrice,
            costPrice: validated.data.costPrice,
            sku: validated.data.sku,
            stock: validated.data.stock,
            lowStockAlert: validated.data.lowStockAlert,
            brand: validated.data.brand,
            categoryId: validated.data.categoryId,
            isActive: validated.data.isActive,
            isFeatured: validated.data.isFeatured,
            images: validated.data.images,
        }

        // Add discount fields if they exist and are valid
        if (validated.data.discountType &&
            validated.data.discountType !== "" &&
            validated.data.discountType !== "none" &&
            (validated.data.discountType === "PERCENTAGE" || validated.data.discountType === "FIXED_AMOUNT")) {
            productData.discountType = validated.data.discountType
            productData.discountValue = validated.data.discountValue
            productData.discountStartDate = validated.data.discountStartDate
            productData.discountEndDate = validated.data.discountEndDate
        } else {
            // Clear discount fields if no discount type is selected
            productData.discountType = null
            productData.discountValue = null
            productData.discountStartDate = null
            productData.discountEndDate = null
        }

        const product = await prisma.product.update({
            where: { id },
            data: {
                ...productData,
                variations: {
                    create: variations.map((v: { variationName: string; options: { optionName: string; isActive?: boolean; image?: string | null; hexCode?: string | null }[] }) => ({
                        variationName: v.variationName,
                        options: {
                            create: v.options.map((o: { optionName: string; isActive?: boolean; image?: string | null; hexCode?: string | null }) => ({
                                optionName: o.optionName,
                                isActive: o.isActive ?? true,
                                image: o.image || null,
                                hexCode: o.hexCode || null,
                            })),
                        },
                    })),
                },
            },
            include: {
                variations: {
                    include: {
                        options: true,
                    },
                },
            },
        })

        // Create combinations if provided
        if (combinationsInput.length > 0 && product.variations.length > 0) {
            // Build a map of optionName -> optionId for quick lookup
            const optionNameToId: Record<string, string> = {}
            for (const variation of product.variations) {
                for (const option of variation.options) {
                    optionNameToId[option.optionName] = option.id
                }
            }

            // Create each combination
            for (const comboInput of combinationsInput) {
                const optionNames: string[] = comboInput.optionNames || []
                const realOptionIds = optionNames
                    .map((name: string) => optionNameToId[name])
                    .filter((id: string | undefined): id is string => !!id)

                if (realOptionIds.length > 0) {
                    await prisma.productVariantCombination.create({
                        data: {
                            productId: product.id,
                            price: comboInput.price,
                            stock: comboInput.stock || 0,
                            sku: comboInput.sku,
                            isActive: comboInput.isActive ?? true,
                            options: {
                                create: realOptionIds.map((optionId: string) => ({
                                    optionId,
                                })),
                            },
                        },
                    })
                }
            }
        }

        // Trigger stock alert notifications when restocked from zero
        if ((existingProduct?.stock ?? 0) <= 0 && validated.data.stock > 0) {
            await notifyStockAlerts(product.id)
        }

        // Log action - wrapped in try-catch to not block product update
        try {
            if (session.user.id) {
                await prisma.auditLog.create({
                    data: {
                        userId: session.user.id,
                        action: "UPDATE",
                        entity: "Product",
                        entityId: product.id,
                        changes: JSON.stringify(validated.data),
                    },
                })
            }
        } catch (auditError) {
            console.error("Failed to create audit log:", auditError)
        }

        revalidatePath("/admin/products")
        revalidatePath("/products")
        revalidatePath(`/products/${product.slug}`)
        return { success: true, product: serializeProduct(product) }
    } catch (error: unknown) {
        if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
            return { error: "A product with this slug or SKU already exists" }
        }
        return { error: "Failed to update product" }
    }
}

export async function deleteProduct(id: string) {
    const session = await checkAdminAccess()

    try {
        const product = await prisma.product.delete({
            where: { id },
        })

        // Log action - wrapped in try-catch to not block product deletion
        try {
            if (session.user.id) {
                await prisma.auditLog.create({
                    data: {
                        userId: session.user.id,
                        action: "DELETE",
                        entity: "Product",
                        entityId: id,
                        changes: JSON.stringify({ name: product.name }),
                    },
                })
            }
        } catch (auditError) {
            console.error("Failed to create audit log:", auditError)
        }

        revalidatePath("/admin/products")
        revalidatePath("/products")
        return { success: true }
    } catch {
        return { error: "Failed to delete product" }
    }
}

export async function toggleProductStatus(id: string) {
    await checkAdminAccess()

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return { error: "Product not found" }

    await prisma.product.update({
        where: { id },
        data: { isActive: !product.isActive },
    })

    revalidatePath("/admin/products")
    return { success: true }
}

export async function bulkToggleProductStatus(ids: string[], makeActive: boolean) {
    await checkAdminAccess()
    if (!ids.length) return { error: "No products selected" }

    await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: { isActive: makeActive },
    })

    revalidatePath("/admin/products")
    return { success: true }
}

export async function bulkDeleteProducts(ids: string[]) {
    await checkAdminAccess()
    if (!ids.length) return { error: "No products selected" }

    try {
        await prisma.product.deleteMany({ where: { id: { in: ids } } })
        revalidatePath("/admin/products")
        revalidatePath("/products")
        return { success: true }
    } catch {
        return { error: "Failed to delete products" }
    }
}
