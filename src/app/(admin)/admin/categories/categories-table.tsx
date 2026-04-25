"use client"

import { useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { deleteCategory } from "@/actions/admin-categories"

type Category = {
    id: string
    name: string
    slug: string
    description: string | null
    image: string | null
    isActive: boolean
    showInMenu?: boolean
    parent: { id: string; name: string } | null
    _count: { products: number; children: number }
}

export function CategoriesTable({ categories }: { categories: Category[] }) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return

        startTransition(async () => {
            const result = await deleteCategory(id)
            if (result.error) {
                alert(result.error)
            }
        })
    }

    // Build tree structure
    const rootCategories = categories.filter((c) => !c.parent)
    const childrenMap = new Map<string, Category[]>()
    categories.forEach((c) => {
        if (c.parent) {
            const children = childrenMap.get(c.parent.id) || []
            children.push(c)
            childrenMap.set(c.parent.id, children)
        }
    })

    const renderCategory = (category: Category, level = 0) => {
        const children = childrenMap.get(category.id) || []

        return (
            <>
                <tr key={category.id} className="border-b last:border-0">
                    <td className="p-3 md:p-4">
                        <div className="flex items-center gap-3" style={{ paddingLeft: `${level * 24}px` }}>
                            {category.image ? (
                                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                                    <Image
                                        src={category.image}
                                        alt={category.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="h-10 w-10 shrink-0 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                    📁
                                </div>
                            )}
                            <div>
                                <div className="font-medium">{category.name}</div>
                                <div className="text-sm text-muted-foreground">
                                    /{category.slug}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td className="p-3 md:p-4 text-center">
                        {category._count.products}
                    </td>
                    <td className="p-3 md:p-4 text-center">
                        {category._count.children}
                    </td>
                    <td className="p-3 md:p-4 text-center">
                        <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${category.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                                }`}
                        >
                            {category.isActive ? "Active" : "Inactive"}
                        </span>
                    </td>
                    <td className="p-3 md:p-4 text-center">
                        <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${category.showInMenu !== false
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                                }`}
                        >
                            {category.showInMenu !== false ? "Shown" : "Hidden"}
                        </span>
                    </td>
                    <td className="p-3 md:p-4 text-right">
                        <div className="flex justify-end gap-2">
                            <Link href={`/admin/categories/${category.id}/edit`}>
                                <Button variant="outline" size="sm">
                                    Edit
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(category.id, category.name)}
                                disabled={isPending || category._count.products > 0 || category._count.children > 0}
                                className="text-red-600 hover:text-red-700 disabled:text-gray-400"
                            >
                                Delete
                            </Button>
                        </div>
                    </td>
                </tr>
                {children.map((child) => renderCategory(child, level + 1))}
            </>
        )
    }

    return (
        <div className="rounded-lg border bg-card overflow-x-auto">
            <table className="w-full min-w-150">
                <thead className="border-b bg-muted/50">
                    <tr>
                        <th className="p-3 md:p-4 text-left font-medium">Category</th>
                        <th className="p-3 md:p-4 text-center font-medium">Products</th>
                        <th className="p-3 md:p-4 text-center font-medium">Subcategories</th>
                        <th className="p-3 md:p-4 text-center font-medium">Status</th>
                        <th className="p-3 md:p-4 text-center font-medium">Menu</th>
                        <th className="p-3 md:p-4 text-right font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rootCategories.map((category) => renderCategory(category))}
                </tbody>
            </table>

            {categories.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                    No categories yet. Create your first category to get started.
                </div>
            )}
        </div>
    )
}
