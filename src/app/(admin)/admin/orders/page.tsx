import { getAllOrders } from "@/actions/admin"
import { OrdersTable } from "./orders-table";
export default async function AdminOrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; status?: string; limit?: string }>
}) {
    const params = await searchParams
    const page = parseInt(params.page || "1")
    const limit = parseInt(params.limit || "20")
    const status = params.status as "PENDING" | "VERIFIED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED" | undefined

    const { orders, pagination } = await getAllOrders({ status, page, limit })

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl md:text-3xl font-bold dark:text-white">Orders Management</h1>
                <div className="text-sm text-muted-foreground">{pagination.total} orders</div>
            </div>

            <OrdersTable orders={orders} pagination={pagination} filters={{ status, limit }} />
        </div>
    )
}
