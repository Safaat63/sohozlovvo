import { notFound } from "next/navigation"
import { getLandingPage } from "@/actions/landing-pages"
import { LandingPageHero } from "@/components/landing-page/landing-page-hero"
import { LandingPageProducts } from "@/components/landing-page/landing-page-products"
import { LandingPageVideoReviews } from "@/components/landing-page/landing-page-video-reviews"
import { LandingPageImageGallery } from "@/components/landing-page/landing-page-image-gallery"
import { LandingPageCheckout } from "@/components/landing-page/landing-page-checkout"
import { LandingPageSpecialties } from "@/components/landing-page/landing-page-specialties"
import { LandingPageTracking } from "@/components/analytics/landing-page-tracking"
import type { Metadata } from "next"

interface LandingPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: LandingPageProps): Promise<Metadata> {
  const { slug } = await params
  const landingPage = await getLandingPage(slug)

  if (!landingPage) {
    return {
      title: "Page Not Found",
    }
  }

  return {
    title: landingPage.metaTitle || landingPage.title,
    description: landingPage.metaDescription || landingPage.description || "",
    openGraph: {
      title: landingPage.metaTitle || landingPage.title,
      description: landingPage.metaDescription || landingPage.description || "",
      images: landingPage.heroImage ? [{ url: landingPage.heroImage }] : [],
    },
  }
}

export default async function LandingPage({ params }: LandingPageProps) {
  const { slug } = await params
  const landingPage = await getLandingPage(slug)

  if (!landingPage) {
    notFound()
  }

  const hasProducts = landingPage.products.length > 0
  const hasVideoReviews = landingPage.videoReviews.length > 0
  const hasImageReviews = landingPage.imageReviews.length > 0
  const hasDescription = landingPage.description && landingPage.description.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      <LandingPageTracking
        pageTitle={landingPage.metaTitle || landingPage.title}
        pageType="landing_page"
        featuredProducts={landingPage.products.map((lp) => ({
          id: lp.product.id,
          name: lp.product.name,
          price: lp.product.price,
        }))}
      />
      <LandingPageHero
        title={landingPage.title}
        description={landingPage.description}
        heroImage={landingPage.heroImage}
        heroVideo={landingPage.heroVideo}
      />

      {hasDescription && (
        <LandingPageSpecialties
          description={landingPage.description!}
          heroImage={landingPage.heroImage}
        />
      )}

      {hasProducts && (
        <LandingPageProducts
          products={landingPage.products.map((lp) => ({
            id: lp.product.id,
            name: lp.product.name,
            slug: lp.product.slug,
            description: lp.product.description,
            price: lp.product.price,
            compareAtPrice: lp.product.compareAtPrice,
            images: lp.product.images,
            rating: lp.product.rating,
            reviewCount: lp.product.reviewCount,
            stock: lp.product.stock,
            flashSale: lp.product.flashSales[0] || null,
            reviews: lp.product.reviews,
            quantity: lp.quantity,
          }))}
        />
      )}

      {hasVideoReviews && (
        <LandingPageVideoReviews
          videos={landingPage.videoReviews.map((v) => ({
            videoUrl: v.videoUrl,
            title: v.title,
            thumbnail: v.thumbnail,
          }))}
        />
      )}

      {hasImageReviews && (
        <LandingPageImageGallery
          images={landingPage.imageReviews.map((img) => ({
            imageUrl: img.imageUrl,
            caption: img.caption,
          }))}
        />
      )}

      {hasProducts && (
        <LandingPageCheckout
          landingPageId={landingPage.id}
          products={landingPage.products.map((lp) => ({
            id: lp.product.id,
            name: lp.product.name,
            price: lp.product.price,
            compareAtPrice: lp.product.compareAtPrice,
            images: lp.product.images,
            stock: lp.product.stock,
          }))}
        />
      )}

      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
