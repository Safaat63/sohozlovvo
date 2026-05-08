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
        {/* Hero Section */}
        {heroBanners.length > 0 ? (
          <section className="relative w-auto overflow-hidden px-10 object-cover_ h-50 sm:h-65 md:h-93">
            <div className="w-full">
              <HeroSlider banners={heroBanners} />
            </div>
          </section>
        ) : (
          <section className="relative w-full overflow-hidden max-w-360 mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14">
            <div className="max-w-360 mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col gap-6 lg:pr-12 order-2 lg:order-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 w-fit">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span className="text-xs font-bold text-primary tracking-wide uppercase">
                      New Collection
                    </span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-foreground leading-[1.1] tracking-tight">
                    Discover Your <br />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-emerald-600">
                      Perfect Style.
                    </span>
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                    Explore our curated collection of premium products designed
                    for modern living.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <Link
                      href="/products"
                      className="px-8 py-4 bg-primary hover:bg-primary/90 text-white text-base font-bold rounded-xl transition-all shadow-lg hover:shadow-primary/30 flex items-center gap-2 group"
                    >
                      Shop Collection
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                      href="/categories"
                      className="px-8 py-4 bg-white dark:bg-card border border-border text-foreground text-base font-bold rounded-xl hover:bg-muted transition-all flex items-center gap-2"
                    >
                      Browse Categories
                    </Link>
                  </div>
                  <div className="flex items-center gap-6 pt-8 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-green-600" />
                      <span>Countrywide Shipping</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-green-600" />
                      <span>Quality Guaranteed</span>
                    </div>
                  </div>
                </div>
                <div className="relative order-1 lg:order-2">
                  <div className="absolute -inset-4 bg-linear-to-tr from-primary/20 to-accent/10 rounded-3xl blur-2xl opacity-50"></div>
                  <div className="relative aspect-4/3 w-full rounded-3xl overflow-hidden shadow-2xl bg-linear-to-br from-primary/10 to-accent/10">
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      🛍️
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

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

        {/* Promotional Sections */}
        {promotionalSections.length > 0 && (
          <PromotionalSectionsDisplay sections={promotionalSections} />
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
