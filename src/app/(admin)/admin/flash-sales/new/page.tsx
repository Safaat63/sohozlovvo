import { getProductsForFlashSale } from "@/actions/admin-flash-sales"
import { FlashSaleForm } from "../flash-sale-form"

export default async function NewFlashSalePage() {
    const products = await getProductsForFlashSale()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Create Flash Sale</h1>
                <p className="text-muted-foreground">
                    Set up a limited-time deal on a product
                </p>
            </div>

            <FlashSaleForm products={products} />
        </div>
    )
}
