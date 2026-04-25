import { notFound } from "next/navigation"
import { getCoupon } from "@/actions/admin-coupons"
import { getAffiliates } from "@/actions/affiliates"
import { CouponForm } from "../../coupon-form"
import { prisma } from "@/lib/prisma"

export default async function EditCouponPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const [coupon, affiliatesData] = await Promise.all([
        getCoupon(id),
        getAffiliates(),
    ])

    if (!coupon) {
        notFound()
    }

    // Get linked affiliate if any
    const linkedAffiliate = await prisma.affiliateCoupon.findFirst({
        where: { couponId: coupon.id },
        include: {
            affiliate: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    })

    const affiliates = affiliatesData.map((aff) => ({
        id: aff.id,
        code: aff.code,
        user: aff.user,
    }))

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Edit Coupon</h1>
                <p className="text-muted-foreground">
                    Update coupon details and affiliate linking
                </p>
            </div>

            <CouponForm
                coupon={coupon}
                affiliates={affiliates}
                linkedAffiliate={linkedAffiliate}
            />
        </div>
    )
}
