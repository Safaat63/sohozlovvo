"use client"

import { useEffect } from "react"
import { trackViewItem } from "@/lib/ga4"

type Ga4ViewItemProps = {
    itemId: string
    itemName: string
    price: number
    itemBrand?: string | null
    itemCategory?: string | null
    itemVariant?: string | null
}

export function Ga4ViewItem({
    itemId,
    itemName,
    price,
    itemBrand,
    itemCategory,
    itemVariant,
}: Ga4ViewItemProps) {
    useEffect(() => {
        trackViewItem({
            item_id: itemId,
            item_name: itemName,
            price,
            item_brand: itemBrand || undefined,
            item_category: itemCategory || undefined,
            item_variant: itemVariant || undefined,
        })
    }, [itemId, itemName, price, itemBrand, itemCategory, itemVariant])

    return null
}
