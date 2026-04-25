import { getAdminTestimonials } from "@/actions/admin-testimonials"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TestimonialsTable } from "./testimonials-table"
import { Plus } from "lucide-react"
import { SearchBar } from "./search-bar"

export default async function AdminTestimonialsPage({
    searchParams,
}: {
    searchParams: { search?: string }
}) {
    const testimonials = await getAdminTestimonials(searchParams.search)

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Testimonials</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage customer testimonials on homepage
                    </p>
                </div>
                <Link href="/admin/testimonials/new">
                    <Button size="sm" className="md:hidden">
                        <Plus className="h-4 w-4" />
                    </Button>
                    <Button className="hidden md:flex">Add Testimonial</Button>
                </Link>
            </div>

            <SearchBar placeholder="Search testimonials..." />

            <TestimonialsTable testimonials={testimonials} />
        </div>
    )
}
