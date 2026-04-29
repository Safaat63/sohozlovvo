import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { getCart } from "@/actions/cart"
import { getUserLoyaltyPoints } from "@/actions/loyalty"
import { getUserAddresses } from "@/actions/addresses"
import { getUserProfile } from "@/actions/user"
import { getPublicSettings } from "@/actions/settings"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { ChevronRight } from "lucide-react"
import { calculateDiscountedPrice } from "@/lib/utils"

// Helper to calculate item price with discount
function getItemPrice(item: any): number {
    const product = item.product
    const basePrice = item.combination?.price
        ? parseFloat(item.combination.price.toString())
        : parseFloat(product.price.toString())

    // Apply product discount
    const { finalPrice } = calculateDiscountedPrice(
        basePrice,
        product.discountType,
        product.discountValue ? Number(product.discountValue) : null,
        product.discountStartDate,
        product.discountEndDate
    )

    return finalPrice
}

export default async function CheckoutPage() {
    const session = await auth()
    const cart = await getCart()
    const settings = await getPublicSettings()

    if (!cart || cart.items.length === 0) {
        redirect("/cart")
    }

    const loyaltyPoints = session?.user?.id ? await getUserLoyaltyPoints() : 0
    const userAddresses = session?.user?.id ? await getUserAddresses() : []
    const userProfile = session?.user?.id ? await getUserProfile() : null

    const subtotal = cart.items.reduce((sum, item) => {
        // Use discounted price calculation
        const unitPrice = getItemPrice(item)
        return sum + unitPrice * item.quantity
    }, 0)

    const defaultShippingCost = parseFloat(settings.shipping_cost || "0")
    const freeShippingThreshold = parseFloat(settings.free_shipping_threshold || "0")

    const shippingCost = freeShippingThreshold > 0 && subtotal > freeShippingThreshold ? 0 : defaultShippingCost
    const total = subtotal + shippingCost

    // Serialize cart items to plain objects for client component
    const serializedCartItems = cart.items.map(item => {
        // Get combination label if exists
        const combinationLabel = item.combination?.options
            ?.map(o => `${o.option.variation.variationName}: ${o.option.optionName}`)
            .join(", ") || null

        // Use discounted price
        const itemPrice = getItemPrice(item)

        return {
            id: item.id,
            quantity: item.quantity,
            combinationId: item.combinationId,
            combinationLabel,
            itemPrice,
            product: {
                id: item.product.id,
                name: item.product.name,
                price: parseFloat(item.product.price.toString()),
                rating: item.product.rating ? parseFloat(item.product.rating.toString()) : 0,
                compareAtPrice: item.product.compareAtPrice ? parseFloat(item.product.compareAtPrice.toString()) : null,
                costPrice: item.product.costPrice ? parseFloat(item.product.costPrice.toString()) : null,
            }
        }
    })

    return (
        <main className="min-h-screen bg-linear-to-br from-background-light via-white to-primary/5 dark:from-[#1a1d23] dark:via-[#1a1d23] dark:to-primary/5">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 mb-8 text-sm bg-white dark:bg-card/50 rounded-lg px-4 py-3 shadow-sm">
                    <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <Link href="/cart" className="text-muted-foreground hover:text-primary transition-colors">Cart</Link>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground font-semibold">Checkout</span>
                </nav>

                {/* Page Heading */}
                <div className="flex flex-col gap-2 mb-10 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight bg-clip-text bg-linear-to-r from-foreground to-primary">Secure Checkout</h1>
                    <p className="text-muted-foreground text-lg">Complete your order safely and securely</p>
                </div>

                <CheckoutForm
                    cartItems={serializedCartItems}
                    subtotal={subtotal}
                    shippingCost={shippingCost}
                    total={total}
                    userEmail={session?.user?.email || undefined}
                    userName={session?.user?.name || undefined}
                    userPhone={userProfile?.phone || undefined}
                    userAddresses={userAddresses}
                    loyaltyPoints={loyaltyPoints || 0}
                />
            </div>
        </main>
    )
}
