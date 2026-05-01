"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart, Zap, GitCompare } from "lucide-react"
import { toggleWishlist } from "@/actions/wishlist"
import { addToCart } from "@/actions/cart"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ProductPurchaseSection } from "@/components/product/product-purchase"
import { formatCurrency, useCurrencySymbol } from "@/components/providers/currency-provider"
import { calculateDiscountedPrice } from "@/lib/utils"
import { trackAddToCart, trackAddToWishlist, trackRemoveFromWishlist } from "@/lib/ga4"

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
        variations?: Variation[]
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
    initialInWishlist?: boolean
    whatsappNumber?: string
    priority?: boolean
}

export function ProductCard({ product, initialInWishlist = false, whatsappNumber, priority = false }: ProductCardProps) {
    const [inWishlist, setInWishlist] = useState(initialInWishlist)
    const [isWishlistPending, setIsWishlistPending] = useState(false)
    const [isCartPending, setIsCartPending] = useState(false)
    const [isOrderPending, setIsOrderPending] = useState(false)
    const [isComparePending, setIsComparePending] = useState(false)
    const [showQuickView, setShowQuickView] = useState(false)
    const [inComparison, setInComparison] = useState(() => {
        if (typeof window === "undefined") return false
        const comparison = window.localStorage.getItem("productComparison")
        if (!comparison) return false
        try {
            const products: string[] = JSON.parse(comparison)
            return products.includes(product.id)
        } catch {
            return false
        }
    })
    const router = useRouter()
    const currency = useCurrencySymbol()

    // Check for active flash sale
    const now = new Date()
    const activeFlashSale = product.flashSales?.find((fs) =>
        fs.isActive &&
        new Date(fs.startDate) <= now &&
        new Date(fs.endDate) >= now
    )

    // Calculate discounted price (flash sale takes priority over direct discount)
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

    const hasVariations = Array.isArray(product.variations) && product.variations.length > 0
    const cleanWhatsapp = whatsappNumber && whatsappNumber.replace(/[^0-9]/g, "")
    const whatsappLink = cleanWhatsapp
        ? `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(`Hi, I'm interested in ${product.name} (${process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}` : `/products/${product.slug}`}).`)}`
        : null

    const handleQuickView = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setShowQuickView(true)
    }

    const handleToggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsWishlistPending(true)

        const result = await toggleWishlist(product.id)
        if (result.error) {
            if (result.error.includes("login")) {
                router.push("/auth/login")
            }
        } else {
            const wasInWishlist = inWishlist
            setInWishlist(!inWishlist)
            if (wasInWishlist) {
                trackRemoveFromWishlist({
                    item_id: product.id,
                    item_name: product.name,
                    price: displayPrice,
                    item_brand: product.brand || undefined,
                })
            } else {
                trackAddToWishlist({
                    item_id: product.id,
                    item_name: product.name,
                    price: displayPrice,
                    item_brand: product.brand || undefined,
                })
            }
        }
        setIsWishlistPending(false)
    }

    const handleToggleCompare = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (isComparePending) return

        setIsComparePending(true)

        const comparison = localStorage.getItem("productComparison")
        let products: string[] = []

        if (comparison) {
            try {
                products = JSON.parse(comparison)
            } catch {
                products = []
            }
        }

        if (products.includes(product.id)) {
            products = products.filter((id) => id !== product.id)
            setInComparison(false)
            toast.success("Removed from comparison", { duration: 1500 })
        } else {
            if (products.length >= 4) {
                toast.error("You can compare up to 4 products at a time")
                setIsComparePending(false)
                return
            }
            products.push(product.id)
            setInComparison(true)
            toast.success("Added to comparison", { duration: 1500 })
        }

        localStorage.setItem("productComparison", JSON.stringify(products))
        window.dispatchEvent(new Event("comparisonUpdated"))
        setIsComparePending(false)
    }

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (hasVariations) {
            // For variable products, open quick view to pick an option first
            setShowQuickView(true)
            return
        }

        setIsCartPending(true)

        const result = await addToCart(product.id, 1)
        setIsCartPending(false)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Added to cart", { duration: 1500 })
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
        e.stopPropagation()

        if (hasVariations) {
            setShowQuickView(true)
            return
        }

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

    const rating = product.rating ?? 0

    return (
        <>
            <Link href={`/products/${product.slug}`}>
                <Card className="pt-0 h-full hover:shadow-lg transition-all duration-300 group overflow-hidden border-0 shadow-sm dark:shadow-gray-800 rounded-2xl">
                    <div className="aspect-square bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden rounded-t-2xl">
                        {product.images[0] ? (
                            <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                priority={priority}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
                                No Image
                            </div>
                        )}

                        {/* Badges */}
                        {product.stock === 0 && (
                            <Badge className="absolute top-2 left-2 text-xs" variant="destructive">
                                Out of Stock
                            </Badge>
                        )}
                        {activeFlashSale && (
                            <Badge className="absolute top-2 left-2 text-xs bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white animate-pulse">
                                <Zap className="h-3 w-3 mr-1" />
                                FLASH {discountPercentage}% OFF
                            </Badge>
                        )}
                        {!activeFlashSale && hasDiscount && discountPercentage && (
                            <Badge className="absolute top-2 left-2 text-xs bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white">
                                {discountPercentage}% OFF
                            </Badge>
                        )}
                        {!activeFlashSale && !hasDiscount && product.compareAtPrice !== null && product.compareAtPrice !== undefined && product.compareAtPrice > product.price && (
                            <Badge className="absolute top-2 left-2 text-xs bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white">
                                {Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)}% OFF
                            </Badge>
                        )}

                        {/* Action Buttons - Always visible on mobile, hover on desktop */}
                        <div className="absolute top-2 right-2 flex gap-1">
                            <Button
                                variant="secondary"
                                size="icon"
                                className={cn(
                                    "h-8 w-8 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 shadow-md transition-all",
                                    "opacity-100 md:opacity-0 md:group-hover:opacity-100",
                                    inWishlist && "opacity-100! text-red-500"
                                )}
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleToggleWishlist(e)
                                }}
                                disabled={isWishlistPending}
                            >
                                <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
                            </Button>
                            <Button
                                variant="secondary"
                                size="icon"
                                disabled={isComparePending}
                                className={cn(
                                    "h-8 w-8 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 shadow-md transition-all",
                                    "opacity-100 md:opacity-0 md:group-hover:opacity-100",
                                    inComparison && "opacity-100! text-blue-500"
                                )}
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleToggleCompare(e)
                                }}
                            >
                                <GitCompare className={cn("h-4 w-4", inComparison && "fill-current")} />
                            </Button>
                        </div>
                    </div>

                    <CardContent className="pt-0 pb-0 pl-2.5 pr-2.5 md:pt-0 md:pb-3 md:pl-3 md:pr-3 space-y-0">
                        {product.brand && (
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                {product.brand || '\u00A0'}
                            </p>
                        )}
                        <h3 className="font-medium line-clamp-2 text-sm leading-tight">
                            {product.name}
                        </h3>

                        {/* Price and Rating Row */}
                        <div className="space-y-1.5">
                            <div className="flex items-baseline gap-2">
                                <span className="text-base md:text-lg font-bold text-primary">
                                    {formatCurrency(displayPrice, currency)}
                                </span>
                                {displayComparePrice !== null && displayComparePrice !== undefined && displayComparePrice > displayPrice && (
                                    <span className="text-xs text-muted-foreground line-through">
                                        {formatCurrency(displayComparePrice, currency)}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-1 text-xs min-h-4">
                                {rating > 0 ? (
                                    <>
                                        <span className="text-yellow-500">★</span>
                                        <span className="font-medium">{rating.toFixed(1)}</span>
                                        {product.reviewCount !== undefined && product.reviewCount > 0 && (
                                            <span className="text-muted-foreground">
                                                ({product.reviewCount})
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <span className="text-muted-foreground mb-1">No reviews yet</span>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex gap-1.5">
                                <Button
                                    size="sm"
                                    className="flex-1 h-7 text-xs rounded-3xl hover:bg-accent hover:text-primary-foreground transition-colors"
                                    disabled={product.stock === 0 || isCartPending}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        handleAddToCart(e)
                                    }}
                                >
                                    {isCartPending ? (
                                        "Adding..."
                                    ) : (
                                        <>
                                            <ShoppingCart className="h-3 w-3 mr-1" />
                                            {hasVariations ? "Choose" : "Add"}
                                        </>
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="flex-1 h-7 text-xs rounded-3xl hover:bg-primary hover:text-primary-foreground transition-colors"
                                    disabled={product.stock === 0 || isOrderPending}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        handleOrderNow(e)
                                    }}
                                >
                                    {isOrderPending ? "..." : (
                                        <>
                                            <Zap className="h-3 w-3 mr-1 hidden sm:inline" />
                                            <span className="sm:hidden">Buy</span>
                                            <span className="hidden sm:inline">Order Now</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full h-7 text-xs rounded-3xl hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleQuickView(e)
                                }}
                            >
                                Quick View
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </Link>

            <Dialog open={showQuickView} onOpenChange={setShowQuickView}>
                <DialogContent className="max-w-lg w-full">
                    <DialogHeader>
                        <DialogTitle className="text-lg">Choose options</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="h-20 w-20 relative rounded-md overflow-hidden bg-muted">
                                {product.images[0] ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        sizes="80px"
                                    />
                                ) : null}
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-semibold leading-tight line-clamp-2">{product.name}</p>
                                <p className="text-base font-bold text-primary">{formatCurrency(displayPrice, currency)}</p>
                                {hasDiscount && (
                                    <p className="text-xs text-muted-foreground line-through">
                                        {formatCurrency(product.price, currency)}
                                    </p>
                                )}
                            </div>
                        </div>

                        {hasVariations ? (
                            <div className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    This product has multiple options. View the full product page to select your preferred variant.
                                </p>
                                <Button
                                    asChild
                                    className="w-full"
                                >
                                    <Link href={`/products/${product.slug}`}>
                                        View Options
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <ProductPurchaseSection
                                productId={product.id}
                                productName={product.name}
                                stock={product.stock}
                                basePrice={displayPrice}
                                variations={[]}
                                productBrand={product.brand}
                            />
                        )}

                        {whatsappLink && (
                            <Button
                                asChild
                                variant="outline"
                                className="w-full bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            >
                                <a href={whatsappLink} target="_blank" rel="noreferrer">
                                    Order on WhatsApp
                                </a>
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
