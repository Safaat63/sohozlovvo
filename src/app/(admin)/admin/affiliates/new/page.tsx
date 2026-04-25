import { AffiliateForm } from "../affiliate-form"

export default function NewAffiliatePage() {
    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Create Affiliate</h1>
                <p className="text-muted-foreground mt-1">
                    Add a new affiliate to your program
                </p>
            </div>

            <AffiliateForm />
        </div>
    )
}
