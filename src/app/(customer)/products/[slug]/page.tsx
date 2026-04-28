import { notFound } from "next/navigation"
import { getProduct } from "@/actions/products"
import { getPublicSettings } from "@/actions/settings"
import { auth } from "@/lib/auth"
import { ReviewForm } from "@/components/review-form"
import { TrackProductView } from "@/components/track-product-view"
import { TrackProductViewAnalytics } from "@/components/track-product-view-analytics"
import { RelatedProducts } from "@/components/product/product-recommendations"
import { calculateDiscountedPrice, formatDateDhaka } from "@/lib/utils"
import { ScrollToTop } from "@/components/scroll-to-top"
import Link from "next/link"
import { Star } from "lucide-react"

import {
    ProductPriceDisplay,
    ProductImageGallery,
    ProductPurchaseWithCombinations,
    ProductJumpLinks
} from "@/components/product/product-client-ui"

function getEmbedUrl(url: string) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
}


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const product = await getProduct(slug)

    if (!product) return { title: "Product Not Found" }
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

    if (!product) notFound()

    const verifiedReviews = product.reviews || []
    const activeFlashSale = product.flashSales?.[0]
    const videoUrl = product.youtubeUrls?.[0] || null

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

    const normalizedCombinations = product.combinations?.map((combo) => {
        const originalComboPrice = combo.price !== null ? Number(combo.price) : Number(product.price)
        let discountedComboPrice = originalComboPrice

        if (hasDiscount) {
            if (activeFlashSale) {
                const discountRatio = Number(activeFlashSale.salePrice) / Number(product.price)
                discountedComboPrice = originalComboPrice * discountRatio
            } else if (product.discountType === "PERCENTAGE" && product.discountValue) {
                discountedComboPrice = originalComboPrice - ((originalComboPrice * Number(product.discountValue)) / 100)
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

    const whatsappNumber = settings.whatsapp_number?.replace(/[^0-9]/g, "") || ""
    const callNumber = settings.store_phone || ""

    const headersList = await import('next/headers').then(m => m.headers())
    const host = headersList.get('host') || "localhost:3000"
    const proto = headersList.get('x-forwarded-proto') || "http"
    const productUrl = `${proto}://${host}/products/${product.slug}`

    const whatsappLink = whatsappNumber
        ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello! I'm interested in:\nProduct: ${product.name}\nProduct URL: ${productUrl}`)}`
        : null

    const productRating = Number(product.rating || 0);

    return (
        <>
            <div className="min-h-screen bg-[#FBF9F5] pb-12 font-sans relative">
                <ScrollToTop />

                {/* Breadcrumbs */}
                <div className="bg-[#FBF9F5] py-4">
                    <div className="container mx-auto px-4 md:px-10">
                        <ul className="flex flex-wrap gap-2 items-center text-sm">
                            <li><Link href="/" className="text-gray-500 hover:text-[#f48721]">Home</Link></li>
                            <li className="text-gray-400">&gt;</li>
                            <li className="text-[#222831] font-semibold">Products</li>
                        </ul>
                    </div>
                </div>

                <div className="mx-auto px-4 md:px-10">
                    <TrackProductView productId={product.id} />
                    <TrackProductViewAnalytics productId={product.id} slug={product.slug} />

                    {/* Main Product Top Container */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-5 md:p-8 rounded-xl border border-[#eaeaea] shadow-sm">

                        <div className="w-full relative">
                            <ProductImageGallery images={product.images} productName={product.name} />
                        </div>

                        <div className="w-full flex flex-col pt-1">
                            <h1 className="text-[#222831] text-[22px] md:text-[28px] font-bold leading-tight mb-1">
                                {product.name}
                            </h1>

                            <ProductPriceDisplay
                                basePrice={basePriceNumber}
                                compareAtPrice={displayComparePrice ? Number(displayComparePrice) : null}
                                hasDiscount={hasDiscount}
                                discountPercentage={discountPercentage}
                            />

                            <hr className="border-[#eaeaea] my-5" />

                            <ProductPurchaseWithCombinations
                                productId={product.id}
                                baseStock={product.stock}
                                basePrice={basePriceNumber}
                                variations={normalizedVariations}
                                combinations={normalizedCombinations}
                                whatsappLink={whatsappLink}
                                callNumber={callNumber}
                            />

                            {product.brand && (
                                <div className="mt-8 border border-[#eaeaea] rounded px-4 py-2 inline-flex items-center gap-3 w-max">
                                    <span className="text-sm font-medium text-[#222831]">Brand:</span>
                                    <span className="font-bold text-lg text-black tracking-wide uppercase">{product.brand}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Linear Product Sections */}
                    <div className="mt-8 bg-white rounded-xl border border-[#eaeaea] shadow-sm relative">

                        {/* Sticky Jump Navigation */}
                        <ProductJumpLinks hasVideo={!!videoUrl} reviewCount={verifiedReviews.length} />

                        {/* Content Area */}
                        <div className="p-6 md:p-8">

                            {/* Description Section */}
                            <div id="description" className="mb-12 scroll-mt-24">
                                <h3 className="text-[18px] font-bold text-[#222831] mb-5 inline-block border-b-[3px] border-[#f48721] pb-1">
                                    Product Details
                                </h3>
                                <div className="text-[#252a34] leading-loose text-sm md:text-[15px] space-y-6">
                                    <p className="whitespace-pre-line">{product.description}</p>
                                </div>

                                {product.specifications && product.specifications.length > 0 && (
                                    <div className="mt-8 bg-[#FBF9F5] rounded border border-[#eaeaea] p-5">
                                        <h4 className="font-bold text-[#222831] mb-4">Specifications</h4>
                                        <div className="flex flex-col">
                                            {product.specifications.map((spec: any, idx: number) => (
                                                <div key={spec.id} className={`flex py-2 px-4 ${idx % 2 === 0 ? 'bg-white' : ''} border-b border-[#eaeaea] last:border-b-0`}>
                                                    <span className="text-[#252a34] font-medium w-1/3">{spec.key}</span>
                                                    <span className="text-[#252a34] w-2/3">{spec.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Video Section */}
                            {videoUrl && (
                                <div id="video" className="mb-12 pt-8 border-t border-[#eaeaea] scroll-mt-24">
                                    <h3 className="text-[18px] font-bold text-[#222831] mb-5 inline-block border-b-[3px] border-[#f48721] pb-1">
                                        Video
                                    </h3>
                                    <div className="w-full h-62.5 sm:h-87.5 md:h-115 bg-black rounded overflow-hidden relative shadow-md">
                                        <iframe
                                            src={getEmbedUrl(videoUrl)}
                                            className="absolute top-0 left-0 w-full h-full border-0"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                </div>
                            )}

                            {/* Reviews Section */}
                            <div id="reviews" className="pt-8 border-t border-[#eaeaea] scroll-mt-24">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                                    {/* Left: Rating Breakdown */}
                                    <div className="lg:col-span-4">
                                        <div className="flex items-center gap-4 mb-3">
                                            <span className="text-[54px] font-bold text-[#222831] leading-none tracking-tight">
                                                {productRating.toFixed(1)}
                                            </span>
                                            <div>
                                                <p className="text-[#252a34] font-medium text-sm mb-1">Average Rating</p>
                                                <div className="flex gap-1 text-gray-300 text-sm">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(productRating) ? "fill-[#f48721] text-[#f48721]" : ""}`} />
                                                    ))}
                                                    <span className="ml-2">({verifiedReviews.length} Reviews)</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm font-bold text-[#222831] mb-6">0.00% <span className="font-normal text-gray-500">Recommended (0 of 0)</span></p>

                                        <div className="space-y-3">
                                            {[5, 4, 3, 2, 1].map((stars) => (
                                                <div key={stars} className="flex items-center gap-3">
                                                    <div className="flex gap-0.5">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star key={i} className={`w-3 h-3 ${i < stars ? "fill-[#f48721] text-[#f48721]" : "fill-[#eaeaea] text-[#eaeaea]"}`} />
                                                        ))}
                                                    </div>
                                                    <div className="flex-1 h-1.5 bg-[#eaeaea] rounded-full"></div>
                                                    <span className="text-xs text-gray-500 w-6 text-right">0%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right: Form & Reviews */}
                                    <div className="lg:col-span-8">
                                        {session?.user ? (
                                            <div className="mb-10">
                                                <h3 className="text-[18px] font-bold text-[#222831] mb-3 inline-block border-b-[3px] border-[#f48721] pb-1">
                                                    Submit Your Review
                                                </h3>
                                                <p className="text-sm text-[#252a34] mb-5">Your email address will not be published. Required fields are marked *</p>

                                                <ReviewForm productId={product.id} />
                                            </div>
                                        ) : (
                                            <div className="mb-10 p-6 bg-[#FBF9F5] border border-[#eaeaea] rounded text-center">
                                                <p className="text-sm text-[#252a34] mb-3">Please sign in to write a review</p>
                                                <Link href="/auth/login" className="inline-block py-2 px-6 bg-[#333333] text-white font-bold rounded hover:bg-black transition-colors text-sm">
                                                    Sign In
                                                </Link>
                                            </div>
                                        )}

                                        {/* Existing Reviews list */}
                                        <div className="space-y-4">
                                            {verifiedReviews.length > 0 ? (
                                                verifiedReviews.map((review) => (
                                                    <div key={review.id} className="py-4 border-b border-[#eaeaea] last:border-0">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="flex gap-0.5">
                                                                {Array.from({ length: 5 }).map((_, i) => (
                                                                    <Star key={i} className={`w-3.5 h-3.5 ${i < Number(review.rating) ? "fill-[#f48721] text-[#f48721]" : "fill-[#eaeaea] text-[#eaeaea]"}`} />
                                                                ))}
                                                            </div>
                                                            <span className="font-bold text-sm text-[#222831] ml-2">{review.user.name}</span>
                                                            <span className="text-xs text-gray-400">• {formatDateDhaka(review.createdAt, "PP")}</span>
                                                        </div>
                                                        {review.title && <h5 className="font-bold text-[#222831] mb-1 text-sm">{review.title}</h5>}
                                                        {review.comment && <p className="text-[#555] text-sm">{review.comment}</p>}
                                                    </div>
                                                ))
                                            ) : null}
                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Related Products */}
                    <div className="py-12 mt-4">
                        <div className="flex items-center justify-between mb-6 border-b border-[#eaeaea] pb-3">
                            <h2 className="text-xl font-bold text-[#222831] uppercase">Related Products</h2>
                        </div>
                        <RelatedProducts productId={product.id} categoryId={product.categoryId} limit={4} />
                    </div>
                </div>
            </div>
        </>
    )
}