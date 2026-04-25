import { getPromotionalSection } from "@/actions/admin-promotional-sections"
import { PromotionalSectionForm } from "../../promotional-section-form"
import { notFound } from "next/navigation"

export default async function EditPromotionalSectionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const section = await getPromotionalSection(id)

    if (!section) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Edit Promotional Section</h1>
                <p className="text-sm text-muted-foreground">
                    Update promotional section details
                </p>
            </div>

            <PromotionalSectionForm section={section} />
        </div>
    )
}
