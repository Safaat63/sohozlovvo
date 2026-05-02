"use client"

import Image from "next/image"
import { Star, ShoppingCart } from "lucide-react"
import { formatCurrency, useCurrencySymbol } from "@/components/providers/currency-provider"
import { useState } from "react"

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string | null
  images: string[]
  createdAt: Date
  isVerified: boolean
  user: {
    name: string | null
    image: string | null
  }
}

interface FlashSale {
  salePrice: number
  endDate: Date
}

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compareAtPrice: number | null
  images: string[]
  rating: number
  reviewCount: number
  stock: number
  flashSale: FlashSale | null
  reviews: Review[]
  quantity: number
}

interface LandingPageProductsProps {
  products: Product[]
}

export function LandingPageProducts({ products }: LandingPageProductsProps) {
  const currency = useCurrencySymbol()
  const [quantities, setQuantities] = useState<Record<string, number>>(
    products.reduce((acc, p) => ({ ...acc, [p.id]: 1 }), {})
  )

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const product = products.find((p) => p.id === productId)
      if (!product) return prev
      const newQty = Math.max(1, Math.min((prev[productId] || 1) + delta, product.stock))
      return { ...prev, [productId]: newQty }
    })
  }

  const scrollToCheckout = () => {
    document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth" })
  }

  const getEffectivePrice = (product: Product): number => {
    if (product.flashSale) {
      return product.flashSale.salePrice
    }
    return product.price
  }

  const getDiscount = (product: Product): number | null => {
    if (product.flashSale) {
      return Math.round(((product.price - product.flashSale.salePrice) / product.price) * 100)
    }
    if (product.compareAtPrice && product.compareAtPrice > product.price) {
      return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    }
    return null
  }

  return (
    <section id="products" className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Our Products
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Choose from our carefully curated selection
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {products.map((product) => {
            const effectivePrice = getEffectivePrice(product)
            const discount = getDiscount(product)
            const quantity = quantities[product.id] || 1

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-square bg-gray-100">
                  {product.images[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  )}
                  {discount && discount > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
                      -{discount}%
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 md:p-5">
                  <h3 className="font-semibold text-gray-900 text-base md:text-lg mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(product.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      ({product.reviewCount})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl md:text-2xl font-bold text-orange-600">
                      {formatCurrency(effectivePrice, currency)}
                    </span>
                    {(product.compareAtPrice || product.flashSale) && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatCurrency(product.price, currency)}
                      </span>
                    )}
                  </div>

                  {product.stock > 0 && (
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(product.id, -1)}
                          className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors"
                          disabled={quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-4 py-1.5 font-semibold text-gray-900 border-x border-gray-300 min-w-[3rem] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(product.id, 1)}
                          className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                          disabled={quantity >= product.stock}
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm text-gray-500">
                        {product.stock} available
                      </span>
                    </div>
                  )}

                  <button
                    onClick={scrollToCheckout}
                    disabled={product.stock === 0}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Order Now
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
