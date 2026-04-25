import { getAdminPromotionalSections } from "@/actions/admin-promotional-sections"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { SearchBar } from "./search-bar"
import { PromotionalSectionsTable } from "./promotional-sections-table"

export default async function AdminPromotionalSectionsPage({
    searchParams,
}: {
    searchParams: { search?: string }
}) {
    const sections = await getAdminPromotionalSections(searchParams.search)

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Promotional Sections</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage promotional banners with discounts
                    </p>
                </div>
                <Link href="/admin/promotional-sections/new">
                    <Button size="sm" className="md:hidden">
                        <Plus className="h-4 w-4" />
                    </Button>
                    <Button className="hidden md:flex">Add Section</Button>
                </Link>
            </div>

            <SearchBar placeholder="Search sections..." />

            <PromotionalSectionsTable sections={sections} />
        </div>
    )
}
