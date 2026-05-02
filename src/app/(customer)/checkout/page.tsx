import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getCart } from "@/actions/cart"
import { getUserLoyaltyPoints } from "@/actions/loyalty"
import { getUserAddresses } from "@/actions/addresses"
import { getUserProfile } from "@/actions/user"
import { getPublicSettings } from "@/actions/settings"
import Link from "next/link"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { calculateDiscountedPrice } from "@/lib/utils"

interface CartItemForPricing {
    product: {
        price: number | string;
        discountType?: string | null;
        discountValue?: number | string | null;
        discountStartDate?: Date | null;
        discountEndDate?: Date | null;
    };
    combination?: {
        price: number | string;
    } | null;
}

// Helper to calculate item price with discount
function getItemPrice(item: CartItemForPricing): number {
    const product = item.product
    const basePrice = item.combination?.price
        ? parseFloat(item.combination.price.toString())
        : parseFloat(product.price.toString())

    // Apply product discount
    const { finalPrice } = calculateDiscountedPrice(
        basePrice,
        product.discountType || null,
        product.discountValue ? Number(product.discountValue) : null,
        product.discountStartDate || null,
        product.discountEndDate || null
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
        const unitPrice = getItemPrice(item as unknown as CartItemForPricing)
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
        const itemPrice = getItemPrice(item as unknown as CartItemForPricing)

        const firstImage = item.product.images?.[0]
        const imageUrl = typeof firstImage === "string" ? firstImage : firstImage?.url

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
                image: imageUrl || "/placeholder-image.png",
                rating: item.product.rating ? parseFloat(item.product.rating.toString()) : 0,
                compareAtPrice: item.product.compareAtPrice ? parseFloat(item.product.compareAtPrice.toString()) : null,
                costPrice: item.product.costPrice ? parseFloat(item.product.costPrice.toString()) : null,
            }
        }
    })

    return (
        <main className="min-h-screen bg-[#f4f6f9] text-gray-800 font-sans pb-12">
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
                    <h1 className="text-2xl font-semibold text-gray-900">Checkout</h1>
                    <div className="mt-1 text-sm text-gray-500">
                        <Link href="/" className="hover:text-gray-700">Home</Link>
                        <span className="mx-2">&gt;</span>
                        <span className="text-[#f97316]">Checkout</span>
                    </div>
                </div>
            </div>

            <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <CheckoutForm
                    cartItems={serializedCartItems}
                    subtotal={subtotal}
                    shippingCost={shippingCost}
                    total={total}
                    isLoggedIn={!!session?.user}
                    userName={session?.user?.name || undefined}
                    userEmail={session?.user?.email || undefined}
                    userPhone={userProfile?.phone || undefined}
                    userAddresses={userAddresses}
                />
            </div>
        </main>
    )
}