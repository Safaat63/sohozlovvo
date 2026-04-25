"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { updateAffiliate } from "@/actions/affiliates"
import { toast } from "sonner"

interface AffiliateToggleButtonProps {
    affiliateId: string
    isActive: boolean
}

export function AffiliateToggleButton({ affiliateId, isActive }: AffiliateToggleButtonProps) {
    const [isPending, startTransition] = useTransition()

    const toggleStatus = () => {
        startTransition(async () => {
            const result = await updateAffiliate(affiliateId, { isActive: !isActive })
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(`Affiliate ${!isActive ? "activated" : "deactivated"} successfully`)
            }
        })
    }

    return (
        <Button
            variant={isActive ? "outline" : "default"}
            onClick={toggleStatus}
            disabled={isPending}
            className="w-full sm:w-auto"
        >
            {isPending ? "Updating..." : isActive ? "Deactivate Affiliate" : "Activate Affiliate"}
        </Button>
    )
}
