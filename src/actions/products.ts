"use server"

import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/generated/prisma/client"

export async function getProducts(params?: {
    categoryId?: string
    categorySlug?: string
    search?: string
    minPrice?: number
    maxPrice?: number
    brand?: string
    rating?: number
    inStock?: boolean
    hasDiscount?: boolean
    page?: number
    limit?: number
    sortBy?: "price_asc" | "price_desc" | "rating" | "newest"
}) {
    const {
        categoryId,
        categorySlug,
        search,
        minPrice,
        maxPrice,
        brand,
        rating,
        inStock,
        hasDiscount,
        page = 1,
        limit = 12,
        sortBy = "newest",
    } = params || {}

    const where: Prisma.ProductWhereInput = {
        isActive: true,
    }

    // Convert category slug to ID if provided
    let resolvedCategoryId = categoryId
    if (categorySlug && !categoryId) {
        const category = await prisma.category.findUnique({
            where: { slug: categorySlug },
            select: { id: true },
        })
        if (category) {
            resolvedCategoryId = category.id
        }
    }

    if (resolvedCategoryId) {
        where.categoryId = resolvedCategoryId
    }

    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { brand: { contains: search, mode: "insensitive" } },
        ]
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {}
        if (minPrice !== undefined) where.price.gte = minPrice
        if (maxPrice !== undefined) where.price.lte = maxPrice
    }

    if (brand) {
        where.brand = brand
    }

    if (rating !== undefined) {
        where.rating = { gte: rating }
    }

    if (inStock) {
        where.stock = { gt: 0 }
    }

    if (hasDiscount) {
        // Filter products that have either:
        // 1. An active flash sale
        // 2. A valid discount (with discountType, discountValue, and within date range)
        const now = new Date()
        where.OR = [
            // Has active flash sale
            {
                flashSales: {
                    some: {
                        isActive: true,
                        startDate: { lte: now },
                        endDate: { gte: now },
                    },
                },
            },
            // Has valid discount
            {
                AND: [
                    { discountType: { not: null } },
                    { discountValue: { not: null, gt: 0 } },
                    {
                        OR: [
                            // No date restrictions
                            {
                                AND: [
                                    { discountStartDate: null },
                                    { discountEndDate: null },
                                ],
                            },
                            // Within date range
                            {
                                AND: [
                                    { discountStartDate: { lte: now } },
                                    { discountEndDate: { gte: now } },
                                ],
                            },
                        ],
                    },
                ],
            },
        ]
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = {}
    switch (sortBy) {
        case "price_asc":
            orderBy = { price: "asc" }
            break
        case "price_desc":
            orderBy = { price: "desc" }
            break
        case "rating":
            orderBy = { rating: "desc" }
            break
        default:
            orderBy = { createdAt: "desc" }
    }

    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            include: {
                category: true,
                flashSales: {
                    select: {
                        id: true,
                        salePrice: true, startDate: true,
                        endDate: true,
                        isActive: true,
                    },
                },
                variations: {
                    include: {
                        options: {
                            select: {
                                id: true,
                                optionName: true,
                                isActive: true,
                            },
                        },
                    },
                },
            },
            orderBy,
            skip,
            take: limit,
        }),
        prisma.product.count({ where }),
    ])

    return {
        products,
        pagination: {
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
            limit,
        },
    }
}

// Normalize Prisma Decimal-like values to plain numbers so they can be passed to client components safely.
function toPlainNumber(value: any): number {
    if (value === null || value === undefined) return value
    return typeof value === "object" && "toNumber" in value ? value.toNumber() : Number(value)
}

function serializeProductForClient(product: any) {
    return {
        ...product,
        price: toPlainNumber(product.price),
        compareAtPrice: product.compareAtPrice !== null && product.compareAtPrice !== undefined
            ? toPlainNumber(product.compareAtPrice)
            : null,
        costPrice: product.costPrice !== null && product.costPrice !== undefined
            ? toPlainNumber(product.costPrice)
            : null,
        weight: product.weight !== null && product.weight !== undefined
            ? toPlainNumber(product.weight)
            : null,
        rating: product.rating !== null && product.rating !== undefined
            ? toPlainNumber(product.rating)
            : null,
        discountValue: product.discountValue !== null && product.discountValue !== undefined
            ? toPlainNumber(product.discountValue)
            : null,
        flashSales: product.flashSales?.map((fs: any) => ({
            ...fs,
            salePrice: toPlainNumber(fs.salePrice),
        })),
        variations: product.variations?.map((v: any) => ({
            ...v,
            options: v.options,
        })),
    }
}

