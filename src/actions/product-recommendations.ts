"use server"

import { prisma } from "@/lib/prisma"

export async function getRelatedProducts(productId: string, categoryId?: string | null, limit: number = 6) {
    const relatedProducts = await prisma.product.findMany({
        where: {
            AND: [
                { id: { not: productId } },
                { isActive: true },
                { stock: { gt: 0 } },
                ...(categoryId ? [{ categoryId }] : []),
            ],
        },
        take: limit,
        orderBy: [
            { rating: "desc" },
            { reviewCount: "desc" },
        ],
    })

    return relatedProducts.map((p) => ({
        ...p,
        price: parseFloat(p.price.toString()),
        compareAtPrice: p.compareAtPrice ? parseFloat(p.compareAtPrice.toString()) : null,
        costPrice: p.costPrice ? parseFloat(p.costPrice.toString()) : null,
        weight: p.weight ? parseFloat(p.weight.toString()) : null,
        rating: parseFloat(p.rating.toString()),
    }))
}

export async function getSimilarProducts(productId: string, limit: number = 6) {
    const currentProduct = await prisma.product.findUnique({
        where: { id: productId },
        select: { price: true, brand: true },
    })

    if (!currentProduct) return []

    const minPrice = parseFloat(currentProduct.price.toString()) * 0.7
    const maxPrice = parseFloat(currentProduct.price.toString()) * 1.3

    const suggestions = await prisma.product.findMany({
        where: {
            AND: [
                { id: { not: productId } },
                { isActive: true },
                { stock: { gt: 0 } },
                {
                    OR: [
                        {
                            price: {
                                gte: minPrice,
                                lte: maxPrice,
                            },
                        },
                        ...(currentProduct.brand ? [{ brand: currentProduct.brand }] : []),
                    ],
                },
            ],
        },
        take: limit,
        orderBy: [
            { rating: "desc" },
            { reviewCount: "desc" },
        ],
    })

    return suggestions.map((p) => ({
        ...p,
        price: parseFloat(p.price.toString()),
        compareAtPrice: p.compareAtPrice ? parseFloat(p.compareAtPrice.toString()) : null,
        costPrice: p.costPrice ? parseFloat(p.costPrice.toString()) : null,
        weight: p.weight ? parseFloat(p.weight.toString()) : null,
        rating: parseFloat(p.rating.toString()),
    }))
}

export async function getProductForComparison(productId: string) {
    const product = await prisma.product.findUnique({
        where: { id: productId, isActive: true },
        select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            compareAtPrice: true,
            brand: true,
            rating: true,
            stock: true,
            images: true,
            description: true,
            specifications: {
                select: {
                    key: true,
                    value: true,
                },
            },
        },
    })

    if (!product) return null

    return {
        ...product,
        price: parseFloat(product.price.toString()),
        compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice.toString()) : null,
        rating: parseFloat(product.rating.toString()),
    }
}
