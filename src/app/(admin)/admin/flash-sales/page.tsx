import Link from "next/link"
import { getFlashSales } from "@/actions/admin-flash-sales"
import { Button } from "@/components/ui/button"
import { FlashSalesTable } from "./flash-sales-table"
import { Plus } from "lucide-react"

export default async function AdminFlashSalesPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; status?: string }>
}) {
    const params = await searchParams
    const page = parseInt(params.page || "1")
    const status = params.status as "active" | "upcoming" | "ended" | "all" | undefined

    const { flashSales, pagination } = await getFlashSales({ page, status })

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Flash Sales</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage limited-time deals
                    </p>
                </div>
                <Link href="/admin/flash-sales/new">
                    <Button size="sm" className="md:hidden">
                        <Plus className="h-4 w-4" />
                    </Button>
                    <Button className="hidden md:flex">Create Flash Sale</Button>
                </Link>
            </div>

            <FlashSalesTable
                flashSales={flashSales}
                pagination={pagination}
                filters={{ status }}
            />
        </div>
    )
}
