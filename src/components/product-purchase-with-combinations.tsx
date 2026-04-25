"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Minus, Plus, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { addToCart } from "@/actions/cart"
import { toast } from "sonner"
import { formatCurrency, useCurrencySymbol } from "@/components/currency-provider"
import { cn } from "@/lib/utils"

// Types matching the Prisma schema
interface VariationOption {
    id: string
    optionName: string
    isActive: boolean
    variationId: string
    image?: string | null
    hexCode?: string | null
}

interface Variation {
    id: string
    variationName: string
    options: VariationOption[]
}

interface CombinationOption {
    id: string
    optionId: string
    option: {
        id: string
        optionName: string
        variation: {
            id: string
            variationName: string
        }
    }
}

interface Combination {
    id: string
    sku: string | null
    stock: number
    price: number | string | null // Decimal comes as string from Prisma
    originalPrice?: number | null // Original price before discount
    isActive: boolean
    options: CombinationOption[]
}

interface ProductPurchaseWithCombinationsProps {
    productId: string
    baseStock: number
    basePrice: number
    variations: Variation[]
    combinations: Combination[]
    productDiscount?: {
        discountType?: string | null
        discountValue?: number | null
        discountStartDate?: Date | null
        discountEndDate?: Date | null
        originalPrice?: number
    }
}

