"use client"

import { useState, useEffect } from "react"
import { Currency } from "@/components/currency-provider"
import { Badge } from "@/components/ui/badge"

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
        // Listen for variation price changes
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

    // Use variation original price if available, otherwise use compareAtPrice or calculate from discount
    const effectiveComparePrice = variationOriginalPrice
        || compareAtPrice
        || (hasDiscount && discountPercentage ? currentPrice / (1 - discountPercentage / 100) : null)

    return (
        <div className="space-y-2">
            <div className="flex items-baseline gap-2 md:gap-3">
                <span className="text-3xl md:text-4xl font-bold">
                    <Currency value={currentPrice} className="text-3xl md:text-4xl font-bold" />
                </span>
                {effectiveComparePrice && currentPrice < effectiveComparePrice && (
                    <>
                        <Currency
                            value={effectiveComparePrice}
                            className="text-lg text-muted-foreground line-through"
                        />
                        <Badge variant="success">
                            {Math.round(((effectiveComparePrice - currentPrice) / effectiveComparePrice) * 100)}% OFF
                        </Badge>
                    </>
                )}
            </div>
        </div>
    )
}
