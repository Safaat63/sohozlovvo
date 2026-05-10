import Link from "next/link";
import { getFeaturedProducts, getCategories } from "@/actions/products";
import { getPublicSettings } from "@/actions/settings";
import {
  getActiveHeroBanners,
  getActiveTestimonials,
  getActiveSpecialOffers,
  getActivePromotionalSections,
} from "@/actions/homepage";
import { RecentlyViewed } from "@/components/home/recently-viewed";
import { HeroSlider } from "@/components/home/hero-slider";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { OfferCountdownWidget } from "@/components/home/offer-countdown-widget";
import { PromotionalSectionsDisplay } from "@/components/home/promotional-sections-display";
import { RecentProductsSection } from "@/components/product/recent-products-section";
import { OffersSection } from "@/components/home/offers-section";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import BrandSection from "@/components/home/BrandSection";
import FeaturedCategories from "@/components/home/Categories";
import { LandingPageTracking } from "@/components/analytics/landing-page-tracking";
import { FeaturedProductsSlider } from "@/components/home/featured-products-slider";

const toNumber = (value: unknown) => {
  if (typeof value === "object" && value !== null && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
};

const toNumberOrNull = (value: unknown) => {
  if (value === null || value === undefined) return null;
  return toNumber(value);
};

const toIsoStringOrNull = (value: unknown) => {
  if (!value) return null;
  const date = new Date(value as string);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

export default async function HomePage() {
  const [
    featuredProducts,
    categories,
    settings,
    heroBanners,
    testimonials,
    specialOffers,
    promotionalSections,
  ] = await Promise.all([
    getFeaturedProducts(8),
    getCategories(),
    getPublicSettings(),
    getActiveHeroBanners(),
    getActiveTestimonials(),
    getActiveSpecialOffers(),
    getActivePromotionalSections(),
  ]);
  const whatsappNumber = settings.whatsapp_number;

  const serializedFeaturedProducts = featuredProducts.map((product) => ({
    id: product.id,
    name: product.name,
    price: parseFloat(product.price.toString()),
    brand: product.brand || null,
    category: product.category?.name || null,
  }));

  const featuredProductsForSlider = featuredProducts.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: toNumber(product.price),
    compareAtPrice: toNumberOrNull(product.compareAtPrice),
    images: Array.isArray(product.images) ? product.images : [],
    stock: product.stock ?? 0,
    brand: product.brand ?? null,
    rating: toNumberOrNull(product.rating),
    reviewCount: product.reviewCount ?? 0,
    description: product.description ?? null,
    lowStockAlert: product.lowStockAlert ?? null,
    discountType: product.discountType ?? null,
    discountValue: toNumberOrNull(product.discountValue),
    discountStartDate: toIsoStringOrNull(product.discountStartDate),
    discountEndDate: toIsoStringOrNull(product.discountEndDate),
    flashSales: Array.isArray(product.flashSales)
      ? product.flashSales
          .map((sale) => ({
            id: sale.id,
            salePrice: toNumber(sale.salePrice),
            startDate: toIsoStringOrNull(sale.startDate),
            endDate: toIsoStringOrNull(sale.endDate),
            isActive: Boolean(sale.isActive),
          }))
          .filter((sale) => sale.startDate && sale.endDate)
      : [],
  }));

  return (
    <>
      <LandingPageTracking featuredProducts={serializedFeaturedProducts} />
      <main className="min-h-screen pt-5 bg-background-light dark:bg-[#1a1d23]">
        {/* Hero Sections */}
        <div className="mx-auto flex flex-col lg:flex-row gap-4 max-w-360 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14">
          {/* Hero Section */}
          {heroBanners.length > 0 && <HeroSlider banners={heroBanners} />}

          {/* Promotional Sections */}
          {promotionalSections.length > 0 && (
            <div className="hidden lg:block lg:w-[455px] lg:flex-shrink-0">
              <PromotionalSectionsDisplay sections={promotionalSections} />
            </div>
          )}
        </div>

        {/* Flash Sale / Special Offers Section */}
        {specialOffers.length > 0 && (
          <section className="py-12 bg-orange-50/50 dark:bg-orange-950/10 border-y border-orange-100 dark:border-orange-900/30">
            <div className="max-w-360 mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-7 h-7 text-accent animate-pulse" />
                    <h2 className="text-xl sm:text-3xl font-extrabold text-foreground">
                      Flash Deals
                    </h2>
                  </div>
                  <p className="text-muted-foreground">
                    Limited time offers. Grab them before they&apos;re gone.
                  </p>
                </div>
              </div>
              <OfferCountdownWidget offers={specialOffers} />
            </div>
          </section>
        )}

        {/* Featured Products / Best Sellers */}
        <section className="py-4 max-w-360 mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14">
          <div className="max-w-360 mx-auto">
            <div className="flex flex-col items-center text-center mb-2">
              <h2 className="font-semibold text-[20px] md:text-[28px] text-black">
                Top Selling Products
              </h2>
            </div>
            <FeaturedProductsSlider products={featuredProductsForSlider} />
            {/* <div className="mt-8 flex justify-center">
            <Link href="/products" className="group px-10 py-4 bg-linear-to-r from-primary to-primary/90 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2">
              View More Products
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div> */}
          </div>
        </section>

        {/* Brand Section */}
        <section className="py-4 max-w-360 mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14">
          <BrandSection />
        </section>

        {/* Categories Section */}
        <section className="py-4 max-w-360 mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14">
          {categories.length > 0 && (
            <FeaturedCategories categories={categories} />
          )}
        </section>

        {/* Recently Added Products */}
        <RecentProductsSection />

        {/* Special Offers with Active Discounts */}
        <OffersSection />

        {/* Recently Viewed Products */}
        <section className="py-4 md:py-16 max-w-360 mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14">
          <RecentlyViewed />
        </section>
        {/* Customer Testimonials */}
        {testimonials.length > 0 && (
          <TestimonialsSection testimonials={testimonials} />
        )}
      </main>
    </>
  );
}
