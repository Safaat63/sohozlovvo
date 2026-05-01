"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { addToCart } from "@/actions/cart"
import { ShoppingCart, Minus, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { trackAddToCart } from "@/lib/ga4"

interface AddToCartButtonProps {
    productId: string
    productName?: string
    price?: number
    productBrand?: string | null
    productCategory?: string | null
    stock?: number
    variant?: "default" | "secondary" | "outline"
    className?: string
    simple?: boolean
    variationOptionId?: string
    requireSelection?: boolean
}

export function AddToCartButton({
    productId,
    productName,
    price,
    productBrand,
    productCategory,
    stock = 99,
    variant = "default",
    className,
    simple = false,
    variationOptionId,
    requireSelection = false,
}: AddToCartButtonProps) {
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleAddToCart() {
        if (requireSelection && !variationOptionId) {
            toast.error("Please select a variation")
            return
        }
        setLoading(true)
        const result = await addToCart(productId, quantity, variationOptionId)
        setLoading(false)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success(`Added ${quantity} item(s) to cart`)
            if (productName && typeof price === "number") {
                trackAddToCart({
                    item_id: productId,
                    item_name: productName,
                    price,
                    quantity,
                    item_brand: productBrand || undefined,
                    item_category: productCategory || undefined,
                })
            }
            router.refresh()
        }
    }

    if (simple) {
        return (
            <Button
                variant={variant}
                className={className}
                onClick={handleAddToCart}
                disabled={stock === 0 || loading || (requireSelection && !variationOptionId)}
            >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {loading ? "Adding..." : "Add to Cart"}
            </Button>
        )
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center gap-4">
                <span className="font-semibold">Quantity:</span>
                <div className="flex items-center border rounded-md">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2 min-w-15 text-center">{quantity}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                        disabled={quantity >= stock}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                    {stock} available
                </span>
            </div>

            <Button
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
                disabled={stock === 0 || loading || (requireSelection && !variationOptionId)}
            >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {loading ? "Adding..." : "Add to Cart"}
            </Button>
        </div>
    )
}
