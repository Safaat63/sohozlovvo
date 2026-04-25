import { getAdminProducts } from "@/actions/admin-products"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { format } from "date-fns"
import { Edit, Percent, DollarSign } from "lucide-react"

export default async function AdminDiscountsPage({
    searchParams,
}: {
    searchParams: Promise<{ type?: string; status?: string; page?: string }>
}) {
    const params = await searchParams
    const page = parseInt(params.page || "1")
    const limit = 50 // Show more products for discount management

    // Get all products
    const { products } = await getAdminProducts({ page, limit })

    // Filter products with discounts
    const productsWithDiscounts = products.filter((product) => {
        if (!product.discountType || !product.discountValue) return false

        const now = new Date()
        const startDate = product.discountStartDate ? new Date(product.discountStartDate) : null
        const endDate = product.discountEndDate ? new Date(product.discountEndDate) : null

        // Apply filters
        if (params.type && product.discountType !== params.type) return false

        if (params.status) {
            const isActive = (!startDate || startDate <= now) && (!endDate || endDate >= now)
            if (params.status === "active" && !isActive) return false
            if (params.status === "inactive" && isActive) return false
            if (params.status === "scheduled" && (!startDate || startDate <= now)) return false
            if (params.status === "expired" && (!endDate || endDate >= now)) return false
        }

        return true
    })

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Product Discounts</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage discounts for {productsWithDiscounts.length} products
                    </p>
                </div>
                <Link href="/admin/products/new">
                    <Button className="w-full sm:w-auto">Add Product with Discount</Button>
                </Link>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/admin/discounts"
                        className={`text-sm px-3 py-2 rounded-md transition-colors ${!params.status
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary hover:bg-secondary/80"
                            }`}
                    >
                        All ({productsWithDiscounts.length})
                    </Link>
                    <Link
                        href="/admin/discounts?status=active"
                        className={`text-sm px-3 py-2 rounded-md transition-colors ${params.status === "active"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary hover:bg-secondary/80"
                            }`}
                    >
                        Active
                    </Link>
                    <Link
                        href="/admin/discounts?status=scheduled"
                        className={`text-sm px-3 py-2 rounded-md transition-colors ${params.status === "scheduled"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary hover:bg-secondary/80"
                            }`}
                    >
                        Scheduled
                    </Link>
                    <Link
                        href="/admin/discounts?status=expired"
                        className={`text-sm px-3 py-2 rounded-md transition-colors ${params.status === "expired"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary hover:bg-secondary/80"
                            }`}
                    >
                        Expired
                    </Link>
                    <div className="h-px sm:h-auto sm:w-px bg-border my-2 sm:my-0 sm:mx-2" />
                    <Link
                        href="/admin/discounts?type=PERCENTAGE"
                        className={`text-sm px-3 py-2 rounded-md transition-colors ${params.type === "PERCENTAGE"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary hover:bg-secondary/80"
                            }`}
                    >
                        <Percent className="h-3 w-3 inline mr-1" />
                        Percentage
                    </Link>
                    <Link
                        href="/admin/discounts?type=FIXED_AMOUNT"
                        className={`text-sm px-3 py-2 rounded-md transition-colors ${params.type === "FIXED_AMOUNT"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary hover:bg-secondary/80"
                            }`}
                    >
                        <DollarSign className="h-3 w-3 inline mr-1" />
                        Fixed Amount
                    </Link>
                </div>
            </Card>

            {/* Products Grid */}
            {productsWithDiscounts.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No products with discounts found.</p>
                    <Link href="/admin/products/new" className="mt-4 inline-block">
                        <Button>Add Product with Discount</Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {productsWithDiscounts.map((product) => {
                        const now = new Date()
                        const startDate = product.discountStartDate
                            ? new Date(product.discountStartDate)
                            : null
                        const endDate = product.discountEndDate ? new Date(product.discountEndDate) : null
                        const isActive = (!startDate || startDate <= now) && (!endDate || endDate >= now)
                        const isScheduled = startDate && startDate > now
                        const isExpired = endDate && endDate < now

                        return (
                            <Card key={product.id} className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {product.category?.name || "Uncategorized"}
                                        </p>
                                    </div>
                                    <Link href={`/admin/products/${product.id}/edit`}>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Discount:</span>
                                        <div className="flex items-center gap-1">
                                            {product.discountType === "PERCENTAGE" ? (
                                                <Percent className="h-3 w-3" />
                                            ) : (
                                                <DollarSign className="h-3 w-3" />
                                            )}
                                            <span className="font-semibold">
                                                {product.discountType === "PERCENTAGE"
                                                    ? `${product.discountValue}%`
                                                    : `৳${product.discountValue}`}
                                            </span>
                                        </div>
                                    </div>

                                    {startDate && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Start:</span>
                                            <span className="text-xs">{format(startDate, "MMM dd, yyyy")}</span>
                                        </div>
                                    )}

                                    {endDate && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">End:</span>
                                            <span className="text-xs">{format(endDate, "MMM dd, yyyy")}</span>
                                        </div>
                                    )}

                                    <div className="pt-2 flex items-center justify-between">
                                        {isActive && (
                                            <Badge variant="default" className="text-xs">
                                                Active
                                            </Badge>
                                        )}
                                        {isScheduled && (
                                            <Badge variant="secondary" className="text-xs">
                                                Scheduled
                                            </Badge>
                                        )}
                                        {isExpired && (
                                            <Badge variant="destructive" className="text-xs">
                                                Expired
                                            </Badge>
                                        )}
                                        <span className="text-xs text-muted-foreground ml-auto">
                                            ৳{Number(product.price).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
