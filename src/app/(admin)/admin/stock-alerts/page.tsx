import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { getStockAlertsAdmin } from "@/actions/stock-alerts"
import { StockAlertsTable } from "./stock-alerts-table"
export default async function StockAlertsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; limit?: string }>
}) {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/")
    }

    const params = await searchParams
    const page = parseInt(params.page || "1")
    const limit = parseInt(params.limit || "20")

    const { alerts, pagination } = await getStockAlertsAdmin({ page, limit })

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl md:text-3xl font-bold dark:text-white">Stock Alerts</h1>
                <Badge variant="outline" className="w-fit text-xs md:text-sm">{pagination.total} alerts</Badge>
            </div>

            <StockAlertsTable alerts={alerts} pagination={pagination} />
        </div>
    )
}
