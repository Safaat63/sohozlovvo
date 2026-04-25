import { getAdminSpecialOffers } from "@/actions/admin-special-offers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SpecialOffersTable } from "./special-offers-table"
import { Plus } from "lucide-react"
import { SearchBar } from "./search-bar"

export default async function AdminSpecialOffersPage({
    searchParams,
}: {
    searchParams: { search?: string }
}) {
    const offers = await getAdminSpecialOffers(searchParams.search)

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Special Offers</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage countdown offers and special promotions
                    </p>
                </div>
                <Link href="/admin/special-offers/new">
                    <Button size="sm" className="md:hidden">
                        <Plus className="h-4 w-4" />
                    </Button>
                    <Button className="hidden md:flex">Add Offer</Button>
                </Link>
            </div>

            <SearchBar placeholder="Search offers..." />

            <SpecialOffersTable offers={offers} />
        </div>
    )
}
