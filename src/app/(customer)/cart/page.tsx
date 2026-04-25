import Link from "next/link"
import { getCart } from "@/actions/cart"
import { getPublicSettings } from "@/actions/settings"
import { CartItemActions } from "@/components/cart-item-actions"
import { ShoppingBag, ArrowRight, Lock, ChevronRight } from "lucide-react"
import Image from "next/image"
import { Currency } from "@/components/currency-provider"
import { calculateDiscountedPrice } from "@/lib/utils"

// Helper to calculate item price with discount
function getItemPrice(item: any): { price: number; originalPrice: number; hasDiscount: boolean } {
    const product = item.product
    const basePrice = item.combination?.price
        ? parseFloat(item.combination.price.toString())
        : parseFloat(product.price.toString())

    // Apply product discount
    const { finalPrice, hasDiscount } = calculateDiscountedPrice(
        basePrice,
        product.discountType,
        product.discountValue ? Number(product.discountValue) : null,
        product.discountStartDate,
        product.discountEndDate
    )

    return {
        price: finalPrice,
        originalPrice: basePrice,
        hasDiscount
    }
}

export default async function CartPage() {
    const cart = await getCart()
    const settings = await getPublicSettings()

    if (!cart || cart.items.length === 0) {
        return (
            <main className="min-h-screen bg-background-light dark:bg-[#1a1d23]">
                <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
                    <div className="max-w-md mx-auto text-center">
                        <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">Your cart is empty</h1>
                        <p className="text-muted-foreground mb-8">
                            Looks like you haven&apos;t added anything yet
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all"
                        >
                            Start Shopping
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </main>
        )
    }

    const subtotal = cart.items.reduce((sum, item) => {
        // Use discounted price calculation
        const { price } = getItemPrice(item)
        return sum + price * item.quantity
    }, 0)

    const defaultShippingCost = parseFloat(settings.shipping_cost || "0")
    const freeShippingThreshold = parseFloat(settings.free_shipping_threshold || "0")

    const shippingCost = freeShippingThreshold > 0 && subtotal > freeShippingThreshold ? 0 : defaultShippingCost
    const total = subtotal + shippingCost

    return (
        <main className="min-h-screen bg-background-light dark:bg-[#1a1d23]">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 mb-8 text-sm">
                    <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">Shopping Cart</span>
                </nav>

                {/* Page Heading */}
                <div className="flex flex-col gap-2 mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Shopping Cart</h1>
                    <p className="text-muted-foreground">{cart.items.length} {cart.items.length === 1 ? "item" : "items"} in your cart</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                    {/* LEFT COLUMN: Cart Items */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Cart Items Section */}
                        <section className="bg-card rounded-xl shadow-soft border border-border overflow-hidden">
                            <div className="px-6 py-4 border-b border-border bg-muted/50 flex justify-between items-center">
                                <h3 className="font-bold text-foreground flex items-center gap-2">
                                    <span className="flex items-center justify-center size-6 rounded-full bg-primary text-white text-xs font-bold">1</span>
                                    Review Cart <span className="text-muted-foreground font-normal text-sm ml-1">({cart.items.length} items)</span>
                                </h3>
                                {/* <Link href="/products" className="text-sm text-primary hover:text-primary/80 font-medium">
                                    Continue Shopping
                                </Link> */}
                            </div>
                            <div className="p-6 flex flex-col gap-6">
                                {cart.items.map((item, index) => (
                                    <div key={item.id}>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 group">
                                            {/* Product Image */}
                                            <div className="relative shrink-0 overflow-hidden rounded-lg bg-muted size-20">
                                                {item.product.images[0] ? (
                                                    <Image
                                                        src={item.product.images[0]}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Details */}
                                            <div className="grow min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <Link href={`/products/${item.product.slug}`}>
                                                            <h4 className="text-foreground font-semibold truncate hover:text-primary transition-colors">
                                                                {item.product.name}
                                                            </h4>
                                                        </Link>
                                                        <p className="text-muted-foreground text-sm mt-0.5">
                                                            {item.combination?.options && (
                                                                <span>
                                                                    {item.combination.options
                                                                        .map(o => `${o.option.variation.variationName}: ${o.option.optionName}`)
                                                                        .join(", ")}
                                                                </span>
                                                            )}
                                                            {item.product.brand && <span> / {item.product.brand}</span>}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        {(() => {
                                                            const { price, originalPrice, hasDiscount } = getItemPrice(item)
                                                            return hasDiscount ? (
                                                                <div className="flex flex-col items-end">
                                                                    <span className="text-xs line-through text-muted-foreground">
                                                                        <Currency value={originalPrice} />
                                                                    </span>
                                                                    <span className="font-bold text-green-600 dark:text-green-400">
                                                                        <Currency value={price} />
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="font-bold text-foreground">
                                                                    <Currency value={price} />
                                                                </span>
                                                            )
                                                        })()}
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-end mt-3">
                                                    <CartItemActions
                                                        itemId={item.id}
                                                        quantity={item.quantity}
                                                        stock={item.combination?.stock ?? item.product.stock}
                                                    />
                                                    <p className="text-lg font-bold text-foreground">
                                                        {(() => {
                                                            const { price } = getItemPrice(item)
                                                            return <Currency value={price * item.quantity} />
                                                        })()}
                                                    </p>
                                                </div>
                                                {(() => {
                                                    const stock = item.combination?.stock ?? item.product.stock
                                                    const lowStock = item.product.lowStockAlert
                                                    return stock <= lowStock ? (
                                                        <p className="text-xs text-accent mt-2 font-medium">
                                                            Only {stock} left in stock
                                                        </p>
                                                    ) : null
                                                })()}
                                            </div>
                                        </div>
                                        {/* Separator */}
                                        {index < cart.items.length - 1 && (
                                            <div className="h-px bg-border mt-6"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN: Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 space-y-6">
                            {/* Summary Card */}
                            <div className="bg-card rounded-xl shadow-lg border border-border p-6">
                                <h2 className="text-lg font-bold text-foreground mb-6">Order Summary</h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-medium text-foreground"><Currency value={subtotal} /></span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span className={`font-medium ${shippingCost === 0 ? "text-green-600 dark:text-green-400" : "text-foreground"}`}>
                                            {shippingCost === 0 ? "Free" : <Currency value={shippingCost} />}
                                        </span>
                                    </div>
                                    {shippingCost > 0 && freeShippingThreshold > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            Add <Currency value={freeShippingThreshold - subtotal} /> more for Free Shipping
                                        </p>
                                    )}
                                </div>

                                <div className="border-t border-border pt-4 mb-6">
                                    <div className="flex justify-between items-end">
                                        <span className="text-base font-bold text-foreground">Total</span>
                                        <span className="text-2xl font-extrabold text-foreground"><Currency value={total} /></span>
                                    </div>
                                </div>

                                {/* Primary CTA */}
                                <Link
                                    href="/checkout"
                                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <span>Proceed to Checkout</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Link>

                                {/* Trust Signals */}
                                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Secure SSL Encrypted Transaction</span>
                                </div>
                            </div>

                            {/* Continue Shopping */}
                            <Link
                                href="/products"
                                className="block w-full text-center border-2 border-border hover:border-primary text-foreground hover:text-primary font-bold py-3 rounded-xl transition-all"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
