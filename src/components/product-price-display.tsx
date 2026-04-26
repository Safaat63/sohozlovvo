"use client"

import { useState, useEffect } from "react"
import { Currency } from "@/components/currency-provider"

interface ProductPriceDisplayProps {
    basePrice: number
    compareAtPrice: number | null
    onPriceChange?: (price: number) => void
    hasDiscount?: boolean
    discountPercentage?: number
}

type VariationPriceChangeEvent = CustomEvent<{ price: number; originalPrice?: number | null }>

export function ProductPriceDisplay({
    basePrice,
    compareAtPrice,
    onPriceChange,
    hasDiscount = false,
    discountPercentage,
}: ProductPriceDisplayProps) {
    const [currentPrice, setCurrentPrice] = useState(basePrice)
    const [variationOriginalPrice, setVariationOriginalPrice] = useState<number | null>(null)

    useEffect(() => {
        const handleVariationChange = (event: VariationPriceChangeEvent) => {
            setCurrentPrice(event.detail.price)
            setVariationOriginalPrice(event.detail.originalPrice ?? null)
            onPriceChange?.(event.detail.price)
        }

        window.addEventListener("variation-price-change", handleVariationChange as EventListener)

        return () => {
            window.removeEventListener("variation-price-change", handleVariationChange as EventListener)
        }
    }, [onPriceChange])

    const effectiveComparePrice = variationOriginalPrice
        || compareAtPrice
        || (hasDiscount && discountPercentage ? currentPrice / (1 - discountPercentage / 100) : null)

    return (
        <div className="flex items-center flex-wrap gap-3 my-2">
            <span className="text-[#f48721] text-[28px] font-bold tracking-tight">
                <Currency value={currentPrice} />
            </span>
            {effectiveComparePrice && currentPrice < effectiveComparePrice && (
                <>
                    <span className="text-[#999999] text-xl line-through">
                        <Currency value={effectiveComparePrice} />
                    </span>
                    <span className="bg-[#2ecc71] text-white text-[11px] font-bold px-2 py-1 rounded tracking-wide">
                        Save {Math.round(((effectiveComparePrice - currentPrice) / effectiveComparePrice) * 100)}%
                    </span>
                </>
            )}
        </div>
    )
}