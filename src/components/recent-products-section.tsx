import Link from "next/link"
import { getRecentProducts } from "@/actions/products"
import { ProductCard } from "@/components/product-card"

export async function RecentProductsSection() {
    const products = await getRecentProducts(8)

    if (products.length === 0) {
        return null
    }

    return (
        <section className="py-4 md:py-16">
            <div className="container max-w-360 mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl md:text-3xl font-bold">Recently Added</h2>
                        <p className="text-muted-foreground mt-2">
                            Check out our newest products
                        </p>
                    </div>
                    <Link
                        href="/products?sortBy=newest"
                        className="text-primary hover:underline"
                    >
                        View All
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    )
}
