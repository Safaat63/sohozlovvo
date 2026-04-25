import { notFound } from "next/navigation"
import { getProduct, getProductTotalSold } from "@/actions/products"
import { getPublicSettings } from "@/actions/settings"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReviewForm } from "@/components/review-form"
import { WishlistButtonServer } from "@/components/wishlist-button-server"
import { ProductImageGallery } from "@/components/product-image-gallery"
import { ProductPurchaseWithCombinations } from "@/components/product-purchase-with-combinations"
import { ProductPriceDisplay } from "@/components/product-price-display"
import { SocialShare } from "@/components/social-share"
import { CompareButton } from "@/components/compare-button"
import { StockAlertButton } from "@/components/stock-alert-button"
import { TrackProductView } from "@/components/track-product-view"
import { TrackProductViewAnalytics } from "@/components/track-product-view-analytics"
import { ProductQRCode } from "@/components/product-qr-code"
import { RelatedProducts, YouMayAlsoLike } from "@/components/product-recommendations"
import { formatDateDhaka, calculateDiscountedPrice } from "@/lib/utils"
import { ScrollToTop } from "@/components/scroll-to-top"
import Image from "next/image"
import { MessageCircle, Truck, Shield, RotateCcw, Star, ChevronRight } from "lucide-react"
import Link from "next/link"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const product = await getProduct(slug)

    if (!product) {
        return {
            title: "Product Not Found",
        }
    }

    return {
        title: product.metaTitle || product.name,
        description: product.metaDescription || product.description,
    }
}

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const [product, session, settings] = await Promise.all([
        getProduct(slug),
        auth(),
        getPublicSettings(),
    ])

    if (!product) {
        notFound()
    }

    // Get total sold count
    const totalSold = await getProductTotalSold(product.id)

    const verifiedReviews = product.reviews || []

    const activeFlashSale = product.flashSales?.[0]

    // Calculate discounted price (flash sale takes priority over direct discount)
    const { finalPrice, hasDiscount, discountPercentage } = activeFlashSale
        ? {
            finalPrice: activeFlashSale.salePrice,
            hasDiscount: true,
            discountPercentage: Math.round(((Number(product.price) - Number(activeFlashSale.salePrice)) / Number(product.price)) * 100)
        }
        : calculateDiscountedPrice(
            Number(product.price),
            product.discountType,
            product.discountValue ? Number(product.discountValue) : null,
            product.discountStartDate,
            product.discountEndDate
        )

    const displayPrice = hasDiscount ? finalPrice : product.price
    const displayComparePrice = hasDiscount ? product.price : product.compareAtPrice
    const basePriceNumber = Number(displayPrice)

    // Prepare variations with proper structure
    const normalizedVariations = product.variations?.map((v) => ({
        id: v.id,
        variationName: v.variationName,
        options: v.options.map((o) => ({
            id: o.id,
            optionName: o.optionName,
            isActive: o.isActive,
            variationId: v.id,
            image: o.image || null,
            hexCode: o.hexCode || null,
        })),
    })) || []

    // Prepare combinations - apply product discount to all combination prices
    const normalizedCombinations = product.combinations?.map((combo) => {
        // Get the base combination price (custom or base product price)
        const originalComboPrice = combo.price !== null ? Number(combo.price) : Number(product.price)
        let discountedComboPrice = originalComboPrice

        // Apply product discount to combination price
        if (hasDiscount) {
            if (activeFlashSale) {
                // For flash sales, apply same discount ratio
                const discountRatio = Number(activeFlashSale.salePrice) / Number(product.price)
                discountedComboPrice = originalComboPrice * discountRatio
            } else if (product.discountType === "PERCENTAGE" && product.discountValue) {
                const discount = (originalComboPrice * Number(product.discountValue)) / 100
                discountedComboPrice = originalComboPrice - discount
            } else if (product.discountType === "FIXED_AMOUNT" && product.discountValue) {
                discountedComboPrice = originalComboPrice - Number(product.discountValue)
            }
            discountedComboPrice = Math.max(0, discountedComboPrice)
        }

        return {
            id: combo.id,
            sku: combo.sku,
            stock: combo.stock,
            price: discountedComboPrice,
            originalPrice: hasDiscount ? originalComboPrice : null,
            isActive: combo.isActive,
            options: combo.options.map((o) => ({
                id: o.id,
                optionId: o.optionId,
                option: {
                    id: o.option.id,
                    optionName: o.option.optionName,
                    variation: {
                        id: o.option.variation.id,
                        variationName: o.option.variation.variationName,
                    },
                },
            })),
        }
    }) || []

    // Calculate effective stock: if has combinations, sum of combo stocks; else base stock
    const effectiveStock = normalizedCombinations.length > 0
        ? normalizedCombinations.reduce((sum, c) => sum + c.stock, 0)
        : product.stock

    const whatsappNumber = settings.whatsapp_number?.replace(/[^0-9]/g, "") || ""

    // Get dynamic URL from headers
    const headersList = await import('next/headers').then(m => m.headers())
    const host = (await headersList).get('host') || "localhost:3000"
    const proto = (await headersList).get('x-forwarded-proto') || "http"
    const baseUrl = `${proto}://${host}`
    const productUrl = `${baseUrl}/products/${product.slug}`
    const whatsappLink = whatsappNumber
        ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I'm interested in ${product.name} (${productUrl}).`)}`
        : null

    return (
        <main className="min-h-screen bg-background-light dark:bg-[#1a1d23]">
            <ScrollToTop />
            <div className="max-w-300 mx-auto px-4 md:px-10 py-6 md:py-10">
                <TrackProductView productId={product.id} />
                <TrackProductViewAnalytics productId={product.id} slug={product.slug} />

                {/* Breadcrumbs */}
                <nav className="flex flex-wrap gap-2 py-2 mb-4 items-center">
                    <Link href="/" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">Home</Link>
                    <span className="text-muted-foreground text-sm">/</span>
                    {product.category && (
                        <>
                            <Link href={`/categories/${product.category.slug}`} className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                                {product.category.name}
                            </Link>
                            <span className="text-muted-foreground text-sm">/</span>
                        </>
                    )}
                    <span className="text-foreground text-sm font-semibold">{product.name}</span>
                </nav>

                {/* Product Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-4">
                    {/* Left Column: Gallery */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        <div className="relative">
                            {/* Action Buttons */}
                            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                                <WishlistButtonServer productId={product.id} variant="icon" className="size-10 bg-white/90 dark:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm" />
                                <SocialShare
                                    url={productUrl}
                                    title={product.name}
                                    description={product.description || undefined}
                                />
                            </div>
                            <ProductImageGallery images={product.images} productName={product.name} />
                        </div>
                    </div>

                    {/* Right Column: Product Info */}
                    <div className="lg:col-span-5 relative">
                        <div className="lg:sticky lg:top-24 flex flex-col gap-6 p-6 bg-card rounded-xl shadow-soft border border-border">
                            {/* Header */}
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    {activeFlashSale && (
                                        <span className="px-2.5 py-1 rounded-full bg-accent text-white text-[10px] font-bold uppercase tracking-wide">Flash Sale</span>
                                    )}
                                    {!activeFlashSale && hasDiscount && discountPercentage && (
                                        <span className="px-2.5 py-1 rounded-full bg-accent text-white text-[10px] font-bold uppercase tracking-wide">{discountPercentage}% OFF</span>
                                    )}
                                    {product.stock === 0 ? (
                                        <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold uppercase tracking-wide">Out of Stock</span>
                                    ) : product.stock <= product.lowStockAlert ? (
                                        <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-[10px] font-bold uppercase tracking-wide">Only {product.stock} left</span>
                                    ) : (
                                        <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold uppercase tracking-wide">In Stock</span>
                                    )}
                                </div>

                                {product.brand && (
                                    <p className="text-xs text-primary font-medium uppercase tracking-wide">{product.brand}</p>
                                )}

                                <h1 className="text-foreground tracking-tight text-2xl lg:text-3xl font-extrabold leading-tight">{product.name}</h1>

                                {/* Rating */}
                                {Number(product.rating) > 0 && (
                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="flex gap-0.5 text-amber-400">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} className={`w-5 h-5 ${i < Math.floor(parseFloat(product.rating.toString())) ? "fill-current" : "text-gray-300 dark:text-gray-600"}`} />
                                            ))}
                                        </div>
                                        <a href="#reviews" className="text-sm font-medium text-primary hover:underline">
                                            {verifiedReviews.length} reviews
                                        </a>
                                    </div>
                                )}

                                {/* Items Sold */}
                                {totalSold > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                            <span className="font-bold text-foreground">{totalSold}</span> items sold
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Price */}
                            <ProductPriceDisplay
                                basePrice={basePriceNumber}
                                compareAtPrice={displayComparePrice ? Number(displayComparePrice) : null}
                                hasDiscount={hasDiscount}
                                discountPercentage={discountPercentage}
                            />

                            {activeFlashSale && (
                                <p className="text-sm text-muted-foreground">
                                    Sale ends {formatDateDhaka(activeFlashSale.endDate, "PPP")}
                                </p>
                            )}

                            {/* Short Description */}
                            {product.description && (
                                <p className="text-muted-foreground leading-relaxed text-sm line-clamp-3">
                                    {product.description}
                                </p>
                            )}

                            <div className="h-px bg-border w-full"></div>

                            {/* Variations & Add to Cart */}
                            {effectiveStock > 0 ? (
                                <div className="space-y-4">
                                    <ProductPurchaseWithCombinations
                                        productId={product.id}
                                        baseStock={product.stock}
                                        basePrice={basePriceNumber}
                                        variations={normalizedVariations}
                                        combinations={normalizedCombinations}
                                        productDiscount={{
                                            discountType: product.discountType,
                                            discountValue: product.discountValue ? Number(product.discountValue) : null,
                                            discountStartDate: product.discountStartDate,
                                            discountEndDate: product.discountEndDate,
                                            originalPrice: Number(product.price),
                                        }}
                                    />

                                    <div className="flex flex-col gap-3">
                                        {whatsappLink && (
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="w-full h-12 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/60 font-bold rounded-xl"
                                            >
                                                <a href={whatsappLink} target="_blank" rel="noreferrer">
                                                    <MessageCircle className="h-4 w-4 mr-2" />
                                                    Order on WhatsApp
                                                </a>
                                            </Button>
                                        )}
                                    </div>

                                    <CompareButton productId={product.id} />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <StockAlertButton productId={product.id} productName={product.name} />
                                    <CompareButton productId={product.id} />
                                </div>
                            )}

                            <ProductQRCode
                                productName={product.name}
                                productUrl={`/products/${product.slug}`}
                            />

                            {/* Trust Signals */}
                            <div className="grid grid-cols-3 gap-2 pt-2">
                                <div className="flex flex-col items-center justify-center text-center gap-1 p-2">
                                    <Truck className="w-5 h-5 text-primary" />
                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Countrywide Shipping</span>
                                </div>
                                <div className="flex flex-col items-center justify-center text-center gap-1 p-2 border-l border-r border-border">
                                    <Shield className="w-5 h-5 text-primary" />
                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Warranty</span>
                                </div>
                                <div className="flex flex-col items-center justify-center text-center gap-1 p-2">
                                    <RotateCcw className="w-5 h-5 text-primary" />
                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Easy Return</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="mt-16 md:mt-20">
                    {/* Description Section */}
                    <div className="py-10 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 border-b border-border">
                        <div className="lg:col-span-2 text-muted-foreground leading-relaxed space-y-6">
                            <h3 className="text-2xl font-bold text-foreground">Product Description</h3>
                            {product.description && (
                                <p className="whitespace-pre-line">{product.description}</p>
                            )}
                        </div>

                        {/* Specifications Sidebar */}
                        {product.specifications && product.specifications.length > 0 && (
                            <div className="bg-muted rounded-2xl p-6 h-fit">
                                <h4 className="font-bold text-foreground mb-4">Technical Specifications</h4>
                                <div className="flex flex-col gap-3">
                                    {product.specifications.map((spec) => (
                                        <div key={spec.id} className="flex justify-between py-2 border-b border-border last:border-b-0">
                                            <span className="text-muted-foreground text-sm">{spec.key}</span>
                                            <span className="font-medium text-foreground text-sm">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Reviews Section */}
                    <div className="py-10 border-b border-border" id="reviews">
                        <h3 className="text-2xl font-bold text-foreground mb-8">Customer Reviews</h3>
                        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                            {/* Rating Summary */}
                            <div className="w-full lg:w-1/3 flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <p className="text-foreground text-5xl font-black leading-tight tracking-tight">{Number(product.rating).toFixed(1)}</p>
                                    <div className="flex gap-1 text-amber-400">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} className={`w-6 h-6 ${i < Math.floor(parseFloat(product.rating.toString())) ? "fill-current" : "text-gray-200 dark:text-gray-600"}`} />
                                        ))}
                                    </div>
                                    <p className="text-muted-foreground text-base font-medium">Based on {verifiedReviews.length} reviews</p>
                                </div>

                                {/* Review Form CTA */}
                                {session?.user ? (
                                    <Card className="bg-card border-border">
                                        <CardHeader className="p-4 pb-2">
                                            <CardTitle className="text-lg text-foreground">Write a Review</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0">
                                            <ReviewForm productId={product.id} />
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="p-4 bg-muted rounded-xl text-center">
                                        <p className="text-sm text-muted-foreground mb-3">Please sign in to write a review</p>
                                        <Link href="/auth/login" className="inline-block w-full py-3 border border-foreground text-foreground font-bold rounded-xl hover:bg-foreground hover:text-background transition-colors text-sm">
                                            Sign In to Review
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Review Cards */}
                            <div className="w-full lg:w-2/3 flex flex-col gap-6">
                                {verifiedReviews.length > 0 ? (
                                    verifiedReviews.map((review) => (
                                        <div key={review.id} className="p-6 bg-card rounded-xl border border-border">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                                                        {review.user.name?.charAt(0) || "U"}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-foreground text-sm">{review.user.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {review.isVerified && "Verified Buyer • "}
                                                            {formatDateDhaka(review.createdAt, "PP")}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-0.5 text-amber-400">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-gray-300"}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            {review.title && (
                                                <h5 className="font-bold text-foreground mb-2">{review.title}</h5>
                                            )}
                                            {review.comment && (
                                                <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>
                                            )}
                                            {review.images && review.images.length > 0 && (
                                                <div className="flex gap-2 mt-4">
                                                    {review.images.map((image, index) => (
                                                        <Image
                                                            key={index}
                                                            src={image}
                                                            alt={`Review ${index + 1}`}
                                                            width={80}
                                                            height={80}
                                                            className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg"
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 bg-muted rounded-xl text-center">
                                        <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                <div className="py-12 border-t border-border">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-foreground">You might also like</h2>
                        <Link href="/products" className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                            View all <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <RelatedProducts
                        productId={product.id}
                        categoryId={product.categoryId}
                        limit={4}
                    />
                </div>

                {/* You May Also Like */}
                <YouMayAlsoLike productId={product.id} limit={4} />
            </div>
        </main>
    )
}
