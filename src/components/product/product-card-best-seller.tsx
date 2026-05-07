"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Flame } from "lucide-react"
import { addToCart } from "@/actions/cart"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { formatCurrency, useCurrencySymbol } from "@/components/providers/currency-provider"
import { calculateDiscountedPrice } from "@/lib/utils"
import { trackAddToCart } from "@/lib/ga4"

interface ProductCardProps {
    product: {
        id: string
        name: string
        slug: string
        price: number
        compareAtPrice?: number | null
        images: string[]
        stock: number
        brand?: string | null
        rating?: number | null
        reviewCount?: number
        description?: string | null
        lowStockAlert?: number | null
        discountType?: string | null
        discountValue?: number | null
        discountStartDate?: Date | null
        discountEndDate?: Date | null
        flashSales?: {
            id: string
            salePrice: number
            startDate: Date
            endDate: Date
            isActive: boolean
        }[]
    }
}

export function ProductCardBestSeller({ product }: ProductCardProps) {
    const [isCartPending, setIsCartPending] = useState(false)
    const [isOrderPending, setIsOrderPending] = useState(false)
    const router = useRouter()
    const currency = useCurrencySymbol()

    // Logic: Check for active flash sale
    const now = new Date()
    const activeFlashSale = product.flashSales?.find((fs) =>
        fs.isActive &&
        new Date(fs.startDate) <= now &&
        new Date(fs.endDate) >= now
    )

    // Logic: Calculate discounted price
    const { finalPrice, hasDiscount, discountPercentage } = activeFlashSale
        ? {
            finalPrice: activeFlashSale.salePrice,
            hasDiscount: true,
            discountPercentage: Math.round(((product.price - activeFlashSale.salePrice) / product.price) * 100)
        }
        : calculateDiscountedPrice(
            product.price,
            product.discountType,
            product.discountValue ? Number(product.discountValue) : null,
            product.discountStartDate,
            product.discountEndDate
        )

    const displayPrice = hasDiscount ? finalPrice : product.price
    const displayComparePrice = hasDiscount ? product.price : product.compareAtPrice
    const savings = displayComparePrice ? displayComparePrice - displayPrice : 0

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault()
        setIsCartPending(true)
        const result = await addToCart(product.id, 1)
        setIsCartPending(false)
        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Added to cart", {duration: 1000})
            trackAddToCart({
                item_id: product.id,
                item_name: product.name,
                price: displayPrice,
                quantity: 1,
                item_brand: product.brand || undefined,
            })
            router.refresh()
        }
    }

    const handleOrderNow = async (e: React.MouseEvent) => {
        e.preventDefault()
        setIsOrderPending(true)
        const result = await addToCart(product.id, 1)
        setIsOrderPending(false)
        if (result?.error) {
            toast.error(result.error)
        } else {
            trackAddToCart({
                item_id: product.id,
                item_name: product.name,
                price: displayPrice,
                quantity: 1,
                item_brand: product.brand || undefined,
            })
            router.push("/checkout")
        }
    }

    return (
        <div className="group relative flex flex-col md:flex-row items-stretch rounded-xl border border-border bg-card transition-all hover:shadow-lg w-full h-full overflow-hidden">

            {/* Badge - Top Right */}
            {(activeFlashSale || hasDiscount) && (
                <div className="absolute right-0 top-0 flex items-center gap-1 rounded-bl-lg rounded-tr-xl bg-destructive px-2 py-1 text-[10px] md:text-xs font-bold text-destructive-foreground z-10">
                    <Flame size={12} fill="currentColor" />
                    {activeFlashSale ? "Flash Sale" : "Offered Items"}
                </div>
            )}

            {/* Product Image Area */}
            {/* On mobile: aspect-square (full width). On md+: fixed width percentage, full height */}
            <div className="w-full md:w-[40%] lg:w-[45%] shrink-0 relative aspect-[4/3] md:aspect-auto md:min-h-[240px] flex items-center justify-center p-3 md:p-5 bg-card">
                <Link href={`/products/${product.slug}/`} className="block w-full h-full relative flex items-center justify-center">
                    {product.images[0] ? (
                        <Image
                            className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                            src={product.images[0]}
                            alt={product.name}
                            height={300}
                            width={300}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground rounded-lg">
                            No Image
                        </div>
                    )}
                </Link>
            </div>

            {/* Product Content Area */}
            <div className="flex flex-col justify-between w-full md:w-[60%] lg:w-[55%] p-3 md:p-6 md:pl-0 h-full">
                <div>
                    <Link
                        href={`/products/${product.slug}/`}
                        className="text-sm md:text-xl font-bold text-card-foreground hover:text-primary line-clamp-2 transition-colors leading-snug"
                    >
                        {product.name}
                    </Link>

                    {/* Pricing */}
                    <div className="mt-1 md:mt-2 flex flex-wrap items-center gap-1.5 md:gap-3">
                        <span className="text-base md:text-lg font-bold text-primary">
                            {formatCurrency(displayPrice, currency)}
                        </span>
                        {displayComparePrice && displayComparePrice > displayPrice && (
                            <span className="text-xs md:text-sm text-muted-foreground line-through">
                                {formatCurrency(displayComparePrice, currency)}
                            </span>
                        )}
                    </div>

                    {/* Save Badge */}
                    <div className="mt-1.5 md:mt-2 mb-3 md:mb-6 min-h-[20px]">
                        {savings > 0 && (
                            <span className="rounded-full bg-[#34BE82] px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-[11px] font-bold text-primary-foreground inline-block">
                                Save {formatCurrency(savings, currency)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions (Buttons) */}
                <div className="flex items-center gap-1.5 md:gap-2 mt-auto w-full pt-2">
                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0 || isCartPending}
                        className="flex-1 h-9 md:h-10 flex items-center justify-center gap-1 md:gap-2 rounded-sm border border-primary text-[11px] md:text-sm font-bold text-primary transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed px-1 md:px-2"
                    >
                        <ShoppingCart size={16} className="w-[14px] h-[14px] md:w-[18px] md:h-[18px]" />
                        <span className="truncate">{isCartPending ? "..." : "Add To Cart"}</span>
                    </button>

                    <button
                        onClick={handleOrderNow}
                        disabled={product.stock === 0 || isOrderPending}
                        className="flex-1 h-9 md:h-10 flex items-center justify-center gap-1 md:gap-2 rounded-sm border border-primary bg-primary text-[11px] md:text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed px-1 md:px-2"
                    >
                        <ShoppingCart size={16} className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />
                        <span className="truncate">{isOrderPending ? "..." : "Buy now"}</span>
                    </button>
                </div>
            </div>
        </div>
    )
}