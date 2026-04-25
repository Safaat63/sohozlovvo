"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateAffiliate } from "@/actions/affiliates"
import { toast } from "sonner"
import { Pencil, X, Check } from "lucide-react"

interface AffiliateRateEditorProps {
    affiliateId: string
    currentRate: number
}

export function AffiliateRateEditor({ affiliateId, currentRate }: AffiliateRateEditorProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [rate, setRate] = useState(currentRate.toString())
    const [isPending, startTransition] = useTransition()

    const handleSave = () => {
        const newRate = parseFloat(rate)
        if (isNaN(newRate) || newRate < 0 || newRate > 100) {
            toast.error("Commission rate must be between 0 and 100")
            return
        }

        startTransition(async () => {
            const result = await updateAffiliate(affiliateId, { commissionRate: newRate })
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Commission rate updated successfully")
                setIsEditing(false)
            }
        })
    }

    const handleCancel = () => {
        setRate(currentRate.toString())
        setIsEditing(false)
    }

    if (!isEditing) {
        return (
            <div className="flex items-center justify-between">
                <div>
                    <Label className="text-sm text-muted-foreground">Commission Rate</Label>
                    <p className="text-2xl font-bold">{currentRate}%</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="space-y-2">
                <Label htmlFor="rate">Commission Rate (%)</Label>
                <Input
                    id="rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    disabled={isPending}
                />
            </div>
            <div className="flex gap-2">
                <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isPending}
                    className="flex-1"
                >
                    <Check className="h-4 w-4 mr-1" />
                    {isPending ? "Saving..." : "Save"}
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isPending}
                    className="flex-1"
                >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                </Button>
            </div>
        </div>
    )
}
