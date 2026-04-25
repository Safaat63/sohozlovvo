import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface TopProductsViewsProps {
    products: Array<{
        id: string
        name: string | null
        slug: string | null
        images: string[] | null
        viewCount: number
    }>
}

export function TopProductsViews({ products }: TopProductsViewsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Top Viewed Products
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {products.map((product, index) => (
                        <div key={product.id} className="flex items-center gap-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                {index + 1}
                            </div>
                            {product.images && product.images.length > 0 ? (
                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name || "Product"}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                    <Eye className="h-6 w-6" />
                                </div>
                            )}
                            <div className="flex-1 space-y-1">
                                <Link
                                    href={`/admin/products/${product.id}/edit`}
                                    className="text-sm font-medium leading-none hover:underline"
                                >
                                    {product.name || "Unknown Product"}
                                </Link>
                                <p className="text-sm text-muted-foreground">
                                    {product.viewCount.toLocaleString()} views
                                </p>
                            </div>
                        </div>
                    ))}
                    {products.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground">
                            No product views yet
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
