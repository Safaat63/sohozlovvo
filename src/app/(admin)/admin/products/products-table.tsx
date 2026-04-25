"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { deleteProduct, toggleProductStatus, bulkToggleProductStatus, bulkDeleteProducts } from "@/actions/admin-products"

type Product = {
    id: string
    name: string
    slug: string
    price: { toString: () => string }
    stock: number
    isActive: boolean
    isFeatured: boolean
    images: string[]
    category: { id: string; name: string } | null
    _count: { orderItems: number; reviews: number }
}

type Category = {
    id: string
    name: string
    slug: string
}

export function ProductsTable({
    products,
    pagination,
    categories,
    filters,
}: {
    products: Product[]
    pagination: { page: number; limit: number; total: number; pages: number }
    categories: Category[]
    filters: { search?: string; categoryId?: string; status?: string; limit?: number }
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [search, setSearch] = useState(filters.search || "")
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const allSelected = useMemo(() => selectedIds.length === products.length && products.length > 0, [selectedIds, products.length])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams(searchParams.toString())
        if (search) {
            params.set("search", search)
        } else {
            params.delete("search")
        }
        params.set("page", "1")
        router.push(`/admin/products?${params.toString()}`)
    }

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== "all") {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        params.set("page", "1")
        router.push(`/admin/products?${params.toString()}`)
    }

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", page.toString())
        router.push(`/admin/products?${params.toString()}`)
    }

    const handleLimitChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("limit", value)
        params.set("page", "1")
        router.push(`/admin/products?${params.toString()}`)
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return

        startTransition(async () => {
            const result = await deleteProduct(id)
            if (result.error) {
                alert(result.error)
            }
        })
    }

    const handleToggleStatus = async (id: string) => {
        startTransition(async () => {
            await toggleProductStatus(id)
            router.refresh()
        })
    }

    const toggleSelectAll = () => {
        setSelectedIds(allSelected ? [] : products.map((p) => p.id))
    }

    const toggleSelectOne = (id: string) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id])
    }

    const handleBulkStatus = (makeActive: boolean) => {
        if (!selectedIds.length) return alert("Select at least one product")
        startTransition(async () => {
            const result = await bulkToggleProductStatus(selectedIds, makeActive)
            if (result.error) alert(result.error)
            setSelectedIds([])
            router.refresh()
        })
    }

    const handleBulkDelete = () => {
        if (!selectedIds.length) return alert("Select at least one product")
        if (!confirm(`Delete ${selectedIds.length} product(s)? This cannot be undone.`)) return
        startTransition(async () => {
            const result = await bulkDeleteProducts(selectedIds)
            if (result.error) alert(result.error)
            setSelectedIds([])
            router.refresh()
        })
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                    <Input
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-64"
                    />
                    <Button type="submit" variant="outline" size="sm" className="shrink-0">
                        Search
                    </Button>
                </form>

                <div className="flex gap-2 sm:gap-4">
                    <Select
                        value={filters.categoryId || "all"}
                        onValueChange={(value) => handleFilterChange("category", value)}
                    >
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.status || "all"}
                        onValueChange={(value) => handleFilterChange("status", value)}
                    >
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Select value={(filters.limit || pagination.limit).toString()} onValueChange={handleLimitChange}>
                    <SelectTrigger className="w-full sm:w-28">
                        <SelectValue placeholder="Page size" />
                    </SelectTrigger>
                    <SelectContent>
                        {[10, 20, 50, 100].map((size) => (
                            <SelectItem key={size} value={size.toString()}>{size}/page</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Bulk actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <div className="text-sm text-muted-foreground">{selectedIds.length} selected</div>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => handleBulkStatus(true)} disabled={isPending}>
                        Activate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleBulkStatus(false)} disabled={isPending}>
                        Deactivate
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isPending}>
                        Delete Selected
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-card overflow-x-auto">
                <table className="w-full min-w-225">
                    <thead className="border-b bg-muted/50">
                        <tr>
                            <th className="p-3 md:p-4 text-left">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={toggleSelectAll}
                                    aria-label="Select all products"
                                />
                            </th>
                            <th className="p-3 md:p-4 text-left font-medium text-sm">Product</th>
                            <th className="p-3 md:p-4 text-left font-medium text-sm">Category</th>
                            <th className="p-3 md:p-4 text-right font-medium text-sm">Price</th>
                            <th className="p-3 md:p-4 text-right font-medium text-sm">Stock</th>
                            <th className="p-3 md:p-4 text-center font-medium text-sm">Status</th>
                            <th className="p-3 md:p-4 text-right font-medium text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id} className="border-b last:border-0 hover:bg-muted/50">
                                <td className="p-3 md:p-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(product.id)}
                                        onChange={() => toggleSelectOne(product.id)}
                                        aria-label={`Select ${product.name}`}
                                    />
                                </td>
                                <td className="p-3 md:p-4">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="relative h-10 w-10 md:h-12 md:w-12 shrink-0 overflow-hidden rounded bg-muted">
                                            {product.images[0] ? (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                                                    No img
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <Link
                                                href={`/admin/products/${product.id}/edit`}
                                                className="font-medium hover:underline text-sm md:text-base line-clamp-2"
                                            >
                                                {product.name}
                                            </Link>
                                            <div className="flex gap-2 text-xs text-muted-foreground flex-wrap">
                                                <span>{product._count.orderItems} orders</span>
                                                <span>•</span>
                                                <span>{product._count.reviews} reviews</span>
                                                {product.isFeatured && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-primary">Featured</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3 md:p-4 text-muted-foreground text-sm">
                                    {product.category?.name || "-"}
                                </td>
                                <td className="p-4 text-right font-medium">
                                    ৳{parseFloat(product.price.toString()).toLocaleString()}
                                </td>
                                <td className="p-4 text-right">
                                    <span
                                        className={
                                            product.stock <= 10
                                                ? "text-red-600 font-medium"
                                                : ""
                                        }
                                    >
                                        {product.stock}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => handleToggleStatus(product.id)}
                                        disabled={isPending}
                                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${product.isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {product.isActive ? "Active" : "Inactive"}
                                    </button>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/admin/products/${product.id}/edit`}>
                                            <Button variant="outline" size="sm">
                                                Edit
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(product.id, product.name)}
                                            disabled={isPending}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {products.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                        No products found
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                        Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                        {pagination.total} products
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page === 1}
                            onClick={() => handlePageChange(pagination.page - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page === pagination.pages}
                            onClick={() => handlePageChange(pagination.page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
