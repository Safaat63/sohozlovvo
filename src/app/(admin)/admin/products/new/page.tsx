import { getCategories } from "@/actions/products"
import { ProductForm } from "../product-form"

export default async function NewProductPage() {
    const categories = await getCategories()

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Add New Product</h1>
                <p className="text-muted-foreground">
                    Create a new product in your catalog
                </p>
            </div>

            <ProductForm categories={categories} />
        </div>
    )
}
