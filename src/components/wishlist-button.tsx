"use client"

import { useState, useTransition } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleWishlist } from "@/actions/wishlist"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export interface WishlistButtonProps {
    productId: string
    initialInWishlist?: boolean
    variant?: "icon" | "button"
    className?: string
}

export function WishlistButton({
    productId,
    initialInWishlist = false,
    variant = "icon",
    className,
}: WishlistButtonProps) {
    const [inWishlist, setInWishlist] = useState(initialInWishlist)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleToggle = () => {
        startTransition(async () => {
            const result = await toggleWishlist(productId)
            if (result.error) {
                if (result.error.includes("login")) {
                    router.push("/auth/login")
                }
                return
            }
            setInWishlist(!inWishlist)
        })
    }

    if (variant === "icon") {
        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={handleToggle}
                disabled={isPending}
                className={cn(
                    "rounded-full",
                    inWishlist && "text-red-500",
                    className
                )}
            >
                <Heart
                    className={cn(
                        "h-5 w-5",
                        inWishlist && "fill-current"
                    )}
                />
            </Button>
        )
    }

    return (
        <Button
            variant={inWishlist ? "destructive" : "outline"}
            onClick={handleToggle}
            disabled={isPending}
            className={className}
        >
            <Heart
                className={cn(
                    "mr-2 h-4 w-4",
                    inWishlist && "fill-current"
                )}
            />
            {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        </Button>
    )
}
