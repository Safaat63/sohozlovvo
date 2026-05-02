import Link from "next/link"
import { getRecentProducts } from "@/actions/products"
import { ProductCard } from "@/components/product/product-card"
import { ArrowRight } from "lucide-react"

export async function RecentProductsSection() {
    const products = await getRecentProducts(8)

    if (products.length === 0) {
        return null
    }

    return (
        <section className="py-4 md:py-16">
            <div className="container max-w-360 mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14">
                {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-black text-[22px] font-bold leading-tight">Recently Added</h3>
              <div className="mt-3">
                <span className="block w-[120px] h-[6px] bg-[#FF7A00] rounded-full" />
              </div>
            </div>

            <div className="text-left sm:text-right">
              <Link href="/categories" className="text-[#FF7A00] font-semibold flex items-center gap-2 uppercase text-sm">
                <span className="underline">See all</span>
                <ArrowRight size={16} className="text-[#FF7A00]" />
              </Link>

              <div className="mt-3 flex sm:justify-end">
                <span className="block w-[64px] h-[6px] bg-[#FF7A00] rounded-full" />
              </div>
            </div>
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
