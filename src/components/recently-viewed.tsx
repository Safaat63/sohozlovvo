"use client"

import React from "react"
import { useEffect, useState } from "react"
import { ProductCard } from "./product-card"
import { getComparisonProducts } from "@/actions/comparison"

interface RecentlyViewedProduct {
  id: string
  timestamp: number
}

type ProductCardType = React.ComponentProps<typeof ProductCard>["product"]

export function RecentlyViewed() {
  const [productIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    const recentlyViewed = window.localStorage.getItem("recentlyViewed")
    if (!recentlyViewed) return []

    try {
      const parsed: RecentlyViewedProduct[] = JSON.parse(recentlyViewed)
      return parsed
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 8)
        .map((item) => item.id)
    } catch {
      window.localStorage.removeItem("recentlyViewed")
      return []
    }
  })

  const [products, setProducts] = useState<ProductCardType[]>([])

  useEffect(() => {
    if (productIds.length === 0) return

    let isActive = true
    getComparisonProducts(productIds).then((res) => {
      if (isActive && res.success) {
        const normalized = res.products.map((product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
          images: product.images ?? [],
          stock: product.stock ?? 0,
          brand: product.brand ?? null,
          rating: Number((product as { rating?: number | null }).rating ?? 0),
          reviewCount: Number((product as { reviewCount?: number | null }).reviewCount ?? 0),
          description: product.description ?? null,
          lowStockAlert: (product as { lowStockAlert?: number | null }).lowStockAlert ?? null,
          variations: (product as { variations?: ProductCardType["variations"] }).variations,
          discountType: (product as { discountType?: string | null }).discountType ?? null,
          discountValue: (product as { discountValue?: number | null }).discountValue ?? null,
          discountStartDate: (product as { discountStartDate?: Date | null }).discountStartDate ?? null,
          discountEndDate: (product as { discountEndDate?: Date | null }).discountEndDate ?? null,
          flashSales: (product as { flashSales?: ProductCardType["flashSales"] }).flashSales,
        })) as ProductCardType[]

        setProducts(normalized)
      }
    })

    return () => {
      isActive = false
    }
  }, [productIds])

  if (productIds.length === 0 || products.length === 0) {
    return null
  }

  return (
    <div>
      <h2 className="text-xl sm:text-3xl font-bold mb-4 md:mb-6 dark:text-white">Recently Viewed</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-5 lg:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </div>
  )
}
