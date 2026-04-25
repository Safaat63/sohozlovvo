"use server"

import { prisma } from "@/lib/prisma"

export async function searchProducts(query: string, limit = 10) {
    if (!query || query.length < 2) {
        return []
    }

    const products = await prisma.product.findMany({
        where: {
            isActive: true,
            OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
                { brand: { contains: query, mode: "insensitive" } },
                { sku: { contains: query, mode: "insensitive" } },
            ],
        },
        select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            category: {
                select: { name: true },
            },
        },
        take: limit,
    })

    return products.map((p) => ({
        ...p,
        price: typeof p.price === "object" && p.price !== null && "toNumber" in p.price
            ? p.price.toNumber()
            : Number(p.price),
    }))
}

export async function getSearchSuggestions(query: string) {
    if (!query || query.length < 2) {
        return { products: [], categories: [], brands: [] }
    }

    const [products, categories, brands] = await Promise.all([
        prisma.product.findMany({
            where: {
                isActive: true,
                name: { contains: query, mode: "insensitive" },
            },
            select: {
                id: true,
                name: true,
                slug: true,
            },
            take: 5,
        }),
        prisma.category.findMany({
            where: {
                isActive: true,
                name: { contains: query, mode: "insensitive" },
            },
            select: {
                id: true,
                name: true,
                slug: true,
            },
            take: 3,
        }),
        prisma.product.findMany({
            where: {
                isActive: true,
                brand: { contains: query, mode: "insensitive" },
            },
            select: {
                brand: true,
            },
            distinct: ["brand"],
            take: 3,
        }),
    ])

    return {
        products,
        categories,
        brands: brands.map((b) => b.brand).filter(Boolean),
    }
}
