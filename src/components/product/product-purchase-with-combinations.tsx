"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Minus, Plus, ShoppingBag, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { addToCart } from "@/actions/cart"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { MessageCircle } from "lucide-react"
import { trackAddToCart } from "@/lib/ga4"

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
    price: number | string | null
    originalPrice?: number | null
    isActive: boolean
    options: CombinationOption[]
}

interface ProductPurchaseWithCombinationsProps {
    productId: string
    productName: string
    baseStock: number
    basePrice: number
    variations: Variation[]
    combinations: Combination[]
    whatsappLink?: string | null
    callNumber?: string | null
    productBrand?: string | null
    productCategory?: string | null
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
    productName,
    baseStock,
    basePrice,
    variations,
    combinations,
    whatsappLink,
    callNumber,
    productBrand,
    productCategory
}: ProductPurchaseWithCombinationsProps) {
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
    const [quantity, setQuantity] = useState(1)
    const [prevEffectiveStock, setPrevEffectiveStock] = useState<number | null>(null)
    const [adding, setAdding] = useState(false)
    const [ordering, setOrdering] = useState(false)

    const router = useRouter()
    const hasVariations = variations.length > 0 && combinations.length > 0

    const fallbackSelectedOptions = useMemo(() => {
        if (!hasVariations) {
            return {}
        }

        const firstVariation = variations[0]
        const firstActiveOption = firstVariation?.options
            .find((option) => option.isActive)

        return firstActiveOption ? { [firstVariation.id]: firstActiveOption.id } : {}
    }, [hasVariations, variations])

    const resolvedSelectedOptions = useMemo(() => {
        if (Object.keys(selectedOptions).length > 0) {
            return selectedOptions
        }

        return fallbackSelectedOptions
    }, [fallbackSelectedOptions, selectedOptions])

    const selectedCombination = useMemo(() => {
        if (!hasVariations) return null

        const selectedOptionIds = Object.values(resolvedSelectedOptions)
        if (selectedOptionIds.length !== variations.length) return null

        return combinations.find(combo => {
            const comboOptionIds = combo.options.map(o => o.optionId)
            return selectedOptionIds.every(id => comboOptionIds.includes(id)) &&
                comboOptionIds.length === selectedOptionIds.length
        }) || null
    }, [resolvedSelectedOptions, combinations, variations.length, hasVariations])

    const selectedVariantLabel = useMemo(() => {
        if (!selectedCombination) return undefined
        const labels = selectedCombination.options.map((option) => {
            return `${option.option.variation.variationName}: ${option.option.optionName}`
        })
        return labels.join(" / ")
    }, [selectedCombination])

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
        if (!hasVariations) {
            return baseStock
        }
        return combinations
            .filter(combo => combo.isActive)
            .reduce((sum, combo) => sum + combo.stock, 0)
    }, [selectedCombination, baseStock, hasVariations, combinations])

    // FIX FOR ESLINT WARNING: React 18 pattern for derived state during render
    if (effectiveStock !== prevEffectiveStock) {
        setPrevEffectiveStock(effectiveStock)
        if (quantity > effectiveStock && effectiveStock > 0) {
            setQuantity(effectiveStock)
        }
    }

    const isOptionAvailable = (variationId: string, optionId: string): boolean => {
        return combinations.some(combo => {
            const hasOption = combo.options.some(o => o.optionId === optionId)
            if (!hasOption) return false

            const otherSelections = Object.entries(resolvedSelectedOptions)
                .filter(([vId]) => vId !== variationId)

            const isCompatible = otherSelections.every(([, selectedOptionId]) =>
                combo.options.some(o => o.optionId === selectedOptionId)
            )

            return isCompatible && combo.stock > 0
        })
    }

    useEffect(() => {
        const originalPrice = selectedCombination?.originalPrice ?? null
        const event = new CustomEvent("variation-price-change", {
            detail: { price: effectivePrice, originalPrice },
        })
        window.dispatchEvent(event)
    }, [effectivePrice, selectedCombination])

    useEffect(() => {
        let variantImage: string | null = null
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
    }, [resolvedSelectedOptions, variations])

    const handleOptionSelect = (variationId: string, optionId: string) => {
        setSelectedOptions(prev => ({ ...prev, [variationId]: optionId }))
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

        const result = await addToCart(productId, quantity, selectedCombination?.id)

        setLoading(false)

        if (result?.error) {
            toast.error(result.error)
            return
        }

        toast.success(redirectToCheckout ? "Proceeding to checkout" : "Added to cart")
        trackAddToCart({
            item_id: productId,
            item_name: productName,
            price: effectivePrice,
            quantity,
            item_variant: selectedVariantLabel,
            item_brand: productBrand || undefined,
            item_category: productCategory || undefined,
        })
        if (redirectToCheckout) {
            router.push("/checkout")
        } else {
            router.refresh()
        }
    }

    const allOptionsSelected = !hasVariations || Object.keys(resolvedSelectedOptions).length === variations.length
    const canAddToCart = allOptionsSelected && effectiveStock > 0

    return (
        <div className="space-y-6">
            {variations.map((variation) => (
                <div key={variation.id} className="space-y-2">
                    <h3 className="text-sm font-semibold text-[#222831]">
                        {variation.variationName}:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {variation.options
                            .filter((option) => option.isActive)
                            .map((option) => {
                                const isSelected = resolvedSelectedOptions[variation.id] === option.id
                                const isAvailable = isOptionAvailable(variation.id, option.id)
                                const isColorVariation = variation.variationName.toLowerCase().includes('color')

                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => handleOptionSelect(variation.id, option.id)}
                                        disabled={!isAvailable}
                                        className={cn(
                                            isColorVariation && option.hexCode
                                                ? "w-8 h-8 rounded-full border-2 transition-all relative"
                                                : "px-4 py-1.5 text-sm rounded border transition-all bg-white",
                                            isSelected
                                                ? isColorVariation && option.hexCode
                                                    ? "border-[#f48721] ring-2 ring-[#f48721]/30"
                                                    : "border-[#f48721] text-[#f48721] font-bold"
                                                : "border-[#e0e0e0] text-[#252a34] hover:border-[#f48721]",
                                            !isAvailable && "opacity-40 cursor-not-allowed line-through"
                                        )}
                                        style={isColorVariation && option.hexCode ? { backgroundColor: option.hexCode } : undefined}
                                        title={option.optionName}
                                    >
                                        {!isColorVariation && option.optionName}
                                    </button>
                                )
                            })}
                    </div>
                </div>
            ))}

            {effectiveStock > 0 && (
                <div className="space-y-4">
                    {allOptionsSelected && (
                        <div className="flex items-center gap-4">
                            <span className="font-medium text-[15px] text-[#222831]">Quantity:</span>
                            <div className="flex items-center border border-[#e0e0e0] rounded bg-white w-fit h-10">
                                <button
                                    type="button"
                                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black transition-colors"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <input
                                    className="w-12 h-full text-center text-[15px] font-semibold text-[#222831] border-x border-[#e0e0e0] focus:outline-none"
                                    value={quantity}
                                    readOnly
                                />
                                <button
                                    type="button"
                                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black transition-colors"
                                    onClick={() => setQuantity(Math.min(effectiveStock, quantity + 1))}
                                    disabled={quantity >= effectiveStock}
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <Button
                            type="button"
                            className="w-full h-[46px] bg-[#f48721] hover:bg-[#e07b1d] text-white font-bold rounded shadow-none transition-all uppercase tracking-wide text-xs"
                            onClick={() => handleAddToCart(false)}
                            disabled={!canAddToCart || adding}
                        >
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            {adding ? "Adding..." : "Add to Cart"}
                        </Button>
                        <Button
                            type="button"
                            className="w-full h-[46px] bg-[#041f1e] hover:bg-[#062e2c] text-white font-bold rounded shadow-none transition-all uppercase tracking-wide text-xs"
                            onClick={() => handleAddToCart(true)}
                            disabled={!canAddToCart || ordering}
                        >
                            {ordering ? "Processing..." : "Buy Now"}
                        </Button>
                        {whatsappLink && (
                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center w-full h-[46px] bg-[#27ae60] hover:bg-[#219653] text-white font-bold rounded transition-colors text-xs"
                            >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Order On WhatsApp
                            </a>
                        )}
                        {callNumber && (
                            <a
                                href={`tel:${callNumber}`}
                                className="flex items-center justify-center w-full h-[46px] bg-[#2A4B8D] hover:bg-[#223d73] text-white font-bold rounded transition-colors text-xs"
                            >
                                <Phone className="h-4 w-4 mr-2" />
                                Call For Order
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}