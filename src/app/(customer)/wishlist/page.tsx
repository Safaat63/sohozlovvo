import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getWishlist } from "@/actions/wishlist"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { Heart, ChevronRight, ShoppingBag, Trash2 } from "lucide-react"
import { AddToCartButton } from "@/components/wishlist/add-to-cart-button"
import { WishlistRemoveButton } from "./wishlist-remove-button"
import { Currency } from "@/components/providers/currency-provider"

export default async function WishlistPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/auth/login?callbackUrl=/wishlist")
    }

    const wishlist = await getWishlist()

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Breadcrumb */}
            <div className="bg-card border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                            Home
                        </Link>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground font-medium">My Wishlist</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Wishlist</h1>
                        <p className="text-muted-foreground mt-1">
                            {wishlist?.items.length || 0} items saved for later
                        </p>
                    </div>
                    {wishlist && wishlist.items.length > 0 && (
                        <Link href="/products">
                            <Button variant="outline" className="rounded-xl">
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                Continue Shopping
                            </Button>
                        </Link>
                    )}
                </div>

                {!wishlist || wishlist.items.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-border shadow-soft">
                        <div className="flex flex-col items-center justify-center py-16 md:py-24">
                            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
                                <Heart className="h-10 w-10 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground mb-2">Your wishlist is empty</h2>
                            <p className="text-muted-foreground mb-6 text-center max-w-md">
                                Save items you love by clicking the heart icon on any product
                            </p>
                            <Link href="/products">
                                <Button className="rounded-xl h-12 px-8">
                                    Discover Products
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {wishlist.items.map((item) => {
                            const product = item.product
                            const activeFlashSale = product.flashSales?.find(
                                (fs) =>
                                    fs.isActive &&
                                    new Date(fs.startDate) <= new Date() &&
                                    new Date(fs.endDate) > new Date()
                            )

                            const displayPrice = activeFlashSale
                                ? parseFloat(activeFlashSale.salePrice.toString())
                                : parseFloat(product.price.toString())

                            const originalPrice = parseFloat(product.price.toString())
                            const hasDiscount = activeFlashSale && displayPrice < originalPrice
                            const discountPercentage = hasDiscount
                                ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
                                : 0

                            const inStock = product.stock > 0

                            return (
                                <div
                                    key={item.id}
                                    className="group bg-card rounded-2xl border border-border overflow-hidden shadow-soft hover:shadow-hover transition-all duration-300"
                                >
                                    {/* Product Image */}
                                    <div className="relative aspect-square overflow-hidden bg-muted">
                                        <Link href={`/products/${product.slug}`}>
                                            {product.images[0] ? (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="text-muted-foreground text-sm">No image</span>
                                                </div>
                                            )}
                                        </Link>

                                        {/* Badges */}
                                        {hasDiscount && (
                                            <span className="absolute top-3 left-3 bg-accent text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                                -{discountPercentage}%
                                            </span>
                                        )}

                                        {/* Wishlist Remove Button */}
                                        <WishlistRemoveButton
                                            productId={product.id}
                                            productName={product.name}
                                            price={displayPrice}
                                            productBrand={product.brand}
                                            productCategory={product.category?.name}
                                        />

                                        {/* Quick Add Overlay */}
                                        <div className="absolute bottom-0 inset-x-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-linear-to-t from-black/50 to-transparent">
                                            <AddToCartButton
                                                productId={product.id}
                                                productName={product.name}
                                                price={displayPrice}
                                                productBrand={product.brand}
                                                productCategory={product.category?.name}
                                                variant="secondary"
                                                className="w-full bg-white text-foreground hover:bg-gray-100 rounded-lg shadow-lg font-semibold"
                                                simple
                                            />
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        <Link href={`/products/${product.slug}`}>
                                            <h3 className="font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-1 mb-1">
                                                {product.name}
                                            </h3>
                                        </Link>
                                        {product.category && (
                                            <p className="text-xs text-muted-foreground mb-3">
                                                {product.category.name}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Currency
                                                    value={displayPrice}
                                                    className="font-bold text-foreground"
                                                />
                                                {hasDiscount && (
                                                    <Currency
                                                        value={originalPrice}
                                                        className="text-xs text-muted-foreground line-through"
                                                    />
                                                )}
                                            </div>
                                            <span
                                                className={`text-xs font-medium ${inStock
                                                    ? "text-green-600 dark:text-green-400"
                                                    : "text-red-600 dark:text-red-400"
                                                    }`}
                                            >
                                                {inStock ? "In Stock" : "Out of Stock"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
