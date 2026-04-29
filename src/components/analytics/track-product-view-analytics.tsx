"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { trackProductView } from "@/actions/analytics"

export function TrackProductViewAnalytics({ productId, slug }: { productId: string; slug: string }) {
    const searchParams = useSearchParams()

    useEffect(() => {
        const referralCode = searchParams.get("referral")

        // Track the view (with or without affiliate)
        trackProductView(productId, slug, referralCode || undefined)
    }, [productId, slug, searchParams])

    return null
}
