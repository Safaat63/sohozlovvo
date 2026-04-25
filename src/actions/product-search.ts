'use server';

import { prisma } from "@/lib/prisma";


export async function searchProducts(query: string) {
    try {
        if (!query || query.length < 2) {
            return { success: true, products: [] };
        }

        const products = await prisma.product.findMany({
            where: {
                AND: [
                    { isActive: true },
                    {
                        OR: [
                            { name: { contains: query, mode: 'insensitive' } },
                            { description: { contains: query, mode: 'insensitive' } },
                            { brand: { contains: query, mode: 'insensitive' } },
                        ],
                    },
                ],
            },
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: true,
            },
            take: 10,
            orderBy: {
                name: 'asc',
            },
        });

        // Convert Decimal to number for client-side usage
        const productsWithNumberPrice = products.map(product => ({
            ...product,
            price: Number(product.price),
        }));

        return { success: true, products: productsWithNumberPrice };
    } catch (error) {
        console.error('Product search error:', error);
        return { success: false, products: [], error: 'Failed to search products' };
    }
}
