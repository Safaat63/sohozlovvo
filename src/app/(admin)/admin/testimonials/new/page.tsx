import { TestimonialForm } from "../testimonial-form"

export default function NewTestimonialPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Add Testimonial</h1>
                <p className="text-sm text-muted-foreground">
                    Create a new customer testimonial
                </p>
            </div>

            <TestimonialForm />
        </div>
    )
}
