"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Minus, Plus, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductVariationSelector } from "@/components/product-variation-selector"
import { addToCart } from "@/actions/cart"
import { toast } from "sonner"
import { formatCurrency, useCurrencySymbol } from "@/components/currency-provider"

interface VariationOption {
    id: string
    optionName: string
    isActive: boolean
}

interface Variation {
    id: string
    variationName: string
    options: VariationOption[]
}

interface ProductPurchaseSectionProps {
    productId: string
    stock: number
    basePrice: number
    variations: Variation[]
}

export function ProductPurchaseSection({
    productId,
    stock,
    basePrice,
    variations,
}: ProductPurchaseSectionProps) {
    const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>(undefined)
    const [selectedOptionName, setSelectedOptionName] = useState<string | undefined>(undefined)
    const [selectedOptionStock, setSelectedOptionStock] = useState<number | undefined>(undefined)
    const [priceAdjustment, setPriceAdjustment] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [adding, setAdding] = useState(false)
    const [ordering, setOrdering] = useState(false)

    const router = useRouter()
    const currency = useCurrencySymbol()

    const requiresSelection = variations.length > 0
    const effectivePrice = Math.max(0, basePrice + priceAdjustment)
    // Use selected variation stock if a variation is selected, otherwise use base product stock
    const effectiveStock = selectedOptionStock !== undefined ? selectedOptionStock : stock

    // Emit price change event for parent components
    useEffect(() => {
        const event = new CustomEvent("variation-price-change", {
            detail: { price: effectivePrice },
        })
        window.dispatchEvent(event)
    }, [effectivePrice])

    const handleAddToCart = async (redirectToCheckout = false) => {
        if (requiresSelection && !selectedOptionId) {
            toast.error("Please select a variation")
            return
        }

        const setLoading = redirectToCheckout ? setOrdering : setAdding
        setLoading(true)
        const result = await addToCart(productId, quantity, selectedOptionId)
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
            {variations.length > 0 && (
                <ProductVariationSelector
                    variations={variations}
                    basePrice={basePrice}
                    onVariationChange={(optionId, adjustment, optionName, optionStock) => {
                        setSelectedOptionId(optionId)
                        setSelectedOptionName(optionName)
                        setPriceAdjustment(adjustment)
                        setSelectedOptionStock(optionStock)
                        // Reset quantity if it exceeds the selected option's stock
                        if (optionStock !== undefined && quantity > optionStock) {
                            setQuantity(Math.max(1, optionStock))
                        }
                    }}
                />
            )}

            <div className="rounded-md border p-3 space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Selected price</span>
                    <span className="font-semibold">{formatCurrency(effectivePrice, currency)}</span>
                </div>
                {selectedOptionName && (
                    <div className="text-xs text-muted-foreground">
                        Option: {selectedOptionName}
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
                            onClick={() => setQuantity(Math.min(effectiveStock, quantity + 1))}
                            disabled={quantity >= effectiveStock}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <span className="text-sm text-muted-foreground">{effectiveStock} available</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                        type="button"
                        className="flex-1"
                        onClick={() => handleAddToCart(false)}
                        disabled={effectiveStock === 0 || adding || (requiresSelection && !selectedOptionId)}
                    >
                        {adding ? "Adding..." : "Add to Cart"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleAddToCart(true)}
                        disabled={effectiveStock === 0 || ordering || (requiresSelection && !selectedOptionId)}
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
