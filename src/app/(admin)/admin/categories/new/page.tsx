import { getAdminCategories } from "@/actions/admin-categories"
import { CategoryForm } from "../category-form"

export default async function NewCategoryPage() {
    const categories = await getAdminCategories()

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Add New Category</h1>
                <p className="text-muted-foreground">
                    Create a new product category
                </p>
            </div>

            <CategoryForm categories={categories} />
        </div>
    )
}
