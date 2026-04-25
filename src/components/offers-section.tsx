import Link from "next/link"
import { getProductsWithActiveDiscounts } from "@/actions/products"
import { ProductCard } from "@/components/product-card"

export async function OffersSection() {
    const products = await getProductsWithActiveDiscounts(8)

    if (products.length === 0) {
        return null
    }

    return (
        <section className="py-4 md:py-16 bg-linear-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
            <div className="container max-w-360 mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl md:text-3xl font-bold">Special Offers</h2>
                        <p className="text-muted-foreground mt-2">
                            Limited time discounts on selected products
                        </p>
                    </div>
                    <Link
                        href="/products?hasDiscount=true"
                        className="text-primary hover:underline"
                    >
                        View All
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    )
}
