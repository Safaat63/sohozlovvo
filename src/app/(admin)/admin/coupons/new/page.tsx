import { CouponForm } from "../coupon-form"

export default function NewCouponPage() {
    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Add New Coupon</h1>
                <p className="text-muted-foreground">
                    Create a new discount code
                </p>
            </div>

            <CouponForm />
        </div>
    )
}
