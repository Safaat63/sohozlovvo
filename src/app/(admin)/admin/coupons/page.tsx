import { getCoupons } from "@/actions/admin-coupons"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CouponsTable } from "./coupons-table"
import { Plus } from "lucide-react"

export default async function AdminCouponsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; status?: string; limit?: string }>
}) {
    const params = await searchParams
    const page = parseInt(params.page || "1")
    const limit = parseInt(params.limit || "20")
    const status = params.status as "active" | "inactive" | "expired" | "all" | undefined

    const { coupons, pagination } = await getCoupons({ page, limit, status })

    type CouponFromDb = Awaited<ReturnType<typeof getCoupons>>["coupons"][number]
    type SerializableCoupon = Omit<CouponFromDb, "discountValue" | "minPurchaseAmount" | "maxDiscountAmount"> & {
        discountValue: number
        minPurchaseAmount: number | null
        maxDiscountAmount: number | null
    }

    const serializableCoupons: SerializableCoupon[] = coupons.map((coupon) => ({
        ...coupon,
        discountValue: Number(coupon.discountValue),
        minPurchaseAmount: coupon.minPurchaseAmount !== null ? Number(coupon.minPurchaseAmount) : null,
        maxDiscountAmount: coupon.maxDiscountAmount !== null ? Number(coupon.maxDiscountAmount) : null,
    }))

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Coupons</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage discount codes and promotions
                    </p>
                </div>
                <Link href="/admin/coupons/new">
                    <Button size="sm" className="md:hidden">
                        <Plus className="h-4 w-4" />
                    </Button>
                    <Button className="hidden md:flex">Add Coupon</Button>
                </Link>
            </div>

            <CouponsTable
                coupons={serializableCoupons}
                pagination={pagination}
                currentStatus={status}
                currentLimit={limit}
            />
        </div>
    )
}
