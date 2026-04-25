"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
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
import { SingleImageUpload } from "@/components/single-image-upload"
import { createCategory, updateCategory } from "@/actions/admin-categories"

type Category = {
    id: string
    name: string
    slug: string
    description: string | null
    image: string | null
    isActive: boolean
    showInMenu?: boolean
    parent: { id: string; name: string } | null
}

export function CategoryForm({
    category,
    categories,
}: {
    category?: Category
    categories: Category[]
}) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")
    const [image, setImage] = useState(category?.image || "")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")

        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            const result = category
                ? await updateCategory(category.id, formData)
                : await createCategory(formData)

            if (result.error) {
                setError(result.error)
            } else {
                router.push("/admin/categories")
            }
        })
    }

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
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
                    <Label htmlFor="name">Category Name *</Label>
                    <Input
                        id="name"
                        name="name"
                        required
                        defaultValue={category?.name}
                        onChange={(e) => {
                            if (!category) {
                                const slugInput = document.getElementById("slug") as HTMLInputElement
                                if (slugInput) {
                                    slugInput.value = generateSlug(e.target.value)
                                }
                            }
                        }}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                        id="slug"
                        name="slug"
                        required
                        defaultValue={category?.slug}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                        id="description"
                        name="description"
                        rows={3}
                        defaultValue={category?.description || ""}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Category Image</Label>
                    <SingleImageUpload
                        name="image"
                        value={image}
                        onChange={setImage}
                        placeholder="Upload category image"
                        previewSize={120}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="parentId">Parent Category</Label>
                    <Select name="parentId" defaultValue={category?.parent?.id || "none"}>
                        <SelectTrigger>
                            <SelectValue placeholder="None (top-level category)" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="pt-2">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="isActive"
                            value="true"
                            defaultChecked={category?.isActive ?? true}
                            className="h-4 w-4"
                        />
                        <span>Active</span>
                    </label>
                </div>

                <div>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="showInMenu"
                            value="true"
                            defaultChecked={category?.showInMenu ?? true}
                            className="h-4 w-4"
                        />
                        <span>Show in Desktop Menu</span>
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : category ? "Update Category" : "Create Category"}
                </Button>
            </div>
        </form>
    )
}
