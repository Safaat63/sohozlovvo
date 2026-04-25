import { getTestimonial } from "@/actions/admin-testimonials"
import { TestimonialForm } from "../../testimonial-form"
import { notFound } from "next/navigation"

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const testimonial = await getTestimonial(id)

    if (!testimonial) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Edit Testimonial</h1>
                <p className="text-sm text-muted-foreground">
                    Update testimonial details
                </p>
            </div>

            <TestimonialForm testimonial={testimonial} />
        </div>
    )
}
