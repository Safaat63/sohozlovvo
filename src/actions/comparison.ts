"use server"

import { prisma } from "@/lib/prisma"

export async function getComparisonProducts(ids: string[]) {
    try {
        if (!Array.isArray(ids) || ids.length === 0) {
            return { success: false, products: [] }
        }

        const products = await prisma.product.findMany({
            where: {
                id: { in: ids },
                isActive: true,
            },
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
                discountType: true,
                discountValue: true,
                discountStartDate: true,
                discountEndDate: true,
                flashSales: {
                    where: {
                        isActive: true,
                    },
                    select: {
                        id: true,
                        salePrice: true,
                        startDate: true,
                        endDate: true,
                        isActive: true,
                    },
                },
                specifications: {
                    select: {
                        key: true,
                        value: true,
                    },
                },
            },
        })

        return {
            success: true,
            products: products.map(p => ({
                ...p,
                price: parseFloat(p.price.toString()),
                compareAtPrice: p.compareAtPrice ? parseFloat(p.compareAtPrice.toString()) : null,
                rating: parseFloat(p.rating.toString()),
                discountValue: p.discountValue ? parseFloat(p.discountValue.toString()) : null,
                flashSales: p.flashSales?.map((fs) => ({
                    ...fs,
                    salePrice: parseFloat(fs.salePrice.toString()),
                })),
            }))
        }
    } catch {
        return { success: false, products: [] }
    }
}
