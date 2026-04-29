"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Heart, ShoppingCart, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  images: string[]
  rating: number
  reviewCount: number
  stock: number
  brand?: string | null
  description?: string | null
}

interface QuickViewModalProps {
  product: Product
  trigger?: React.ReactNode
}

export function QuickViewModal({ product, trigger }: QuickViewModalProps) {
  const [open, setOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Eye className="h-4 w-4 mr-2" />
          Quick View
        </Button>
      )}

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              {product.images[selectedImage] && (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-contain"
                />
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-md overflow-hidden shrink-0 border-2 ${selectedImage === index
                        ? "border-blue-500"
                        : "border-gray-200 dark:border-gray-700"
                      }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            {product.brand && (
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                {product.brand}
              </p>
            )}

            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(product.rating)
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-gray-300 dark:text-gray-600"
                        }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">৳{product.price}</span>
                {product.compareAtPrice && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      ৳{product.compareAtPrice}
                    </span>
                    <Badge variant="success">
                      {Math.round(
                        ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
                      )}
                      % OFF
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {/* Stock */}
            <div>
              {product.stock === 0 ? (
                <Badge variant="destructive">Out of Stock</Badge>
              ) : product.stock <= 10 ? (
                <Badge variant="warning">Only {product.stock} left!</Badge>
              ) : (
                <Badge variant="success">In Stock</Badge>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {product.description}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-4">
              <Button asChild className="w-full" size="lg">
                <Link href={`/products/${product.slug}`}>
                  View Full Details
                </Link>
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" disabled={product.stock === 0}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline">
                  <Heart className="h-4 w-4 mr-2" />
                  Wishlist
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
