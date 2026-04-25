import { getSpecialOffer } from "@/actions/admin-special-offers"
import { SpecialOfferForm } from "../../special-offer-form"
import { notFound } from "next/navigation"

export default async function EditSpecialOfferPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const offer = await getSpecialOffer(id)

    if (!offer) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Edit Special Offer</h1>
                <p className="text-sm text-muted-foreground">
                    Update special offer details
                </p>
            </div>

            <SpecialOfferForm offer={offer} />
        </div>
    )
}
