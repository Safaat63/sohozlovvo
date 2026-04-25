import { getAdminProducts } from "@/actions/admin-products"
import { getCategories } from "@/actions/products"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductsTable } from "./products-table"
import { Plus } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string; category?: string; status?: string; limit?: string }>
}) {
    const params = await searchParams
    const page = parseInt(params.page || "1")
    const limit = parseInt(params.limit || "20")
    const search = params.search
    const categoryId = params.category
    const status = params.status as "active" | "inactive" | "all" | undefined

    const [{ products, pagination }, categories] = await Promise.all([
        getAdminProducts({ page, limit, search, categoryId, status }),
        getCategories(),
    ])

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your product catalog
                    </p>
                </div>
                <Link href="/admin/products/new">
                    <Button size="sm" className="md:hidden">
                        <Plus className="h-4 w-4" />
                    </Button>
                    <Button className="hidden md:flex">Add Product</Button>
                </Link>
            </div>

            <ProductsTable
                products={products}
                pagination={pagination}
                categories={categories}
                filters={{ search, categoryId, status, limit }}
            />
        </div>
    )
}
