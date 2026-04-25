"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { removeFromWishlist } from "@/actions/wishlist"
import { useRouter } from "next/navigation"

interface WishlistRemoveButtonProps {
    productId: string
}

export function WishlistRemoveButton({ productId }: WishlistRemoveButtonProps) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleRemove = () => {
        startTransition(async () => {
            await removeFromWishlist(productId)
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
