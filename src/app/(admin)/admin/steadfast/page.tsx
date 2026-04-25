import { getOrdersForSteadfast, getSteadfastBalance } from "@/actions/admin-steadfast"
import { SteadfastOrdersTable } from "./steadfast-orders-table"
import { SteadfastDashboard } from "./steadfast-dashboard"

export default async function SteadfastPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; status?: string; hasTracking?: string; limit?: string }>
}) {
    const params = await searchParams
    const page = parseInt(params.page || "1")
    const limit = parseInt(params.limit || "20")
    const status = params.status
    const hasTracking = params.hasTracking === "true" ? true : params.hasTracking === "false" ? false : undefined

    const [ordersData, balanceData] = await Promise.all([
        getOrdersForSteadfast({ page, limit, status, hasTracking }),
        getSteadfastBalance().catch(() => ({ error: "Unable to fetch balance" })),
    ])

    const balance = "success" in balanceData && balanceData.success ? balanceData.balance : null

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold dark:text-white">Steadfast Courier</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your shipments with Steadfast Courier Limited
                    </p>
                </div>
            </div>

            <SteadfastDashboard balance={balance} />

            <SteadfastOrdersTable
                orders={ordersData.orders}
                pagination={ordersData.pagination}
                filters={{ status, hasTracking, limit }}
            />
        </div>
    )
}
