import { notFound } from "next/navigation";
import { getProduct } from "@/actions/products";
import { getPublicSettings } from "@/actions/settings";
import { auth } from "@/lib/auth";
import { ReviewForm } from "@/components/product/review-form";
import { TrackProductView } from "@/components/analytics/track-product-view";
import { TrackProductViewAnalytics } from "@/components/analytics/track-product-view-analytics";
import { Ga4ViewItem } from "@/components/analytics/ga4-view-item";
import { RelatedProducts } from "@/components/product/product-recommendations";
import { calculateDiscountedPrice, formatDateDhaka } from "@/lib/utils";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import Link from "next/link";
import Script from "next/script";
import { Star } from "lucide-react";
import {
  ProductPriceDisplay,
  ProductImageGallery,
  ProductPurchaseWithCombinations,
  ProductJumpLinks,
} from "@/components/product/product-client-ui";

function getEmbedUrl(url: string) {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}`
    : url;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return { title: "Product Not Found" };
  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, session, settings] = await Promise.all([
    getProduct(slug),
    auth(),
    getPublicSettings(),
  ]);

  if (!product) notFound();

  const verifiedReviews = product.reviews || [];
  const activeFlashSale = product.flashSales?.[0];
  const videoUrl = product.youtubeUrls?.[0] || null;

  const { finalPrice, hasDiscount, discountPercentage } = activeFlashSale
    ? {
        finalPrice: activeFlashSale.salePrice,
        hasDiscount: true,
        discountPercentage: Math.round(
          ((Number(product.price) - Number(activeFlashSale.salePrice)) /
            Number(product.price)) *
            100,
        ),
      }
    : calculateDiscountedPrice(
        Number(product.price),
        product.discountType,
        product.discountValue ? Number(product.discountValue) : null,
        product.discountStartDate,
        product.discountEndDate,
      );

  const displayPrice = hasDiscount ? finalPrice : product.price;
  const displayComparePrice = hasDiscount
    ? product.price
    : product.compareAtPrice;
  const basePriceNumber = Number(displayPrice);

  const normalizedVariations =
    product.variations?.map((v) => ({
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
    })) || [];

  const normalizedCombinations =
    product.combinations?.map((combo) => {
      const originalComboPrice =
        combo.price !== null ? Number(combo.price) : Number(product.price);
      let discountedComboPrice = originalComboPrice;

      if (hasDiscount) {
        if (activeFlashSale) {
          const discountRatio =
            Number(activeFlashSale.salePrice) / Number(product.price);
          discountedComboPrice = originalComboPrice * discountRatio;
        } else if (
          product.discountType === "PERCENTAGE" &&
          product.discountValue
        ) {
          discountedComboPrice =
            originalComboPrice -
            (originalComboPrice * Number(product.discountValue)) / 100;
        } else if (
          product.discountType === "FIXED_AMOUNT" &&
          product.discountValue
        ) {
          discountedComboPrice =
            originalComboPrice - Number(product.discountValue);
        }
        discountedComboPrice = Math.max(0, discountedComboPrice);
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
      };
    }) || [];

  const whatsappNumber = settings.whatsapp_number?.replace(/[^0-9]/g, "") || "";
  const callNumber = settings.store_phone || "";

  const headersList = await import("next/headers").then((m) => m.headers());
  const host = headersList.get("host") || "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") || "http";
  const productUrl = `${proto}://${host}/products/${product.slug}`;

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello! I'm interested in:\nProduct: ${product.name}\nProduct URL: ${productUrl}`)}`
    : null;

  const productRating = Number(product.rating || 0);

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-12 font-mono relative">
      <ScrollToTop />

      {/* Breadcrumbs */}
      <div className="bg-[#F9F9F9] py-0 md:py-4">
        <div className="container mx-auto px-4 md:px-10">
          <ul className="flex flex-wrap gap-2 items-center text-sm">
            <li>
              <Link
                href="/"
                className="text-muted-foreground hover:text-primary"
              >
                Home
              </Link>
            </li>
            <li className="text-muted-foreground">&gt;</li>
            <li className="text-foreground">Products</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto px-0.5 md:px-10">
        <TrackProductView productId={product.id} />
        <TrackProductViewAnalytics productId={product.id} slug={product.slug} />
        <Ga4ViewItem
          itemId={product.id}
          itemName={product.name}
          price={basePriceNumber}
          itemBrand={product.brand}
          itemCategory={product.category?.name}
        />

        {/* Main Product Top Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-5 bg-card p-5 md:p-8 rounded-xl border border-border shadow-sm">
          <div className="w-full relative">
            {/* Render Client Gallery Component */}
            <ProductImageGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          <div className="w-full flex flex-col">
            <h1 className="text-card-foreground text-[18px] md:text-[24px] font-semibold leading-tight mb-0">
              {product.name}
            </h1>

            {/* Render Client Price Display Component */}
            <ProductPriceDisplay
              basePrice={basePriceNumber}
              compareAtPrice={
                displayComparePrice ? Number(displayComparePrice) : null
              }
              hasDiscount={hasDiscount}
              discountPercentage={discountPercentage}
            />

            <hr className="border-border my-1" />

            {/* Render Client Combinations & Add To Cart Component */}
            <ProductPurchaseWithCombinations
              productId={product.id}
              productName={product.name}
              baseStock={product.stock}
              basePrice={basePriceNumber}
              variations={normalizedVariations}
              combinations={normalizedCombinations}
              whatsappLink={whatsappLink}
              callNumber={callNumber}
              productBrand={product.brand}
              productCategory={product.category?.name}
            />

            {product.brand && (
              <div className="mt-8 border border-border rounded px-4 py-2 inline-flex items-center gap-3 w-max">
                <span className="text-sm font-medium text-muted-foreground">
                  Brand:
                </span>
                <span className="font-bold text-lg text-foreground tracking-wide uppercase">
                  {product.brand}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Linear Product Sections */}
        <div className="mt-4 bg-card rounded-xl border border-border shadow-sm relative">
          {/* Render Client Sticky Jump Links Component */}
          <ProductJumpLinks
            hasVideo={!!videoUrl}
            reviewCount={verifiedReviews.length}
          />

          {/* Content Area */}
          <div className="p-6 md:p-8">
            {/* Product Details */}
            <div
              id="description"
              className="mb-12 scroll-mt-24 mobile-section"
              data-section="description"
            >
              <h3 className="text-[14px] md:text-[20px] font-bold text-card-foreground mb-5 inline-block border-b-[3px] border-primary pb-1">
                Product Details
              </h3>
              <div className="text-muted-foreground leading-loose text-sm md:text-[14px] space-y-6">
                <p className="whitespace-pre-line">{product.description}</p>
              </div>
              {product.specifications && product.specifications.length > 0 && (
                <div className="mt-8 bg-muted/50 rounded border border-border p-5">
                  <h4 className="font-bold text-card-foreground mb-4">
                    Specifications
                  </h4>
                  <div className="flex flex-col">
                    {product.specifications.map((spec: any, idx: number) => (
                      <div
                        key={spec.id}
                        className={`flex py-2 px-4 ${idx % 2 === 0 ? "bg-card" : ""} border-b border-border last:border-b-0`}
                      >
                        <span className="text-card-foreground font-medium w-1/3">
                          {spec.key}
                        </span>
                        <span className="text-muted-foreground w-2/3">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Video Section */}
            {videoUrl && (
              <div
                id="video"
                className="mb-12 pt-8 border-t border-border scroll-mt-24 mobile-section"
                data-section="video"
              >
                <h3 className="text-[14px] md:text-[20px] font-bold text-card-foreground mb-5 inline-block border-b-[3px] border-primary pb-1">
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
            <div
              id="reviews"
              className="pt-8 border-t border-border scroll-mt-24 mobile-section"
              data-section="reviews"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Rating Breakdown */}
                <div className="lg:col-span-4">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-[54px] font-bold text-card-foreground leading-none tracking-tight">
                      {productRating.toFixed(1)}
                    </span>
                    <div>
                      <p className="text-card-foreground font-medium text-sm mb-1">
                        Average Rating
                      </p>
                      <div className="flex gap-1 text-muted-foreground text-sm">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(productRating) ? "fill-primary text-primary" : ""}`}
                          />
                        ))}
                        <span className="ml-2">
                          ({verifiedReviews.length} Reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-card-foreground mb-6">
                    0.00%{" "}
                    <span className="font-normal text-muted-foreground">
                      Recommended (0 of 0)
                    </span>
                  </p>

                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center gap-3">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < stars ? "fill-primary text-primary" : "fill-muted text-muted-foreground/30"}`}
                            />
                          ))}
                        </div>
                        <div className="flex-1 h-1.5 bg-muted rounded-full"></div>
                        <span className="text-xs text-muted-foreground w-6 text-right">
                          0%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Form & Reviews */}
                <div className="lg:col-span-8">
                  {session?.user ? (
                    <div className="mb-10">
                      <h3 className="text-[18px] font-bold text-card-foreground mb-3 inline-block border-b-[3px] border-primary pb-1">
                        Submit Your Review
                      </h3>
                      <p className="text-sm text-muted-foreground mb-5">
                        Your email address will not be published. Required
                        fields are marked *
                      </p>

                      <ReviewForm productId={product.id} />
                    </div>
                  ) : (
                    <div className="mb-10 p-6 bg-muted border border-border rounded text-center">
                      <p className="text-sm text-muted-foreground mb-3">
                        Please sign in to write a review
                      </p>
                      <Link
                        href="/auth/login"
                        className="inline-block py-2 px-6 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition-colors text-sm"
                      >
                        Sign In
                      </Link>
                    </div>
                  )}

                  {/* Existing Reviews list */}
                  <div className="space-y-4">
                    {verifiedReviews.length > 0
                      ? verifiedReviews.map((review) => (
                          <div
                            key={review.id}
                            className="py-4 border-b border-border last:border-0"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${i < Number(review.rating) ? "fill-primary text-primary" : "fill-muted text-muted-foreground/30"}`}
                                  />
                                ))}
                              </div>
                              <span className="font-bold text-sm text-card-foreground ml-2">
                                {review.user.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                • {formatDateDhaka(review.createdAt, "PP")}
                              </span>
                            </div>
                            {review.title && (
                              <h5 className="font-bold text-card-foreground mb-1 text-sm">
                                {review.title}
                              </h5>
                            )}
                            {review.comment && (
                              <p className="text-muted-foreground text-sm">
                                {review.comment}
                              </p>
                            )}
                          </div>
                        ))
                      : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Script
          id="product-mobile-sections"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var activeSection = 'description';

                function updateMobileSections() {
                  var sections = document.querySelectorAll('.mobile-section');
                  sections.forEach(function(section) {
                    if (window.innerWidth < 768) {
                      if (section.getAttribute('data-section') === activeSection) {
                        section.style.display = 'block';
                      } else {
                        section.style.display = 'none';
                      }
                    } else {
                      section.style.display = 'block';
                    }
                  });
                }

                window.addEventListener('product-tab-change', function(e) {
                  activeSection = e.detail.section;
                  updateMobileSections();
                });

                window.addEventListener('resize', updateMobileSections);

                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', updateMobileSections);
                } else {
                  updateMobileSections();
                }
              })();
            `,
          }}
        />

        {/* Related Products */}
        <div className="py-12 px-2 mt-2">
          <div className="flex items-center justify-between mb-6 border-b border-border pb-3">
            <h2 className="text-[14px] md:text-xl font-bold text-card-foreground uppercase">
              Related Products
            </h2>
          </div>
          <RelatedProducts
            productId={product.id}
            categoryId={product.categoryId}
            limit={4}
          />
        </div>
      </div>
    </div>
  );
}
