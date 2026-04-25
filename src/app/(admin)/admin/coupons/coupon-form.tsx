"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createCoupon, updateCoupon } from "@/actions/admin-coupons"
import { linkAffiliateToCoupon, unlinkAffiliateCoupon } from "@/actions/affiliates"

type Coupon = {
    id: string
    code: string
    description: string | null
    discountType: string
    discountValue: any
    minPurchaseAmount: any
    maxDiscountAmount: any
    usageLimit: number | null
    startDate: Date | null
    endDate: Date | null
    isActive: boolean
}

type Affiliate = {
    id: string
    code: string
    user: {
        name: string | null
        email: string
    }
}

type AffiliateCoupon = {
    affiliateId: string
    affiliate: {
        id: string
        code: string
        user: {
            name: string | null
            email: string
        }
    }
}

export function CouponForm({
    coupon,
    affiliates = [],
    linkedAffiliate
}: {
    coupon?: Coupon
    affiliates?: Affiliate[]
    linkedAffiliate?: AffiliateCoupon | null
}) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")
    const [discountType, setDiscountType] = useState(coupon?.discountType || "PERCENTAGE")
    const [selectedAffiliate, setSelectedAffiliate] = useState(linkedAffiliate?.affiliateId || "none")
    const [linkingAffiliate, setLinkingAffiliate] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")

        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            const result = coupon
                ? await updateCoupon(coupon.id, formData)
                : await createCoupon(formData)

            if (result.error) {
                setError(result.error)
            } else {
                router.push("/admin/coupons")
            }
        })
    }

    const handleAffiliateChange = async (affiliateId: string) => {
        if (!coupon) {
            setSelectedAffiliate(affiliateId)
            return
        }

        setLinkingAffiliate(true)
        setError("")

        try {
            if (affiliateId === "none") {
                // Unlink current affiliate
                if (linkedAffiliate) {
                    const result = await unlinkAffiliateCoupon(linkedAffiliate.affiliateId, coupon.id)
                    if (result.error) {
                        setError(result.error)
                    } else {
                        setSelectedAffiliate("none")
                        router.refresh()
                    }
                }
            } else {
                // Link new affiliate
                const result = await linkAffiliateToCoupon(affiliateId, coupon.id)
                if (result.error) {
                    setError(result.error)
                } else {
                    setSelectedAffiliate(affiliateId)
                    router.refresh()
                }
            }
        } finally {
            setLinkingAffiliate(false)
        }
    }

    const formatDate = (date: Date | null) => {
        if (!date) return ""
        return format(new Date(date), "yyyy-MM-dd")
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-600">
                    {error}
                </div>
            )}

            <div className="rounded-lg border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">Coupon Details</h2>

                <div className="space-y-2">
                    <Label htmlFor="code">Coupon Code *</Label>
                    <Input
                        id="code"
                        name="code"
                        required
                        defaultValue={coupon?.code}
                        placeholder="e.g., SUMMER20"
                        className="uppercase"
                    />
                    <p className="text-sm text-muted-foreground">
                        Customers will enter this code at checkout
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                        id="description"
                        name="description"
                        rows={2}
                        defaultValue={coupon?.description || ""}
                        placeholder="Internal note about this coupon"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                    />
                </div>
            </div>

            <div className="rounded-lg border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">Discount</h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="discountType">Discount Type *</Label>
                        <Select
                            name="discountType"
                            defaultValue={discountType}
                            onValueChange={setDiscountType}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                <SelectItem value="FIXED_AMOUNT">Fixed Amount (৳)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="discountValue">
                            {discountType === "PERCENTAGE" ? "Percentage" : "Amount"} *
                        </Label>
                        <Input
                            id="discountValue"
                            name="discountValue"
                            type="number"
                            step="0.01"
                            min="0"
                            max={discountType === "PERCENTAGE" ? "100" : undefined}
                            required
                            defaultValue={coupon ? parseFloat(coupon.discountValue.toString()) : ""}
                        />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="minPurchaseAmount">Minimum Purchase (৳)</Label>
                        <Input
                            id="minPurchaseAmount"
                            name="minPurchaseAmount"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={coupon?.minPurchaseAmount ? parseFloat(coupon.minPurchaseAmount.toString()) : ""}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="maxDiscountAmount">Maximum Discount (৳)</Label>
                        <Input
                            id="maxDiscountAmount"
                            name="maxDiscountAmount"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={coupon?.maxDiscountAmount ? parseFloat(coupon.maxDiscountAmount.toString()) : ""}
                        />
                        <p className="text-sm text-muted-foreground">
                            For percentage discounts, caps the maximum savings
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">Validity</h2>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="usageLimit">Usage Limit</Label>
                        <Input
                            id="usageLimit"
                            name="usageLimit"
                            type="number"
                            min="0"
                            defaultValue={coupon?.usageLimit || ""}
                            placeholder="Unlimited"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                            id="startDate"
                            name="startDate"
                            type="date"
                            defaultValue={formatDate(coupon?.startDate || null)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                            id="endDate"
                            name="endDate"
                            type="date"
                            defaultValue={formatDate(coupon?.endDate || null)}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="isActive"
                            value="true"
                            defaultChecked={coupon?.isActive ?? true}
                            className="h-4 w-4"
                        />
                        <span>Active</span>
                    </label>
                </div>
            </div>

            {/* Affiliate Linking Section */}
            {affiliates.length > 0 && (
                <div className="rounded-lg border bg-card p-6 space-y-4">
                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold">Affiliate Linking</h2>
                        <p className="text-sm text-muted-foreground">
                            Link this coupon to an affiliate. When customers use this coupon, the linked affiliate will earn commission.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="affiliate">Linked Affiliate</Label>
                        <Select
                            value={selectedAffiliate}
                            onValueChange={handleAffiliateChange}
                            disabled={linkingAffiliate}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select affiliate" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">
                                    No affiliate linked
                                </SelectItem>
                                {affiliates.map((affiliate) => (
                                    <SelectItem key={affiliate.id} value={affiliate.id}>
                                        {affiliate.user.name || affiliate.user.email} ({affiliate.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {linkingAffiliate && (
                            <p className="text-sm text-muted-foreground">
                                Updating affiliate link...
                            </p>
                        )}
                        {selectedAffiliate !== "none" && coupon && (
                            <p className="text-sm text-green-600">
                                ✓ This coupon is linked to an affiliate
                            </p>
                        )}
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : coupon ? "Update Coupon" : "Create Coupon"}
                </Button>
            </div>
        </form>
    )
}
