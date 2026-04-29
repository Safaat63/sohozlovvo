"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SingleImageUpload } from "@/components/ui/single-image-upload"
import { createHeroBanner, updateHeroBanner } from "@/actions/admin-hero-banners"

type HeroBanner = {
    id: string
    title: string
    subtitle: string | null
    image: string
    mobileImage: string | null
    link: string | null
    buttonText: string | null
    order: number
    isActive: boolean
}

export function HeroBannerForm({ banner }: { banner?: HeroBanner }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")
    const [image, setImage] = useState(banner?.image || "")
    const [mobileImage, setMobileImage] = useState(banner?.mobileImage || "")
    const [isActive, setIsActive] = useState(banner?.isActive ?? true)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")

        const formData = new FormData(e.currentTarget)
        formData.set("image", image)
        formData.set("mobileImage", mobileImage)
        formData.set("isActive", isActive.toString())

        startTransition(async () => {
            try {
                if (banner) {
                    await updateHeroBanner(banner.id, formData)
                } else {
                    await createHeroBanner(formData)
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
                        defaultValue={banner?.title}
                        placeholder="e.g., Summer Sale 2026"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                        id="subtitle"
                        name="subtitle"
                        defaultValue={banner?.subtitle || ""}
                        placeholder="e.g., Up to 50% off on selected items"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="image">Desktop Image *</Label>
                    <SingleImageUpload
                        value={image}
                        onChange={setImage}
                        folder="hero-banners"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="mobileImage">Mobile Image (Optional)</Label>
                    <SingleImageUpload
                        value={mobileImage}
                        onChange={setMobileImage}
                        folder="hero-banners"
                    />
                    <p className="text-xs text-muted-foreground">
                        Recommended for better mobile display
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="link">Link URL</Label>
                    <Input
                        id="link"
                        name="link"
                        type="url"
                        defaultValue={banner?.link || ""}
                        placeholder="e.g., /categories/summer-sale"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="buttonText">Button Text</Label>
                    <Input
                        id="buttonText"
                        name="buttonText"
                        defaultValue={banner?.buttonText || ""}
                        placeholder="e.g., Shop Now"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                        id="order"
                        name="order"
                        type="number"
                        defaultValue={banner?.order || 0}
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
                    {isPending ? "Saving..." : banner ? "Update Banner" : "Create Banner"}
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
