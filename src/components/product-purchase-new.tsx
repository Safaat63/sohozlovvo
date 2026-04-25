"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Minus, Plus, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MultiVariationSelector } from "@/components/multi-variation-selector"
import { addToCart } from "@/actions/cart"
import { toast } from "sonner"
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
    price: number | null
    sku: string | null
    isActive: boolean
}

interface ProductPurchaseSectionNewProps {
    productId: string
    stock: number
    basePrice: number
    variations: VariationType[]
    combinations: Combination[]
}

export function ProductPurchaseSectionNew({
    productId,
    stock,
    basePrice,
    variations,
    combinations,
}: ProductPurchaseSectionNewProps) {
    const [selectedCombinationId, setSelectedCombinationId] = useState<string | null>(null)
    const [selectedPrice, setSelectedPrice] = useState(basePrice)
    const [selectedStock, setSelectedStock] = useState(stock)
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
    const [quantity, setQuantity] = useState(1)
    const [adding, setAdding] = useState(false)
    const [ordering, setOrdering] = useState(false)

    const router = useRouter()
    const currency = useCurrencySymbol()

    const hasVariations = variations.length > 0
    const effectiveStock = hasVariations ? selectedStock : stock
    const effectivePrice = hasVariations ? selectedPrice : basePrice
    const canAddToCart = hasVariations ? selectedCombinationId !== null : true

    // Emit price change event for parent components
    useEffect(() => {
        const event = new CustomEvent("variation-price-change", {
            detail: { price: effectivePrice },
        })
        window.dispatchEvent(event)
    }, [effectivePrice])

    const handleAddToCart = async (redirectToCheckout = false) => {
        if (hasVariations && !selectedCombinationId) {
            toast.error("Please select all variation options")
            return
        }

        if (effectiveStock === 0) {
            toast.error("Product is out of stock")
            return
        }

        const setLoading = redirectToCheckout ? setOrdering : setAdding
        setLoading(true)
        const result = await addToCart(productId, quantity, selectedCombinationId || undefined)
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

    return (
        <div className="space-y-4">
            {hasVariations && (
                <MultiVariationSelector
                    variations={variations}
                    combinations={combinations}
                    basePrice={basePrice}
                    onSelectionChange={(combinationId, price, stock, options) => {
                        setSelectedCombinationId(combinationId)
                        setSelectedPrice(price)
                        setSelectedStock(stock)
                        setSelectedOptions(options)
                        // Reset quantity if it exceeds new stock
                        if (stock > 0 && quantity > stock) {
                            setQuantity(Math.max(1, stock))
                        }
                    }}
                />
            )}

            <div className="rounded-md border p-3 space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-semibold">
                        {formatCurrency(effectivePrice, currency)}
                    </span>
                </div>

                {hasVariations && selectedCombinationId && (
                    <div className="text-xs text-muted-foreground space-y-1">
                        {Object.entries(selectedOptions).map(([varId, optName]) => {
                            const variation = variations.find((v) => v.id === varId)
                            return (
                                <div key={varId}>
                                    <span className="font-medium">{variation?.name}:</span> {optName}
                                </div>
                            )
                        })}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <span className="font-semibold">Quantity</span>
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
                            onClick={() =>
                                setQuantity(Math.min(effectiveStock, quantity + 1))
                            }
                            disabled={quantity >= effectiveStock}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <span className="text-sm text-muted-foreground">
                        {effectiveStock} available
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                        type="button"
                        className="flex-1"
                        onClick={() => handleAddToCart(false)}
                        disabled={effectiveStock === 0 || adding || !canAddToCart}
                    >
                        {adding ? "Adding..." : "Add to Cart"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleAddToCart(true)}
                        disabled={effectiveStock === 0 || ordering || !canAddToCart}
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
