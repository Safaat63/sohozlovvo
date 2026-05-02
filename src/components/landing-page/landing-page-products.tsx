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
    <section id="products" className="py-12 md:py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            আমাদের পণ্য
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            আমাদের যত্নসহকারে বাছাইকৃত পণ্য থেকে বেছে নিন
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {products.map((product) => {
            const effectivePrice = getEffectivePrice(product)
            const discount = getDiscount(product)
            const quantity = quantities[product.id] || 1

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">আপনার পণ্য</h3>
                  
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {discount && discount > 0 && (
                            <span className="text-xs line-through text-gray-400">
                              {formatCurrency(product.price, currency)}
                            </span>
                          )}
                          <span className="text-lg font-bold text-green-600">
                            {formatCurrency(effectivePrice, currency)}
                          </span>
                        </div>
                      </div>
                      
                      {product.stock > 0 && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(product.id, -1)}
                            disabled={quantity <= 1}
                            className="w-7 h-7 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-full flex items-center justify-center transition-colors active:scale-95"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="text-base font-semibold px-2 min-w-[2.5rem] text-center bg-gray-50 rounded py-1 border">
                            {quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(product.id, 1)}
                            disabled={quantity >= product.stock}
                            className="w-7 h-7 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-full flex items-center justify-center transition-colors active:scale-95"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {product.stock === 0 && (
                  <div className="p-4 text-center bg-gray-50">
                    <span className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold">
                      স্টক শেষ
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {products.some(p => p.rating > 0) && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.filter(p => p.reviews.length > 0).slice(0, 3).map((product) => (
              <div key={product.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
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
                {product.reviews[0]?.comment && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    "{product.reviews[0].comment}"
                  </p>
                )}
                {product.reviews[0]?.user.name && (
                  <p className="text-xs text-gray-500 mt-2">
                    - {product.reviews[0].user.name}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
