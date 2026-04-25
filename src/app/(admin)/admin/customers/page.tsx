import { getCustomers } from "@/actions/admin-customers"
import { CustomersTable } from "./customers-table"

export default async function AdminCustomersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string; role?: string; limit?: string }>
}) {
    const params = await searchParams
    const page = parseInt(params.page || "1")
    const limit = parseInt(params.limit || "20")
    const search = params.search
    const role = params.role as "CUSTOMER" | "ADMIN" | "all" | undefined

    const { customers, pagination } = await getCustomers({ page, limit, search, role })

    return (
        <div className="space-y-4 md:space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Customers</h1>
                <p className="text-sm text-muted-foreground">
                    Manage customers and user accounts
                </p>
            </div>

            <CustomersTable
                customers={customers}
                pagination={pagination}
                filters={{ search, role, limit }}
            />
        </div>
    )
}
