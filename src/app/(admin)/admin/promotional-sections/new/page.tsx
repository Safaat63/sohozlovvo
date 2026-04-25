import { PromotionalSectionForm } from "../promotional-section-form";

export default function NewPromotionalSectionPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Add Promotional Section</h1>
                <p className="text-sm text-muted-foreground">
                    Create a new promotional section with discount details
                </p>
            </div>

            <PromotionalSectionForm />
        </div>
    )
}
