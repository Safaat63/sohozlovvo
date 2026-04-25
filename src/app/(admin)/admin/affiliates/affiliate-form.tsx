"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createAffiliateByEmail } from "@/actions/affiliates"

export function AffiliateForm() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const commissionRate = parseFloat(formData.get("commissionRate") as string)

        startTransition(async () => {
            const result = await createAffiliateByEmail(email, commissionRate)

            if ("error" in result && result.error) {
                setError(result.error)
            } else {
                router.push("/admin/affiliates")
                router.refresh()
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Affiliate Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">User Email *</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="user@example.com"
                            disabled={isPending}
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter the email of an existing user to make them an affiliate
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                        <Input
                            id="commissionRate"
                            name="commissionRate"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            defaultValue="10"
                            required
                            disabled={isPending}
                        />
                        <p className="text-xs text-muted-foreground">
                            Percentage of order total the affiliate earns on each sale
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isPending}
                    className="flex-1 sm:flex-initial"
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="flex-1 sm:flex-initial">
                    {isPending ? "Creating..." : "Create Affiliate"}
                </Button>
            </div>
        </form>
    )
}
