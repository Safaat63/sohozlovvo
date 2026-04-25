import { getAdminReviews } from "@/actions/admin-reviews"
import { ReviewsTable } from "./reviews-table"

export default async function AdminReviewsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string; rating?: string; verified?: string }>
}) {
    const params = await searchParams
    const page = parseInt(params.page || "1")
    const search = params.search
    const rating = params.rating ? parseInt(params.rating) : undefined
    const verified = params.verified as "verified" | "unverified" | "all" | undefined

    const { reviews, pagination } = await getAdminReviews({
        page,
        search,
        rating,
        verified,
    })

    return (
        <div className="space-y-4 md:space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Reviews</h1>
                <p className="text-sm text-muted-foreground">
                    Manage customer reviews and ratings
                </p>
            </div>

            <ReviewsTable
                reviews={reviews}
                pagination={pagination}
                filters={{ search, rating, verified }}
            />
        </div>
    )
}
