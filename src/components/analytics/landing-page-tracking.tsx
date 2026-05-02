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
}

export function LandingPageTracking({ featuredProducts }: LandingPageTrackingProps) {
    useEffect(() => {
        if (typeof window === "undefined") return
        window.dataLayer = window.dataLayer || []
        window.dataLayer.push({
            event: "page_view",
            page_title: "Home Page",
            page_location: window.location.href,
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
    }, [featuredProducts])

    return null
}
