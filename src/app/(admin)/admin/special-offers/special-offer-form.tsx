"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { createSpecialOffer, updateSpecialOffer } from "@/actions/admin-special-offers"
import { format } from "date-fns"

type SpecialOffer = {
    id: string
    title: string
    productId: string | null
    productLink: string | null
    endDate: Date
    order: number
    isActive: boolean
}

export function SpecialOfferForm({ offer }: { offer?: SpecialOffer }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")
    const [isActive, setIsActive] = useState(offer?.isActive ?? true)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")

        const formData = new FormData(e.currentTarget)
        formData.set("isActive", isActive.toString())

        startTransition(async () => {
            try {
                if (offer) {
                    await updateSpecialOffer(offer.id, formData)
                } else {
                    await createSpecialOffer(formData)
                }
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "An error occurred"
                setError(message)
            }
        })
    }

    const defaultEndDate = offer?.endDate
        ? format(new Date(offer.endDate), "yyyy-MM-dd'T'HH:mm")
        : ""

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-600">
                    {error}
                </div>
            )}

            <div className="rounded-lg border bg-card p-6 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Offer Title *</Label>
                    <Input
                        id="title"
                        name="title"
                        required
                        defaultValue={offer?.title}
                        placeholder="e.g., Flash Sale - 50% Off!"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="productLink">Product Link</Label>
                    <Input
                        id="productLink"
                        name="productLink"
                        defaultValue={offer?.productLink || ""}
                        placeholder="e.g., /products/iphone-14-plus"
                    />
                    <p className="text-xs text-muted-foreground">
                        Link to the product page when offer is clicked
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="endDate">End Date & Time *</Label>
                    <Input
                        id="endDate"
                        name="endDate"
                        type="datetime-local"
                        required
                        defaultValue={defaultEndDate}
                    />
                    <p className="text-xs text-muted-foreground">
                        Countdown will show time remaining until this date
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                        id="order"
                        name="order"
                        type="number"
                        defaultValue={offer?.order || 0}
                        placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">
                        Lower numbers appear first
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Switch
                        id="isActive"
                        checked={isActive}
                        onCheckedChange={setIsActive}
                    />
                    <Label htmlFor="isActive" className="cursor-pointer">
                        Active
                    </Label>
                </div>
            </div>

            <div className="flex gap-4">
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : offer ? "Update Offer" : "Create Offer"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                >
                    Cancel
                </Button>
            </div>
        </form>
    )
}
