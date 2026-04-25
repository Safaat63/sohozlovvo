import { notFound } from "next/navigation"
import { getFlashSale, getProductsForFlashSale } from "@/actions/admin-flash-sales"
import { FlashSaleForm } from "../../flash-sale-form"

export default async function EditFlashSalePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const [flashSale, products] = await Promise.all([
        getFlashSale(id),
        getProductsForFlashSale(),
    ])

    if (!flashSale) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Edit Flash Sale</h1>
                <p className="text-muted-foreground">
                    Update flash sale details
                </p>
            </div>

            <FlashSaleForm flashSale={flashSale} products={products} />
        </div>
    )
}