export function ProductPurchaseWithCombinations({
    productId,
    baseStock,
    basePrice,
    variations,
    combinations,
}: ProductPurchaseWithCombinationsProps) {
    // Track selected option for each variation
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
    const [quantity, setQuantity] = useState(1)
    const [adding, setAdding] = useState(false)
    const [ordering, setOrdering] = useState(false)

    const router = useRouter()
    const currency = useCurrencySymbol()

    const hasVariations = variations.length > 0 && combinations.length > 0

    // Find the matching combination based on selected options
    const selectedCombination = useMemo(() => {
        if (!hasVariations) return null

        const selectedOptionIds = Object.values(selectedOptions)

        // Must have selected one option from each variation
        if (selectedOptionIds.length !== variations.length) return null

        // Find combination that matches all selected options
        return combinations.find(combo => {
            const comboOptionIds = combo.options.map(o => o.optionId)
            return selectedOptionIds.every(id => comboOptionIds.includes(id)) &&
                comboOptionIds.length === selectedOptionIds.length
        }) || null
    }, [selectedOptions, combinations, variations.length, hasVariations])

    // Calculate effective price and stock
    const effectivePrice = useMemo(() => {
        if (selectedCombination && selectedCombination.price !== null) {
            return typeof selectedCombination.price === 'string'
                ? parseFloat(selectedCombination.price)
                : selectedCombination.price
        }
        return basePrice
    }, [selectedCombination, basePrice])

    const effectiveStock = useMemo(() => {
        if (selectedCombination) {
            return selectedCombination.stock
        }
        // If no variations or combinations, use base stock
        if (!hasVariations) {
            return baseStock
        }
        // If has variations but not all selected, show total stock from all combinations
        return combinations
            .filter(combo => combo.isActive)
            .reduce((sum, combo) => sum + combo.stock, 0)
    }, [selectedCombination, baseStock, hasVariations, combinations])

    // Check if an option is available (has at least one in-stock combination)
    const isOptionAvailable = (variationId: string, optionId: string): boolean => {
        // Check if any combination containing this option is in stock
        return combinations.some(combo => {
            const hasOption = combo.options.some(o => o.optionId === optionId)
            if (!hasOption) return false

            // Check if this combination is compatible with current selections
            const otherSelections = Object.entries(selectedOptions)
                .filter(([vId]) => vId !== variationId)

            const isCompatible = otherSelections.every(([, selectedOptionId]) =>
                combo.options.some(o => o.optionId === selectedOptionId)
            )

            return isCompatible && combo.stock > 0
        })
    }

    // Get display label for selected combination
    const selectedLabel = useMemo(() => {
        if (!hasVariations) return null
        if (Object.keys(selectedOptions).length === 0) return "Select options"

        const labels = variations.map(v => {
            const selectedOptionId = selectedOptions[v.id]
            if (!selectedOptionId) return null
            const option = v.options.find(o => o.id === selectedOptionId)
            return option ? `${v.variationName}: ${option.optionName}` : null
        }).filter(Boolean)

        return labels.join(", ")
    }, [selectedOptions, variations, hasVariations])

    // Emit price change event for parent components
    useEffect(() => {
        // Use the combination's original price if available
        const originalPrice = selectedCombination?.originalPrice ?? null

        const event = new CustomEvent("variation-price-change", {
            detail: {
                price: effectivePrice,
                originalPrice,
            },
        })
        window.dispatchEvent(event)
    }, [effectivePrice, selectedCombination])

    // Emit variant image change event when option selection changes
    useEffect(() => {
        // Find the first selected option that has an image
        let variantImage: string | null = null

        // Check all selected options for variant images
        for (const variationId of Object.keys(selectedOptions)) {
            const optionId = selectedOptions[variationId]
            const variation = variations.find(v => v.id === variationId)
            const option = variation?.options.find(o => o.id === optionId)

            if (option?.image && option.image.trim() !== '') {
                variantImage = option.image
                break
            }
        }

        const event = new CustomEvent("variation-image-change", {
            detail: { image: variantImage },
            bubbles: true
        })
        window.dispatchEvent(event)
    }, [selectedOptions, variations])

    // Reset quantity if it exceeds stock (only when stock changes)
    useEffect(() => {
        if (quantity > effectiveStock && effectiveStock > 0) {
            setQuantity(effectiveStock)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [effectiveStock])

    const handleOptionSelect = (variationId: string, optionId: string) => {
        setSelectedOptions(prev => ({
            ...prev,
            [variationId]: optionId,
        }))
    }

    const handleAddToCart = async (redirectToCheckout = false) => {
        if (hasVariations && !selectedCombination) {
            toast.error("Please select all options")
            return
        }

        if (effectiveStock < quantity) {
            toast.error("Not enough stock")
            return
        }

        const setLoading = redirectToCheckout ? setOrdering : setAdding
        setLoading(true)

        // Pass combinationId to addToCart
        const result = await addToCart(
            productId,
            quantity,
            selectedCombination?.id
        )

        setLoading(false)

        if (result?.error) {
            toast.error(result.error)
            return
        }

        toast.success(redirectToCheckout ? "Proceeding to checkout" : "Added to cart")
        if (redirectToCheckout) {
            router.push("/checkout")
        } else {
            router.refresh()
        }
    }

    const allOptionsSelected = !hasVariations || Object.keys(selectedOptions).length === variations.length
    const canAddToCart = allOptionsSelected && effectiveStock > 0

    return (
        <div className="space-y-4">
            {/* Variation Selectors */}
            {variations.map((variation) => (
                <div key={variation.id} className="space-y-2">
                    <h3 className="text-sm font-semibold dark:text-white">
                        {variation.variationName}
                        {selectedOptions[variation.id] && (
                            <span className="font-normal text-muted-foreground ml-2">
                                : {variation.options.find(o => o.id === selectedOptions[variation.id])?.optionName}
                            </span>
                        )}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {variation.options
                            .filter((option) => option.isActive)
                            .map((option) => {
                                const isSelected = selectedOptions[variation.id] === option.id
                                const isAvailable = isOptionAvailable(variation.id, option.id)
                                const isColorVariation = variation.variationName.toLowerCase().includes('color')

                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => handleOptionSelect(variation.id, option.id)}
                                        disabled={!isAvailable}
                                        className={cn(
                                            isColorVariation && option.hexCode
                                                ? "w-10 h-10 rounded-full border-2 transition-all relative overflow-hidden"
                                                : "px-4 py-2 text-sm rounded-md border transition-all",
                                            isSelected
                                                ? isColorVariation && option.hexCode
                                                    ? "border-primary ring-2 ring-primary/20 scale-110"
                                                    : "border-primary bg-primary/10 text-primary font-medium"
                                                : isColorVariation && option.hexCode
                                                    ? "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:scale-105"
                                                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
                                            !isAvailable && "opacity-40 cursor-not-allowed line-through"
                                        )}
                                        style={
                                            isColorVariation && option.hexCode
                                                ? { backgroundColor: option.hexCode }
                                                : undefined
                                        }
                                        title={isColorVariation && option.hexCode ? option.optionName : undefined}
                                    >
                                        {isColorVariation && option.hexCode ? (
                                            // Color circle - show color only, name in tooltip
                                            <span className="sr-only">{option.optionName}</span>
                                        ) : (
                                            // Regular option button - show text
                                            option.optionName
                                        )}
                                        {isColorVariation && option.hexCode && !isAvailable && (
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

            {/* Price and Stock Info */}
            <div className="rounded-md border p-3 space-y-3">
                {hasVariations && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Selected</span>
                        <span className={cn(
                            "font-medium",
                            !allOptionsSelected && "text-amber-600"
                        )}>
                            {selectedLabel}
                        </span>
                    </div>
                )}

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-semibold text-lg">
                        {formatCurrency(effectivePrice, currency)}
                    </span>
                </div>

                {selectedCombination?.sku && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">SKU</span>
                        <span className="font-mono text-xs">{selectedCombination.sku}</span>
                    </div>
                )}

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Availability</span>
                    {effectiveStock > 0 ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {effectiveStock} in stock
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Out of stock
                        </Badge>
                    )}
                </div>

                {/* Quantity Selector */}
                {effectiveStock > 0 && allOptionsSelected && (
                    <div className="flex items-center gap-4 pt-2">
                        <span className="font-semibold text-sm">Quantity</span>
                        <div className="flex items-center border rounded-md">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="px-4 py-2 min-w-14 text-center">{quantity}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setQuantity(Math.min(effectiveStock, quantity + 1))}
                                disabled={quantity >= effectiveStock}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                        type="button"
                        className="flex-1"
                        onClick={() => handleAddToCart(false)}
                        disabled={!canAddToCart || adding}
                    >
                        {adding ? "Adding..." : "Add to Cart"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleAddToCart(true)}
                        disabled={!canAddToCart || ordering}
                    >
                        {ordering ? "Processing..." : (
                            <span className="flex items-center justify-center gap-2">
                                <Zap className="h-4 w-4" />
                                Order Now
                            </span>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
