"use client"

import { useEffect, useState } from "react"
import { getComparisonProducts } from "@/actions/comparison"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { calculateDiscountedPrice } from "@/lib/utils"

interface FlashSale {
  id: string
  salePrice: number
  startDate: Date | string
  endDate: Date | string
  isActive: boolean
}

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice: number | null
  brand: string | null
  rating: number
  stock: number
  images: string[]
  description: string | null
  specifications: { key: string; value: string }[]
  discountType?: string | null
  discountValue?: number | null
  discountStartDate?: Date | null
  discountEndDate?: Date | null
  flashSales?: FlashSale[]
}

export default function ComparisonContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [productIds, setProductIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    const comparison = localStorage.getItem("productComparison")
    if (!comparison) return []
    try {
      return JSON.parse(comparison) as string[]
    } catch {
      localStorage.removeItem("productComparison")
      return []
    }
  })
  const [loading, setLoading] = useState(productIds.length > 0)

  useEffect(() => {
    if (productIds.length === 0) return
    let isActive = true

    const loadProducts = async () => {
      setLoading(true)
      const result = await getComparisonProducts(productIds)
      if (isActive && result.success) {
        setProducts(result.products)
      }
      if (isActive) {
        setLoading(false)
      }
    }

    void loadProducts()

    return () => {
      isActive = false
    }
  }, [productIds])

  const removeProduct = (id: string) => {
    const updated = productIds.filter((pid) => pid !== id)
    setProductIds(updated)
    setProducts(products.filter((p) => p.id !== id))
    localStorage.setItem("productComparison", JSON.stringify(updated))
    window.dispatchEvent(new Event("comparisonUpdated"))
  }

  const clearAll = () => {
    setProductIds([])
    setProducts([])
    localStorage.removeItem("productComparison")
    window.dispatchEvent(new Event("comparisonUpdated"))
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading comparison...</p>
      </div>
    )
  }

  if (productIds.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No products to compare</p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={clearAll}>
          Clear All
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-48">Feature</TableHead>
              {products.map((product) => (
                <TableHead key={product.id} className="text-center">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute -top-2 -right-2"
                      onClick={() => removeProduct(product.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Product</TableCell>
              {products.map((product) => (
                <TableCell key={product.id}>
                  <div className="flex flex-col items-center gap-2">
                    {product.images[0] && (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={150}
                        height={150}
                        className="rounded-lg object-cover"
                      />
                    )}
                    <Link
                      href={`/products/${product.id}`}
                      className="text-sm font-medium hover:underline text-center"
                    >
                      {product.name}
                    </Link>
                  </div>
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Price</TableCell>
              {products.map((product) => {
                // Check for active flash sale first
                const activeFlashSale = product.flashSales?.find(fs => {
                  const now = new Date()
                  const startDate = new Date(fs.startDate)
                  const endDate = new Date(fs.endDate)
                  return fs.isActive && now >= startDate && now <= endDate
                })

                let displayPrice = product.price
                let originalPrice: number | null = null
                let discountPercentage: number | null = null

                if (activeFlashSale) {
                  displayPrice = activeFlashSale.salePrice
                  originalPrice = product.price
                  discountPercentage = Math.round(((product.price - activeFlashSale.salePrice) / product.price) * 100)
                } else {
                  // Check for product discount
                  const { finalPrice, hasDiscount, discountPercentage: discPct } = calculateDiscountedPrice(
                    product.price,
                    product.discountType,
                    product.discountValue,
                    product.discountStartDate,
                    product.discountEndDate
                  )

                  if (hasDiscount) {
                    displayPrice = finalPrice
                    originalPrice = product.price
                    discountPercentage = discPct ?? null
                  } else if (product.compareAtPrice && product.compareAtPrice > product.price) {
                    // Fall back to compareAtPrice
                    originalPrice = product.compareAtPrice
                    discountPercentage = Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                  }
                }

                return (
                  <TableCell key={product.id} className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg font-bold text-primary">৳{displayPrice.toLocaleString()}</span>
                      {originalPrice && (
                        <>
                          <span className="text-sm text-muted-foreground line-through">
                            ৳{originalPrice.toLocaleString()}
                          </span>
                          {discountPercentage && (
                            <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">
                              {discountPercentage}% OFF
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                )
              })}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Brand</TableCell>
              {products.map((product) => (
                <TableCell key={product.id} className="text-center">
                  {product.brand || "N/A"}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Rating</TableCell>
              {products.map((product) => (
                <TableCell key={product.id} className="text-center">
                  {product.rating} ⭐
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Availability</TableCell>
              {products.map((product) => (
                <TableCell key={product.id} className="text-center">
                  {product.stock > 0 ? (
                    <span className="text-green-600">In Stock ({product.stock})</span>
                  ) : (
                    <span className="text-red-600">Out of Stock</span>
                  )}
                </TableCell>
              ))}
            </TableRow>

            {/* Specifications */}
            {products.some(p => p.specifications && p.specifications.length > 0) && (
              <>
                {Array.from(new Set(products.flatMap(p => p.specifications.map(s => s.key)))).map(specKey => (
                  <TableRow key={specKey}>
                    <TableCell className="font-medium">{specKey}</TableCell>
                    {products.map((product) => {
                      const spec = product.specifications.find(s => s.key === specKey)
                      return (
                        <TableCell key={product.id} className="text-sm">
                          {spec?.value || "—"}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </>
            )}

            <TableRow>
              <TableCell></TableCell>
              {products.map((product) => (
                <TableCell key={product.id} className="text-center">
                  <Button asChild className="w-full">
                    <Link href={`/products/${product.slug}`}>View Details</Link>
                  </Button>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
