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
                variations: {
                    select: {
                        id: true,
                        variationName: true,
                        options: {
                            select: {
                                id: true,
                                optionName: true,
                                isActive: true,
                                variationId: true,
                                image: true,
                                hexCode: true,
                            },
                        },
                    },
                },
                combinations: {
                    select: {
                        id: true,
                        sku: true,
                        stock: true,
                        price: true,
                        isActive: true,
                        options: {
                            select: {
                                id: true,
                                optionId: true,
                                option: {
                                    select: {
                                        id: true,
                                        optionName: true,
                                        variation: {
                                            select: {
                                                id: true,
                                                variationName: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
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
                variations: p.variations?.map((variation) => ({
                    id: variation.id,
                    variationName: variation.variationName,
                    options: variation.options.map((option) => ({
                        id: option.id,
                        optionName: option.optionName,
                        isActive: option.isActive,
                        variationId: option.variationId,
                        image: option.image ?? null,
                        hexCode: option.hexCode ?? null,
                    })),
                })),
                combinations: p.combinations?.map((combo) => ({
                    id: combo.id,
                    sku: combo.sku,
                    stock: combo.stock,
                    price: combo.price !== null && combo.price !== undefined
                        ? parseFloat(combo.price.toString())
                        : null,
                    isActive: combo.isActive,
                    options: combo.options.map((comboOption) => ({
                        id: comboOption.id,
                        optionId: comboOption.optionId,
                        option: comboOption.option ? {
                            id: comboOption.option.id,
                            optionName: comboOption.option.optionName,
                            variation: comboOption.option.variation ? {
                                id: comboOption.option.variation.id,
                                variationName: comboOption.option.variation.variationName,
                            } : null,
                        } : null,
                    })),
                })),
            }))
        }
    } catch {
        return { success: false, products: [] }
    }
}
