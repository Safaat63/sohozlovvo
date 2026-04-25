import { notFound } from "next/navigation"
import { getAdminProduct } from "@/actions/admin-products"
import { getCategories } from "@/actions/products"
import { ProductForm } from "../../product-form"

export default async function EditProductPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const [product, categories] = await Promise.all([
        getAdminProduct(id),
        getCategories(),
    ])

    if (!product) {
        notFound()
    }

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Edit Product</h1>
                <p className="text-muted-foreground">
                    Update product details
                </p>
            </div>

            <ProductForm product={product} categories={categories} />
        </div>
    )
}
