import { notFound } from "next/navigation"
import { getCategory, getAdminCategories } from "@/actions/admin-categories"
import { CategoryForm } from "../../category-form"

export default async function EditCategoryPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const [category, categories] = await Promise.all([
        getCategory(id),
        getAdminCategories(),
    ])

    if (!category) {
        notFound()
    }

    // Remove current category and its children from parent options
    const availableParents = categories.filter(
        (c) => c.id !== id && c.parent?.id !== id
    )

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Edit Category</h1>
                <p className="text-muted-foreground">
                    Update category details
                </p>
            </div>

            <CategoryForm category={category} categories={availableParents} />
        </div>
    )
}
