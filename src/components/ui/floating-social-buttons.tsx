import { getPublicSettings } from "@/actions/settings"
import { getCart } from "@/actions/cart"
import { SideCart } from "@/components/cart/side-cart"
import { calculateDiscountedPrice } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { formatCurrency } from "@/components/providers/currency-provider"

export async function FloatingSocialButtons() {
    const settings = await getPublicSettings()
    const cart = await getCart()

    const whatsappLink = settings.whatsapp_number
        ? `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`
        : null
    const cartCount = (cart?.items ?? []).reduce((sum, item) => sum + item.quantity, 0)

    const cartItems = cart?.items ?? []
    const subtotal = cartItems.reduce((sum, item) => {
        const basePrice = item.combination?.price
            ? Number(item.combination.price)
            : Number(item.product.price)
        const { finalPrice } = calculateDiscountedPrice(
            basePrice,
            item.product.discountType,
            item.product.discountValue ? Number(item.product.discountValue) : null,
            item.product.discountStartDate,
            item.product.discountEndDate
        )
        return sum + finalPrice * item.quantity
    }, 0)

    const serializedCart = cart
        ? {
            id: cart.id,
            items: cart.items.map((item) => {
                const combination = item.combination
                const combinationLabel = combination?.options
                    ?.map((o) => `${o.option.variation.variationName}: ${o.option.optionName}`)
                    .join(", ") || null

                const basePrice = combination?.price
                    ? Number(combination.price)
                    : Number(item.product.price)

                const { finalPrice } = calculateDiscountedPrice(
                    basePrice,
                    item.product.discountType,
                    item.product.discountValue ? Number(item.product.discountValue) : null,
                    item.product.discountStartDate,
                    item.product.discountEndDate
                )

                const itemStock = combination?.stock ?? item.product.stock

                return {
                    id: item.id,
                    quantity: item.quantity,
                    combinationId: item.combinationId ?? null,
                    combinationLabel,
                    itemPrice: finalPrice.toString(),
                    itemStock,
                    product: {
                        id: item.product.id,
                        name: item.product.name,
                        slug: item.product.slug,
                        price: item.product.price.toString(),
                        images: item.product.images,
                        stock: item.product.stock,
                    },
                }
            }),
        }
        : null

    const currencySymbol = settings.currency_symbol || "৳"
    const formattedSubtotal = formatCurrency(subtotal, currencySymbol)

    return (
        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 flex flex-col gap-3 z-40">
            {/* WhatsApp Button */}
            {whatsappLink && (
                <Link
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                    aria-label="Chat on WhatsApp"
                    title="Chat on WhatsApp"
                >
                    <Image src="/svg/whatsapp.svg" width={24} height={24} alt="WhatsApp" />
                    <span className="absolute right-16 md:right-20 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Chat with us
                    </span>
                </Link>
            )}

            {/* Cart Button */}
            <SideCart
                cart={serializedCart}
                itemCount={cartCount}
                relatedProducts={[]}
                triggerNode={(
                    <button
                        type="button"
                        className="group flex flex-col items-start gap-2 rounded-2xl bg-orange-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] px-4 py-3"
                        aria-label="Open cart"
                        title="Open cart"
                    >
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                                <ShoppingBag className="h-5 w-5" />
                            </span>
                            <div className="text-sm font-semibold">
                                <span className="inline-flex items-center justify-center min-w-6 h-6 px-1 rounded-full bg-white text-orange-600 text-xs font-bold mr-2">
                                    {cartCount}
                                </span>
                                Items
                            </div>
                        </div>
                        <p className="text-base font-bold pl-12">{formattedSubtotal}</p>
                    </button>
                )}
            />
        </div>
    )
}