export async function getProduct(slugOrId: string) {
    const product = await prisma.product.findFirst({
        where: {
            OR: [{ slug: slugOrId }, { id: slugOrId }],
            isActive: true,
        },
        include: {
            category: true,
            reviews: {
                where: {
                    isVerified: true,
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            image: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 10,
            },
            flashSales: {
                where: {
                    isActive: true,
                    startDate: { lte: new Date() },
                    endDate: { gte: new Date() },
                },
            },
            specifications: true,
            variations: {
                include: {
                    options: {
                        select: {
                            id: true,
                            optionName: true,
                            isActive: true,
                            image: true,
                            hexCode: true,
                        },
                    },
                },
            },
            // Include variant combinations with their options
            combinations: {
                where: {
                    isActive: true,
                },
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
    })

    return product
}

export async function getFeaturedProducts(limit = 8) {
    // First try to get featured products
    let products = await prisma.product.findMany({
        where: {
            isActive: true,
            isFeatured: true,
        },
        include: {
            category: true,
            variations: {
                include: {
                    options: {
                        select: {
                            id: true,
                            optionName: true,
                            isActive: true,
                        },
                    },
                },
            },
            flashSales: {
                select: {
                    id: true,
                    salePrice: true, startDate: true,
                    endDate: true,
                    isActive: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: limit,
    })

    // If no featured products, get latest active products instead
    if (products.length === 0) {
        products = await prisma.product.findMany({
            where: {
                isActive: true,
            },
            include: {
                category: true,
                variations: {
                    include: {
                        options: {
                            select: {
                                id: true,
                                optionName: true,
                                isActive: true,
                                hexCode: true,
                            },
                        },
                    },
                },
                flashSales: {
                    select: {
                        id: true,
                        salePrice: true, startDate: true,
                        endDate: true,
                        isActive: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: limit,
        })
    }

    return products
}

export async function getCategories() {
    const categories = await prisma.category.findMany({
        where: {
            isActive: true,
        },
        include: {
            children: {
                where: {
                    isActive: true,
                },
                orderBy: {
                    name: "asc",
                },
            },
            _count: {
                select: {
                    products: true,
                },
            },
        },
        orderBy: {
            name: "asc",
        },
    })

    return categories
}

export async function getBrands() {
    const brands = await prisma.product.findMany({
        where: {
            isActive: true,
            brand: {
                not: null,
            },
        },
        select: {
            brand: true,
        },
        distinct: ["brand"],
        orderBy: {
            brand: "asc",
        },
    })

    return brands.map((b) => b.brand).filter(Boolean)
}

export async function getRecentProducts(limit: number = 8) {
    const products = await prisma.product.findMany({
        where: {
            isActive: true,
        },
        include: {
            category: true,
            flashSales: {
                select: {
                    id: true,
                    salePrice: true, startDate: true,
                    endDate: true,
                    isActive: true,
                },
            },
            variations: {
                include: {
                    options: {
                        select: {
                            id: true,
                            optionName: true,
                            isActive: true,
                            hexCode: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: limit,
    })

    // Serialize Decimal fields
    return products.map(serializeProductForClient)
}

export async function getProductTotalSold(productId: string): Promise<number> {
    const result = await prisma.orderItem.aggregate({
        where: {
            productId,
            order: {
                status: {
                    in: ["DELIVERED", "PROCESSING", "SHIPPED"],
                },
            },
        },
        _sum: {
            quantity: true,
        },
    })

    return result._sum.quantity || 0
}

export async function getProductsWithActiveDiscounts(limit: number = 8) {
    const now = new Date()

    const products = await prisma.product.findMany({
        where: {
            isActive: true,
            discountType: {
                not: null,
            },
            discountValue: {
                not: null,
                gt: 0,
            },
            OR: [
                {
                    AND: [
                        { discountStartDate: { lte: now } },
                        { discountEndDate: { gte: now } },
                    ],
                },
                {
                    AND: [
                        { discountStartDate: null },
                        { discountEndDate: null },
                    ],
                },
                {
                    AND: [
                        { discountStartDate: { lte: now } },
                        { discountEndDate: null },
                    ],
                },
            ],
        },
        include: {
            category: true,
            flashSales: {
                select: {
                    id: true,
                    salePrice: true, startDate: true,
                    endDate: true,
                    isActive: true,
                },
            },
            variations: {
                include: {
                    options: {
                        select: {
                            id: true,
                            optionName: true,
                            isActive: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: limit,
    })

    // Serialize Decimal fields
    return products.map(serializeProductForClient)
}
