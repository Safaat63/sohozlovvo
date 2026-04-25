import { getAdminHeroBanners } from "@/actions/admin-hero-banners"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroBannersTable } from "./hero-banners-table"
import { Plus } from "lucide-react"
import { SearchBar } from "./search-bar"

export default async function AdminHeroBannersPage({
    searchParams,
}: {
    searchParams: { search?: string }
}) {
    const banners = await getAdminHeroBanners(searchParams.search)

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Hero Banners</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage hero banners and sliders on homepage
                    </p>
                </div>
                <Link href="/admin/hero-banners/new">
                    <Button size="sm" className="md:hidden">
                        <Plus className="h-4 w-4" />
                    </Button>
                    <Button className="hidden md:flex">Add Banner</Button>
                </Link>
            </div>

            <SearchBar placeholder="Search banners..." />

            <HeroBannersTable banners={banners} />
        </div>
    )
}
