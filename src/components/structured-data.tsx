type StructuredDataType = "Product" | "BreadcrumbList" | "Organization" | "WebSite"

interface ProductData {
    name: string
    description?: string | null
    images: string[]
    brand?: string | null
    price: number
    stock: number
    url: string
    rating: number
    reviewCount: number
}

interface BreadcrumbItem {
    name: string
    url: string
}

interface OrganizationData {
    name: string
    url: string
    logo?: string
    phone?: string
    socialLinks?: string[]
}

interface WebSiteData {
    name: string
    url: string
}

type StructuredDataTypeMap = {
    Product: ProductData
    BreadcrumbList: { items: BreadcrumbItem[] }
    Organization: OrganizationData
    WebSite: WebSiteData
}

interface StructuredDataProps<T extends StructuredDataType = StructuredDataType> {
    type: T
    data: StructuredDataTypeMap[T]
}

export function StructuredData<T extends StructuredDataType>({ type, data }: StructuredDataProps<T>) {
    let structuredData: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": type,
    }

    switch (type) {
        case "Product":
            {
                const productData = data as StructuredDataTypeMap["Product"]
                structuredData = {
                    ...structuredData,
                    name: productData.name,
                    description: productData.description,
                    image: productData.images,
                    brand: productData.brand ? {
                        "@type": "Brand",
                        name: productData.brand,
                    } : undefined,
                    offers: {
                        "@type": "Offer",
                        price: productData.price,
                        priceCurrency: "BDT",
                        availability: productData.stock > 0
                            ? "https://schema.org/InStock"
                            : "https://schema.org/OutOfStock",
                        url: productData.url,
                    },
                    aggregateRating: productData.reviewCount > 0 ? {
                        "@type": "AggregateRating",
                        ratingValue: productData.rating,
                        reviewCount: productData.reviewCount,
                    } : undefined,
                }
            }
            break

        case "BreadcrumbList":
            {
                const breadcrumbData = data as StructuredDataTypeMap["BreadcrumbList"]
                structuredData = {
                    ...structuredData,
                    itemListElement: breadcrumbData.items.map((item, index) => ({
                        "@type": "ListItem",
                        position: index + 1,
                        name: item.name,
                        item: item.url,
                    })),
                }
            }
            break

        case "Organization":
            {
                const organizationData = data as StructuredDataTypeMap["Organization"]
                structuredData = {
                    ...structuredData,
                    name: organizationData.name,
                    url: organizationData.url,
                    logo: organizationData.logo,
                    contactPoint: organizationData.phone ? {
                        "@type": "ContactPoint",
                        telephone: organizationData.phone,
                        contactType: "Customer Service",
                    } : undefined,
                    sameAs: organizationData.socialLinks || [],
                }
            }
            break

        case "WebSite":
            {
                const websiteData = data as StructuredDataTypeMap["WebSite"]
                structuredData = {
                    ...structuredData,
                    name: websiteData.name,
                    url: websiteData.url,
                    potentialAction: {
                        "@type": "SearchAction",
                        target: {
                            "@type": "EntryPoint",
                            urlTemplate: `${websiteData.url}/products?search={search_term_string}`,
                        },
                        "query-input": "required name=search_term_string",
                    },
                }
            }
            break
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    )
}
