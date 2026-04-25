import { getAllFeedback } from "@/actions/admin"
import { FeedbackTable } from "./feedback-table"

export default async function AdminFeedbackPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; status?: string; type?: string; limit?: string }>
}) {
    const params = await searchParams
    const page = parseInt(params.page || "1")
    const limit = parseInt(params.limit || "20")
    const status = params.status
    const type = params.type

    const { feedback, pagination } = await getAllFeedback({ status, type, page, limit })

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl md:text-3xl font-bold dark:text-white">Customer Feedback</h1>
                <div className="text-sm text-muted-foreground">{pagination.total} feedback messages</div>
            </div>

            <FeedbackTable feedback={feedback} pagination={pagination} filters={{ status, type, limit }} />
        </div>
    )
}