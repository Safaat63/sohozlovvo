"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, useCurrencySymbol } from "@/components/currency-provider"

interface VariationOption {
    id: string
    name: string
    isActive: boolean
    hexCode?: string | null
}

interface VariationType {
    id: string
    name: string
    options: VariationOption[]
}

interface Combination {
    id: string
    optionIds: string[]
    stock: number
    price: number | null // null means use base price
    sku: string | null
    isActive: boolean
}

interface MultiVariationSelectorProps {
    variations: VariationType[]
    combinations: Combination[]
    basePrice: number | string
    onSelectionChange?: (
        combinationId: string | null,
        price: number,
        stock: number,
        selectedOptions: Record<string, string> // variationId -> optionName
    ) => void
}

export function MultiVariationSelector({
    variations,
    combinations,
    basePrice,
    onSelectionChange,
}: MultiVariationSelectorProps) {
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({}) // variationId -> optionId
    const currency = useCurrencySymbol()

    if (!variations || variations.length === 0) {
        return null
    }

    // Find the matching combination based on selected options
    const findMatchingCombination = (selections: Record<string, string>): Combination | null => {
        const selectedIds = Object.values(selections).filter(Boolean)

        // Must select from all variation types
        if (selectedIds.length !== variations.length) {
            return null
        }

        const match = combinations.find((combo) => {
            if (!combo.isActive) return false
            if (combo.optionIds.length !== selectedIds.length) return false
            return combo.optionIds.every((id) => selectedIds.includes(id))
        })

        return match || null
    }

    // Handle option selection
    const handleOptionSelect = (variationId: string, optionId: string) => {
        const newSelections = {
            ...selectedOptions,
            [variationId]: optionId,
        }
        setSelectedOptions(newSelections)

        const matchingCombo = findMatchingCombination(newSelections)

        if (matchingCombo) {
            const finalPrice = matchingCombo.price !== null ? matchingCombo.price : Number(basePrice)

            // Build selected option names map
            const optionNames: Record<string, string> = {}
            variations.forEach((v) => {
                const optId = newSelections[v.id]
                if (optId) {
                    const option = v.options.find((o) => o.id === optId)
                    if (option) {
                        optionNames[v.id] = option.name
                    }
                }
            })

            onSelectionChange?.(
                matchingCombo.id,
                finalPrice,
                matchingCombo.stock,
                optionNames
            )
        } else {
            onSelectionChange?.(null, Number(basePrice), 0, {})
        }
    }

    // Check if a specific option is available based on current selections
    const isOptionAvailable = (variationId: string, optionId: string): boolean => {
        // Build potential selection with this option
        const potentialSelection = {
            ...selectedOptions,
            [variationId]: optionId,
        }

        const selectedIds = Object.entries(potentialSelection)
            .filter(([vId, _]) => vId !== variationId || potentialSelection[vId])
            .map(([_, optId]) => optId)
            .filter(Boolean)

        // Check if any combination exists with these selections
        const hasAvailableCombo = combinations.some((combo) => {
            if (!combo.isActive || combo.stock === 0) return false
            return selectedIds.every((id) => combo.optionIds.includes(id))
        })

        return hasAvailableCombo
    }

    const basePriceNum = typeof basePrice === "string" ? parseFloat(basePrice) : basePrice
    const currentCombo = findMatchingCombination(selectedOptions)
    const currentPrice = currentCombo?.price !== null && currentCombo?.price !== undefined
        ? currentCombo.price
        : basePriceNum

    return (
        <div className="space-y-5">
            {variations.map((variation) => (
                <div key={variation.id}>
                    <h3 className="text-sm font-semibold mb-3 dark:text-white">
                        {variation.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {variation.options
                            .filter((option) => option.isActive)
                            .map((option) => {
                                const isSelected = selectedOptions[variation.id] === option.id
                                const isAvailable = isOptionAvailable(variation.id, option.id)
                                const isOutOfStock = !isAvailable && !isSelected
                                const isColorVariation = variation.name.toLowerCase().includes('color')

                                return (
                                    <button
                                        key={option.id}
                                        onClick={() =>
                                            !isOutOfStock &&
                                            handleOptionSelect(variation.id, option.id)
                                        }
                                        disabled={isOutOfStock}
                                        className={cn(
                                            isColorVariation && option.hexCode
                                                ? "w-10 h-10 rounded-full border-2 transition-all relative overflow-hidden"
                                                : "px-3 py-2 text-sm rounded-md border transition-all",
                                            isSelected
                                                ? isColorVariation && option.hexCode
                                                    ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800 scale-110"
                                                    : "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                                : isColorVariation && option.hexCode
                                                    ? "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:scale-105"
                                                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
                                            isOutOfStock &&
                                            "opacity-50 cursor-not-allowed line-through"
                                        )}
                                        style={
                                            isColorVariation && option.hexCode
                                                ? { backgroundColor: option.hexCode }
                                                : undefined
                                        }
                                        title={isColorVariation && option.hexCode ? option.name : undefined}
                                    >
                                        {isColorVariation && option.hexCode ? (
                                            // Color circle - show color only, name in tooltip
                                            <span className="sr-only">{option.name}</span>
                                        ) : (
                                            // Regular option button - show text
                                            <>
                                                <span>{option.name}</span>
                                                {isOutOfStock && (
                                                    <Badge
                                                        variant="destructive"
                                                        className="ml-2 text-xs"
                                                    >
                                                        Unavailable
                                                    </Badge>
                                                )}
                                            </>
                                        )}
                                        {isColorVariation && option.hexCode && isOutOfStock && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="text-white text-xs">✗</span>
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                    </div>
                </div>
            ))}

            {/* Show current selection summary */}
            {currentCombo && (
                <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Selected variant</span>
                        <span className="font-semibold">
                            {formatCurrency(currentPrice, currency)}
                        </span>
                    </div>
                    {currentCombo.stock > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                            {currentCombo.stock} units available
                        </div>
                    )}
                </div>
            )}

            {/* Show selection requirement */}
            {!currentCombo && Object.keys(selectedOptions).length > 0 && (
                <div className="text-sm text-amber-600 dark:text-amber-400">
                    Please select from all variation types
                </div>
            )}
        </div>
    )
}
