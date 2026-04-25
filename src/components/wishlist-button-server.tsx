import { isInWishlist } from "@/actions/wishlist"
import { WishlistButton, type WishlistButtonProps } from "./wishlist-button"

export async function WishlistButtonServer({
    productId,
    variant = "icon",
    className,
}: Omit<WishlistButtonProps, "initialInWishlist">) {
    const inWishlist = await isInWishlist(productId)

    return (
        <WishlistButton
            productId={productId}
            initialInWishlist={inWishlist}
            variant={variant}
            className={className}
        />
    )
}
