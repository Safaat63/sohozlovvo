import { SpecialOfferForm } from "../special-offer-form"

export default function NewSpecialOfferPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Add Special Offer</h1>
                <p className="text-sm text-muted-foreground">
                    Create a new special offer with countdown
                </p>
            </div>

            <SpecialOfferForm />
        </div>
    )
}
