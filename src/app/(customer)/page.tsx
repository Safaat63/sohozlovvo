import Link from "next/link"
import Image from "next/image"
import { getFeaturedProducts, getCategories } from "@/actions/products"
import { getPublicSettings } from "@/actions/settings"
import { getActiveHeroBanners, getActiveTestimonials, getActiveSpecialOffers, getActivePromotionalSections } from "@/actions/homepage"
import { RecentlyViewed } from "@/components/recently-viewed"
import { HeroSlider } from "@/components/hero-slider"
import { TestimonialsSection } from "@/components/testimonials-section"
import { OfferCountdownWidget } from "@/components/offer-countdown-widget"
import { PromotionalSectionsDisplay } from "@/components/promotional-sections-display"
import { RecentProductsSection } from "@/components/product/recent-products-section"
import { OffersSection } from "@/components/offers-section"
import { ArrowRight, Truck, Headphones, ShieldCheck, RefreshCw, ChevronRight, Zap } from "lucide-react"
import { ProductCardBestSellerServer } from "@/components/product/product-card-best-seller-server"
import BrandSection from "@/components/home/BrandSection"

export default async function HomePage() {
  const [featuredProducts, categories, settings, heroBanners, testimonials, specialOffers, promotionalSections] = await Promise.all([
    getFeaturedProducts(8),
    getCategories(),
    getPublicSettings(),
    getActiveHeroBanners(),
    getActiveTestimonials(),
    getActiveSpecialOffers(),
    getActivePromotionalSections(),
  ])
  const whatsappNumber = settings.whatsapp_number

  return (
    <main className="min-h-screen pt-5 bg-background-light dark:bg-[#1a1d23]">
      {/* Hero Section */}
      {heroBanners.length > 0 ? (
        <section className="relative w-full overflow-hidden">
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
                  <span className="text-xs font-bold text-primary tracking-wide uppercase">New Collection</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-foreground leading-[1.1] tracking-tight">
                  Discover Your <br />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-emerald-600">Perfect Style.</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                  Explore our curated collection of premium products designed for modern living.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link href="/products" className="px-8 py-4 bg-primary hover:bg-primary/90 text-white text-base font-bold rounded-xl transition-all shadow-lg hover:shadow-primary/30 flex items-center gap-2 group">
                    Shop Collection
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link href="/categories" className="px-8 py-4 bg-white dark:bg-card border border-border text-foreground text-base font-bold rounded-xl hover:bg-muted transition-all flex items-center gap-2">
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
                  <div className="w-full h-full flex items-center justify-center text-6xl">🛍️</div>
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
                  <h2 className="text-xl sm:text-3xl font-extrabold text-foreground">Flash Deals</h2>
                </div>
                <p className="text-muted-foreground">Limited time offers. Grab them before they&apos;re gone.</p>
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
            <h2 className="font-semibold text-[20px] md:text-[28px] text-black">Top Selling Products</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCardBestSellerServer key={product.id} product={product} />
            ))}
          </div>
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
      <section className="py-16 max-w-360 mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14">
        <div className="max-w-360 mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-black text-[22px] font-bold leading-tight">Our Brands</h3>
              <div className="mt-3">
                <span className="block w-[120px] h-[6px] bg-[#FF7A00] rounded-full" />
              </div>
            </div>

            <div className="text-left sm:text-right">
              <a href="https://ghorerbazar.com/all-brands" className="text-[#FF7A00] font-semibold flex items-center gap-2 uppercase text-sm">
                <span className="underline">See all</span>
                <ArrowRight size={16} className="text-[#FF7A00]" />
              </a>

              <div className="mt-3 flex sm:justify-end">
                <span className="block w-[64px] h-[6px] bg-[#FF7A00] rounded-full" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group relative overflow-hidden rounded-2xl aspect-square md:aspect-square lg:aspect-3/4 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="w-full h-full bg-linear-to-br from-primary/20 to-accent/20 transition-transform duration-700 group-hover:scale-110">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      {category.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-white text-xl md:text-2xl font-bold mb-1">{category.name}</h3>
                  <p className="text-gray-200 text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1">
                    {category._count?.products || 0} products <ChevronRight className="w-4 h-4" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      {testimonials.length > 0 && (
        <TestimonialsSection testimonials={testimonials} />
      )}

      {/* Recently Added Products */}
      <RecentProductsSection />

      {/* Special Offers with Active Discounts */}
      <OffersSection />

      {/* Recently Viewed Products */}
      <section className="py-4 md:py-16 max-w-360 mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14">
        <RecentlyViewed />
      </section>

      {/* Trust Badges Strip */}
      <section className="border-y border-border bg-card mt-2 md:mt-5">
        <div className="py-8 max-w-360 mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center justify-center md:justify-start gap-3 group">
              <div className="p-3 rounded-full bg-muted text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Countrywide Shipping</h3>
                <p className="text-xs text-muted-foreground">Shipping all over the country</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3 group">
              <div className="p-3 rounded-full bg-muted text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm">24/7 Support</h3>
                <p className="text-xs text-muted-foreground">Expert assistance</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3 group">
              <div className="p-3 rounded-full bg-muted text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Secure Payment</h3>
                <p className="text-xs text-muted-foreground">100% protected</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3 group">
              <div className="p-3 rounded-full bg-muted text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Easy Returns</h3>
                <p className="text-xs text-muted-foreground">30 days guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}

