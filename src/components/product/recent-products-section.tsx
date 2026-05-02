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
        <div className="flex flex-row justify-between items-center gap-2 mb-6">
          <div>
            <h3 className="text-foreground text-[18px] sm:text-[22px] font-bold leading-tight">Recently Added</h3>
            <div className="mt-2 sm:mt-3">
              <span className="block w-[80px] sm:w-[120px] h-[4px] sm:h-[6px] bg-primary rounded-full" />
            </div>
          </div>

          <div className="text-right">
            <a href="https://ghorerbazar.com/all-brands" className="text-primary font-semibold flex items-center gap-1 sm:gap-2 uppercase text-[11px] sm:text-sm group">
              <span className="underline group-hover:no-underline transition-all">See all</span>
              <ArrowRight className="text-primary group-hover:translate-x-1 transition-transform w-[14px] h-[14px] sm:w-[16px] sm:h-[16px]" />
            </a>

            <div className="mt-2 sm:mt-3 flex justify-end">
              <span className="block w-[40px] sm:w-[64px] h-[4px] sm:h-[6px] bg-primary rounded-full" />
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
