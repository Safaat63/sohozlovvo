"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ProductQuickViewProps {
    product: {
        id: string
        name: string
        slug: string
        price: number
        compareAtPrice?: number | null
        images: string[]
        description?: string | null
        stock: number
        brand?: string | null
        rating: number
        reviewCount: number
    }
}

export function ProductQuickView({ product }: ProductQuickViewProps) {
    const [open, setOpen] = useState(false)
    const [selectedImage, setSelectedImage] = useState(0)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{product.name}</DialogTitle>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Images */}
                    <div>
                        <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4">
                            {product.images[selectedImage] && (
                                <Image
                                    src={product.images[selectedImage]}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                            )}
                        </div>
                        {product.images.length > 1 && (
                            <div className="flex gap-2">
                                {product.images.slice(0, 4).map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`relative aspect-square w-20 rounded-lg overflow-hidden border-2 ${selectedImage === index ? "border-blue-600" : "border-transparent"
                                            }`}
                                    >
                                        <Image src={image} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center">
                                    <span className="text-yellow-500">★</span>
                                    <span className="ml-1 text-sm">{product.rating.toFixed(1)}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    ({product.reviewCount} reviews)
                                </span>
                            </div>

                            {product.brand && (
                                <p className="text-sm text-muted-foreground mb-2">
                                    Brand: <span className="font-medium">{product.brand}</span>
                                </p>
                            )}
                        </div>

                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold">৳{product.price}</span>
                                {product.compareAtPrice && (
                                    <span className="text-lg text-muted-foreground line-through">
                                        ৳{product.compareAtPrice}
                                    </span>
                                )}
                            </div>

                            <div className="mt-2">
                                {product.stock > 0 ? (
                                    <Badge className="bg-green-500">In Stock ({product.stock})</Badge>
                                ) : (
                                    <Badge variant="destructive">Out of Stock</Badge>
                                )}
                            </div>
                        </div>

                        {product.description && (
                            <div>
                                <h4 className="font-semibold mb-2">Description</h4>
                                <p className="text-sm text-muted-foreground line-clamp-4">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button asChild className="flex-1">
                                <Link href={`/products/${product.slug}`}>
                                    View Full Details
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
