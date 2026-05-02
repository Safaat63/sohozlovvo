"use client"

import { useEffect } from "react"
import { trackViewItem } from "@/lib/ga4"

interface LandingPageTrackingProps {
    featuredProducts: {
        id: string
        name: string
        price: number
        brand?: string | null
        category?: string | null
    }[]
    pageTitle?: string
    pageType?: string
}

export function LandingPageTracking({ featuredProducts, pageTitle, pageType }: LandingPageTrackingProps) {
    useEffect(() => {
        if (typeof window === "undefined") return
        window.dataLayer = window.dataLayer || []
        window.dataLayer.push({
            event: "page_view",
            page_title: pageTitle || "Home Page",
            page_location: window.location.href,
            page_type: pageType || "storefront",
        })

        featuredProducts.forEach((product) => {
            trackViewItem({
                item_id: product.id,
                item_name: product.name,
                price: product.price,
                item_brand: product.brand || undefined,
                item_category: product.category || undefined,
            })
        })
    }, [featuredProducts, pageTitle, pageType])

    return null
}
