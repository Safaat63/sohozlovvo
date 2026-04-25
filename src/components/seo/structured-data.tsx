import Script from "next/script"

interface Product {
  name: string
  description?: string | null
  price: number
  images: string[]
  rating?: number
  reviewCount?: number
  brand?: string | null
  sku?: string | null
}

interface ProductJsonLdProps {
  product: Product
  url: string
}

export function ProductJsonLd({ product, url }: ProductJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.sku,
    brand: product.brand
      ? {
        "@type": "Brand",
        name: product.brand,
      }
      : undefined,
    offers: {
      "@type": "Offer",
      url: url,
      priceCurrency: "BDT",
      price: product.price,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: process.env.NEXT_PUBLIC_SITE_NAME || "Sohozlovvo",
      },
    },
    aggregateRating:
      product.rating && product.reviewCount
        ? {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          reviewCount: product.reviewCount,
        }
        : undefined,
  }

  return (
    <Script
      id="product-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: process.env.NEXT_PUBLIC_SITE_NAME || "Sohozlovvo",
    url: process.env.NEXT_PUBLIC_APP_URL,
    logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
    sameAs: [
      // Add your social media URLs here
    ],
  }

  return (
    <Script
      id="organization-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function BreadcrumbJsonLd({ items }: { items: Array<{ name: string; url: string }> }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <Script
      id="breadcrumb-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
