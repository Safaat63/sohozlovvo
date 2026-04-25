import { getAdminCategories } from "@/actions/admin-categories"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CategoriesTable } from "./categories-table"
import { Plus } from "lucide-react"
import { SearchBar } from "./search-bar"
import { BulkEditDialog } from "./bulk-edit-dialog"

export default async function AdminCategoriesPage({
    searchParams,
}: {
    searchParams: { search?: string }
}) {
    const categories = await getAdminCategories(searchParams.search)

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Categories</h1>
                    <p className="text-sm text-muted-foreground">
                        Organize your products into categories
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <BulkEditDialog categories={categories} />
                    <Link href="/admin/categories/new">
                        <Button size="sm" className="md:hidden">
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Button className="hidden md:flex">Add Category</Button>
                    </Link>
                </div>
            </div>

            <SearchBar placeholder="Search categories..." />

            <CategoriesTable categories={categories} />
        </div>
    )
}
