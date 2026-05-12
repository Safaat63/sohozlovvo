"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Copy, Check, ExternalLink } from "lucide-react"
import { useDebounce } from "use-debounce"
import Image from "next/image"
import { searchProducts } from "@/actions/product-search"

type Product = {
    id: string
    name: string
    slug: string
    price: number
    images: string[]
}

export function AffiliateProductSearch({ affiliateCode }: { affiliateCode: string }) {
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedQuery] = useDebounce(searchQuery, 300)
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [copiedId, setCopiedId] = useState<string | null>(null)

    useEffect(() => {
        if (debouncedQuery.length < 2) {
            setProducts([])
            return
        }

        const performSearch = async () => {
            setLoading(true)
            try {
                const result = await searchProducts(debouncedQuery)
                if (result.success) {
                    setProducts(result.products)
                }
            } catch (error) {
                console.error("Error searching products:", error)
            } finally {
                setLoading(false)
            }
        }

        performSearch()
    }, [debouncedQuery])

    const generateAffiliateLink = (slug: string) => {
        return `${window.location.origin}/products/${slug}?referral=${affiliateCode}`
    }

    const copyToClipboard = async (productId: string, link: string) => {
        try {
            await navigator.clipboard.writeText(link)
            setCopiedId(productId)
            setTimeout(() => setCopiedId(null), 2000)
        } catch (error) {
            console.error("Failed to copy:", error)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Generate Affiliate Links
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search products to create affiliate links..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {loading && (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                        Searching products...
                    </div>
                )}

                {!loading && debouncedQuery.length >= 2 && products.length === 0 && (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                        No products found. Try a different search term.
                    </div>
                )}

                {products.length > 0 && (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {products.map((product) => {
                            const affiliateLink = generateAffiliateLink(product.slug)
                            const isCopied = copiedId === product.id

                            return (
                                <div
                                    key={product.id}
                                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    {product.images[0] && (
                                        <div className="relative w-12 h-12 shrink-0 rounded overflow-hidden bg-muted">
                                            <Image
                                                src={product.images[0]}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                                sizes="48px"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">৳{product.price}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(product.id, affiliateLink)}
                                            className="shrink-0"
                                        >
                                            {isCopied ? (
                                                <>
                                                    <Check className="h-4 w-4 mr-1" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-4 w-4 mr-1" />
                                                    Copy Link
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            asChild
                                            className="shrink-0"
                                        >
                                            <a href={affiliateLink} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {debouncedQuery.length < 2 && (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                        Start typing to search for products (minimum 2 characters)
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
