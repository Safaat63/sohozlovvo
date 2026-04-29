"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SingleImageUpload } from "@/components/ui/single-image-upload"
import { createTestimonial, updateTestimonial } from "@/actions/admin-testimonials"

type Testimonial = {
    id: string
    name: string | null
    image: string | null
    review: string | null
    rating: number | null
    layout: "IMAGE_ONLY" | "NAME_AND_REVIEW"
    order: number
    isActive: boolean
}

export function TestimonialForm({ testimonial }: { testimonial?: Testimonial }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")
    const [image, setImage] = useState(testimonial?.image || "")
    const [isActive, setIsActive] = useState(testimonial?.isActive ?? true)
    const [layout, setLayout] = useState<"IMAGE_ONLY" | "NAME_AND_REVIEW">(
        testimonial?.layout || "NAME_AND_REVIEW"
    )

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")

        const formData = new FormData(e.currentTarget)
        formData.set("image", image)
        formData.set("isActive", isActive.toString())
        formData.set("layout", layout)

        startTransition(async () => {
            try {
                if (testimonial) {
                    await updateTestimonial(testimonial.id, formData)
                } else {
                    await createTestimonial(formData)
                }
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "An error occurred"
                setError(message)
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-600">
                    {error}
                </div>
            )}

            <div className="rounded-lg border bg-card p-6 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="layout">Layout Type</Label>
                    <Select
                        value={layout}
                        onValueChange={(value: "IMAGE_ONLY" | "NAME_AND_REVIEW") => setLayout(value)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="IMAGE_ONLY">Image Only</SelectItem>
                            <SelectItem value="NAME_AND_REVIEW">Name and Review</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="image">Image</Label>
                    <SingleImageUpload
                        value={image}
                        onChange={setImage}
                        folder="testimonials"
                    />
                </div>

                {layout === "NAME_AND_REVIEW" && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="name">Customer Name</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={testimonial?.name || ""}
                                placeholder="e.g., John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="review">Review</Label>
                            <Textarea
                                id="review"
                                name="review"
                                rows={4}
                                defaultValue={testimonial?.review || ""}
                                placeholder="Enter customer review..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rating">Rating (1-5)</Label>
                            <Input
                                id="rating"
                                name="rating"
                                type="number"
                                min="1"
                                max="5"
                                defaultValue={testimonial?.rating || 5}
                            />
                        </div>
                    </>
                )}

                <div className="space-y-2">
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                        id="order"
                        name="order"
                        type="number"
                        defaultValue={testimonial?.order || 0}
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
                    {isPending ? "Saving..." : testimonial ? "Update Testimonial" : "Create Testimonial"}
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
