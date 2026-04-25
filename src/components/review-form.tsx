"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { createReview } from "@/actions/reviews"

export function ReviewForm({ productId }: { productId: string }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [rating, setRating] = useState(5)
    const [hoveredRating, setHoveredRating] = useState(0)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")
        setSuccess(false)

        const formData = new FormData(e.currentTarget)
        formData.set("productId", productId)
        formData.set("rating", rating.toString())

        startTransition(async () => {
            const result = await createReview(formData)

            if (result.error) {
                setError(result.error)
            } else {
                setSuccess(true)
                router.refresh()
            }
        })
    }

    if (success) {
        return (
            <div className="rounded-lg bg-green-50 p-4 text-green-700">
                Thank you for your review! Your feedback helps other customers.
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-600">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <Label>Rating *</Label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="text-2xl transition-colors"
                        >
                            <span
                                className={
                                    star <= (hoveredRating || rating)
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                }
                            >
                                ★
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="title">Review Title</Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="Summarize your review"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="comment">Your Review</Label>
                <textarea
                    id="comment"
                    name="comment"
                    rows={4}
                    placeholder="Share your experience with this product..."
                    className="w-full rounded-md border px-3 py-2 text-sm"
                />
            </div>

            <Button type="submit" disabled={isPending}>
                {isPending ? "Submitting..." : "Submit Review"}
            </Button>
        </form>
    )
}
