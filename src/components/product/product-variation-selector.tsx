"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, useCurrencySymbol } from "@/components/providers/currency-provider"

interface ProductVariation {
    id: string
    variationName: string
    options: {
        id: string
        optionName: string
        price?: number | string
        stock?: number
        isActive: boolean
    }[]
}

interface ProductVariationSelectorProps {
    variations: ProductVariation[]
    basePrice: number | string
    onVariationChange?: (
        selectedOptionId: string | undefined,
        priceAdjustment: number,
        optionName?: string,
        stock?: number
    ) => void
}

export function ProductVariationSelector({
    variations,
    basePrice,
    onVariationChange,
}: ProductVariationSelectorProps) {
    const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>(undefined)
    const currency = useCurrencySymbol()

    const fallbackOption = useMemo(() => {
        const firstVariation = variations[0]
        const firstActiveOption = firstVariation?.options
            .find((option) => option.isActive && (option.stock === undefined || option.stock > 0))

        return firstActiveOption ?? firstVariation?.options
            .find((option) => option.isActive)
    }, [variations])

    const resolvedOptionId = selectedOptionId ?? fallbackOption?.id

    const handleOptionSelect = useCallback((
        optionId: string,
        optionPriceRaw: number | string | undefined,
        optionName: string,
        optionStock: number | undefined
    ) => {
        setSelectedOptionId(optionId)

        const optionPrice = optionPriceRaw !== undefined
            ? (typeof optionPriceRaw === "string" ? parseFloat(optionPriceRaw) : optionPriceRaw)
            : 0
        const basePriceNum = typeof basePrice === "string" ? parseFloat(basePrice) : basePrice
        const priceAdjustment = optionPrice - basePriceNum

        onVariationChange?.(optionId, priceAdjustment, optionName, optionStock)
    }, [basePrice, onVariationChange])

    useEffect(() => {
        if (selectedOptionId || !fallbackOption) {
            return
        }

        const optionPrice = fallbackOption.price !== undefined
            ? (typeof fallbackOption.price === "string" ? parseFloat(fallbackOption.price) : fallbackOption.price)
            : 0
        const basePriceNum = typeof basePrice === "string" ? parseFloat(basePrice) : basePrice
        const priceAdjustment = optionPrice - basePriceNum

        onVariationChange?.(
            fallbackOption.id,
            priceAdjustment,
            fallbackOption.optionName,
            fallbackOption.stock
        )
    }, [basePrice, fallbackOption, onVariationChange, selectedOptionId])

    if (!variations || variations.length === 0) {
        return null
    }

    return (
        <div className="space-y-5">
            {variations.map((variation) => (
                <div key={variation.id}>
                    <h3 className="text-sm font-semibold mb-3 dark:text-white">
                        {variation.variationName}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {variation.options
                            .filter((option) => option.isActive)
                            .map((option) => {
                                const isSelected = resolvedOptionId === option.id
                                const isOutOfStock = option.stock !== undefined && option.stock === 0
                                const optionPrice = option.price !== undefined
                                    ? (typeof option.price === "string" ? parseFloat(option.price) : option.price)
                                    : undefined
                                const basePriceNum = typeof basePrice === "string" ? parseFloat(basePrice) : basePrice
                                const priceDiff = optionPrice !== undefined ? optionPrice - basePriceNum : 0

                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => !isOutOfStock && handleOptionSelect(option.id, option.price, option.optionName, option.stock)}
                                        disabled={isOutOfStock}
                                        className={cn(
                                            "px-3 py-2 text-sm rounded-md border transition-all",
                                            isSelected
                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
                                            isOutOfStock && "opacity-50 cursor-not-allowed line-through"
                                        )}
                                    >
                                        <span>{option.optionName}</span>
                                        {priceDiff !== 0 && (
                                            <span className="ml-1 text-xs text-muted-foreground">
                                                ({priceDiff > 0 ? "+" : ""}{formatCurrency(priceDiff, currency)})
                                            </span>
                                        )}
                                        {isOutOfStock && (
                                            <Badge variant="destructive" className="ml-2 text-xs">
                                                Out of Stock
                                            </Badge>
                                        )}
                                    </button>
                                )
                            })}
                    </div>
                </div>
            ))}
        </div>
    )
}
