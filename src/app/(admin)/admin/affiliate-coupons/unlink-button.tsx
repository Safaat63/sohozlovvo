"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { unlinkAffiliateCoupon } from "@/actions/affiliates"

export function AffiliateCouponUnlinkButton({
    affiliateId,
    couponId,
}: {
    affiliateId: string
    couponId: string
    couponCode: string
}) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [showConfirm, setShowConfirm] = useState(false)

    const handleUnlink = () => {
        if (!showConfirm) {
            setShowConfirm(true)
            return
        }

        startTransition(async () => {
            const result = await unlinkAffiliateCoupon(affiliateId, couponId)
            if (result.error) {
                alert(result.error)
            } else {
                router.refresh()
            }
            setShowConfirm(false)
        })
    }

    if (showConfirm) {
        return (
            <div className="flex gap-1">
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleUnlink}
                    disabled={isPending}
                    className="text-xs"
                >
                    {isPending ? "Unlinking..." : "Confirm"}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConfirm(false)}
                    disabled={isPending}
                    className="text-xs"
                >
                    Cancel
                </Button>
            </div>
        )
    }

    return (
        <Button
            variant="destructive"
            size="sm"
            onClick={handleUnlink}
            disabled={isPending}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
