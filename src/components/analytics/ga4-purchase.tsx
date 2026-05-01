"use client"

import { useEffect, useRef } from "react"
import { trackPurchase, type Ga4Item } from "@/lib/ga4"

type Ga4PurchaseProps = {
    isNew: boolean
    transactionId: string
    value: number
    tax?: number
    shipping?: number
    coupon?: string | null
    items: Ga4Item[]
}

export function Ga4Purchase({
    isNew,
    transactionId,
    value,
    tax,
    shipping,
    coupon,
    items,
}: Ga4PurchaseProps) {
    const firedRef = useRef(false)

    useEffect(() => {
        if (!isNew || firedRef.current) return
        firedRef.current = true
        trackPurchase({
            transactionId,
            value,
            tax,
            shipping,
            coupon,
            items,
        })
    }, [isNew, transactionId, value, tax, shipping, coupon, items])

    return null
}
