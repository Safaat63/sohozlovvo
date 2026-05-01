"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { removeFromWishlist } from "@/actions/wishlist"
import { useRouter } from "next/navigation"
import { trackRemoveFromWishlist } from "@/lib/ga4"

interface WishlistRemoveButtonProps {
    productId: string
    productName?: string
    price?: number
    productBrand?: string | null
    productCategory?: string | null
}

export function WishlistRemoveButton({
    productId,
    productName,
    price,
    productBrand,
    productCategory,
}: WishlistRemoveButtonProps) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleRemove = () => {
        startTransition(async () => {
            const result = await removeFromWishlist(productId)
            if (!result?.error && productName && typeof price === "number") {
                trackRemoveFromWishlist({
                    item_id: productId,
                    item_name: productName,
                    price,
                    item_brand: productBrand || undefined,
                    item_category: productCategory || undefined,
                })
            }
            router.refresh()
        })
    }

    return (
        <Button
            variant="secondary"
            size="icon"
            onClick={handleRemove}
            disabled={isPending}
            className="absolute top-2 right-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
