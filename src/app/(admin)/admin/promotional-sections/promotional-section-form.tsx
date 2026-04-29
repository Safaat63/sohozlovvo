"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { SingleImageUpload } from "@/components/ui/single-image-upload"
import { createPromotionalSection, updatePromotionalSection } from "@/actions/admin-promotional-sections"

type PromotionalSection = {
    id: string
    title: string
    subtitle: string | null
    description: string | null
    discount: string | null
    image: string | null
    link: string | null
    buttonText: string | null
    order: number
    isActive: boolean
}

export function PromotionalSectionForm({ section }: { section?: PromotionalSection }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")
    const [image, setImage] = useState(section?.image || "")
    const [isActive, setIsActive] = useState(section?.isActive ?? true)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")

        const formData = new FormData(e.currentTarget)
        formData.set("image", image)
        formData.set("isActive", isActive.toString())

        startTransition(async () => {
            try {
                if (section) {
                    await updatePromotionalSection(section.id, formData)
                } else {
                    await createPromotionalSection(formData)
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
                    <Label htmlFor="title">Title *</Label>
                    <Input
                        id="title"
                        name="title"
                        required
                        defaultValue={section?.title}
                        placeholder="e.g., Foldable Motorised Treadmill"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                        id="subtitle"
                        name="subtitle"
                        defaultValue={section?.subtitle || ""}
                        placeholder="e.g., Workout At Home"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        rows={3}
                        defaultValue={section?.description || ""}
                        placeholder="e.g., iPhone 14 has the same superspeedy chip..."
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="discount">Discount Text</Label>
                    <Input
                        id="discount"
                        name="discount"
                        defaultValue={section?.discount || ""}
                        placeholder="e.g., Flat 20% off or UP TO 30% OFF"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="image">Image</Label>
                    <SingleImageUpload
                        value={image}
                        onChange={setImage}
                        folder="promotional-sections"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="link">Link URL</Label>
                    <Input
                        id="link"
                        name="link"
                        type="url"
                        defaultValue={section?.link || ""}
                        placeholder="e.g., /products/iphone-14-plus"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="buttonText">Button Text</Label>
                    <Input
                        id="buttonText"
                        name="buttonText"
                        defaultValue={section?.buttonText || ""}
                        placeholder="e.g., Grab Now or Buy Now"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                        id="order"
                        name="order"
                        type="number"
                        defaultValue={section?.order || 0}
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
                    {isPending ? "Saving..." : section ? "Update Section" : "Create Section"}
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
