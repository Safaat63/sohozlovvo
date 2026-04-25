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
import { createProduct, updateProduct } from "@/actions/admin-products"
import { ImageUpload } from "@/components/image-upload"
import { Plus, Trash2, Copy, Sparkles, Check, X, ImagePlus, Loader2 } from "lucide-react"
import { uploadImage } from "@/actions/upload"
import Image from "next/image"

type VariationOption = {
    id: string
    optionName: string
    isActive: boolean
    image?: string | null
    hexCode?: string | null
}

type Variation = {
    id: string
    variationName: string
    options: VariationOption[]
}

type Combination = {
    id: string
    optionIds: string[]
    label: string
    price: string
    stock: number
    sku: string
    isActive: boolean
}

type Product = {
    id: string
    name: string
    slug: string
    description: string | null
    price: { toString: () => string }
    compareAtPrice: { toString: () => string } | null
    costPrice: { toString: () => string } | null
    sku: string | null
    stock: number
    lowStockAlert: number
    brand: string | null
    categoryId: string | null
    isActive: boolean
    isFeatured: boolean
    images: string[]
    discountType: string | null
    discountValue: { toString: () => string } | null
    discountStartDate: Date | null
    discountEndDate: Date | null
    variations?: {
        id: string
        variationName: string
        options: {
            id: string
            optionName: string
            isActive: boolean
            image?: string | null
            hexCode?: string | null
        }[]
    }[]
    combinations?: {
        id: string
        sku: string | null
        stock: number
        price: { toString: () => string } | null
        isActive: boolean
        options: {
            optionId: string
        }[]
    }[]
}

type Category = {
    id: string
    name: string
    slug: string
}

// Helper to convert product variations to form state
function convertVariationsToState(productVariations?: Product["variations"]): Variation[] {
    if (!productVariations) return []
    return productVariations.map((v) => ({
        id: v.id,
        variationName: v.variationName,
        options: v.options.map((o) => ({
            id: o.id,
            optionName: o.optionName,
            isActive: o.isActive,
            image: o.image || null,
            hexCode: o.hexCode || null,
        })),
    }))
}

// Helper to convert product combinations to form state
function convertCombinationsToState(
    productCombinations?: Product["combinations"],
    variations?: Variation[]
): Combination[] {
    if (!productCombinations || !variations) return []

    return productCombinations.map((combo) => {
        const optionIds = combo.options.map(o => o.optionId)
        // Build label from option names
        const labelParts: string[] = []
        for (const variation of variations) {
            const option = variation.options.find(o => optionIds.includes(o.id))
            if (option) {
                labelParts.push(option.optionName)
            }
        }

        return {
            id: combo.id,
            optionIds,
            label: labelParts.join(" / "),
            price: combo.price?.toString() || "",
            stock: combo.stock,
            sku: combo.sku || "",
            isActive: combo.isActive,
        }
    })
}

// Generate all combinations from variations
function generateCombinations(variations: Variation[]): Combination[] {
    if (variations.length === 0) return []

    // Filter to only valid variations with non-empty option names
    const validVariations = variations.filter(v =>
        v.variationName &&
        v.options.length > 0 &&
        v.options.some(o => o.optionName && o.optionName.trim() !== "")
    )
    if (validVariations.length === 0) return []

    // Only use options with non-empty names
    const optionSets = validVariations.map(v =>
        v.options.filter(o => o.optionName && o.optionName.trim() !== "")
    ).filter(opts => opts.length > 0)

    if (optionSets.length === 0) return []

    function cartesian(arrays: VariationOption[][]): VariationOption[][] {
        if (arrays.length === 0) return [[]]
        const [first, ...rest] = arrays
        const restCombinations = cartesian(rest)
        const result: VariationOption[][] = []
        for (const item of first) {
            for (const combo of restCombinations) {
                result.push([item, ...combo])
            }
        }
        return result
    }

    const allCombinations = cartesian(optionSets)

    return allCombinations.map((combo) => ({
        id: Math.random().toString(),
        optionIds: combo.map(o => o.id),
        label: combo.map(o => o.optionName).join(" / "),
        price: "",
        stock: 0,
        sku: "",
        isActive: true,
    }))
}

export function ProductForm({
    product,
    categories,
}: {
    product?: Product
    categories: Category[]
}) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")
    const [images, setImages] = useState<string[]>(product?.images || [])
    const [variations, setVariations] = useState<Variation[]>(convertVariationsToState(product?.variations))
    const [combinations, setCombinations] = useState<Combination[]>(
        convertCombinationsToState(product?.combinations, convertVariationsToState(product?.variations))
    )
    const [selectedCombinations, setSelectedCombinations] = useState<string[]>([])
    const [bulkPrice, setBulkPrice] = useState("")
    const [bulkStock, setBulkStock] = useState("")
    const [uploadingOptionId, setUploadingOptionId] = useState<string | null>(null)

    const handleOptionImageUpload = async (variationId: string, optionId: string, file: File) => {
        setUploadingOptionId(optionId)
        const formData = new FormData()
        formData.set("file", file)

        const result = await uploadImage(formData)

        if (result.url) {
            updateOption(variationId, optionId, 'image', result.url)
        }
        setUploadingOptionId(null)
    }

    const handleRemoveOptionImage = (variationId: string, optionId: string) => {
        updateOption(variationId, optionId, 'image', null)
    }

    const addVariation = () => {
        setVariations([
            ...variations,
            {
                id: Math.random().toString(),
                variationName: "",
                options: []
            }
        ])
    }

    const removeVariation = (variationId: string) => {
        setVariations(variations.filter(v => v.id !== variationId))
        // Clear combinations when variations change
        setCombinations([])
    }

    const updateVariationName = (variationId: string, name: string) => {
        setVariations(variations.map(v =>
            v.id === variationId ? { ...v, variationName: name } : v
        ))
    }

    const addOption = (variationId: string) => {
        setVariations(variations.map(v =>
            v.id === variationId
                ? {
                    ...v,
                    options: [
                        ...v.options,
                        {
                            id: Math.random().toString(),
                            optionName: "",
                            isActive: true,
                            image: null,
                            hexCode: null
                        }
                    ]
                }
                : v
        ))
    }

    const duplicateOption = (variationId: string, optionId: string) => {
        setVariations(variations.map(v => {
            if (v.id !== variationId) return v
            const optionToDuplicate = v.options.find(o => o.id === optionId)
            if (!optionToDuplicate) return v
            const optionIndex = v.options.findIndex(o => o.id === optionId)
            const newOption = {
                ...optionToDuplicate,
                id: Math.random().toString(),
                optionName: `${optionToDuplicate.optionName} (copy)`,
                image: optionToDuplicate.image || null,
                hexCode: optionToDuplicate.hexCode || null
            }
            const newOptions = [...v.options]
            newOptions.splice(optionIndex + 1, 0, newOption)
            return { ...v, options: newOptions }
        }))
    }

    const addBulkOptions = (variationId: string, optionsText: string) => {
        const optionNames = optionsText.split(",").map(s => s.trim()).filter(Boolean)
        if (optionNames.length === 0) return

        setVariations(variations.map(v =>
            v.id === variationId
                ? {
                    ...v,
                    options: [
                        ...v.options,
                        ...optionNames.map(name => ({
                            id: Math.random().toString(),
                            optionName: name,
                            isActive: true,
                            image: null,
                            hexCode: null
                        }))
                    ]
                }
                : v
        ))
    }

    const removeOption = (variationId: string, optionId: string) => {
        setVariations(variations.map(v =>
            v.id === variationId
                ? { ...v, options: v.options.filter(o => o.id !== optionId) }
                : v
        ))
        // Clear combinations when options change
        setCombinations([])
    }

    const updateOption = (variationId: string, optionId: string, field: string, value: any) => {
        setVariations(variations.map(v =>
            v.id === variationId
                ? {
                    ...v,
                    options: v.options.map(o =>
                        o.id === optionId ? { ...o, [field]: value } : o
                    )
                }
                : v
        ))
    }

    // Combination handlers
    const handleGenerateCombinations = () => {
        const generated = generateCombinations(variations)
        setCombinations(generated)
        setSelectedCombinations([])
    }

    const updateCombination = (comboId: string, field: string, value: any) => {
        setCombinations(combinations.map(c =>
            c.id === comboId ? { ...c, [field]: value } : c
        ))
    }

    const toggleCombinationSelection = (comboId: string) => {
        setSelectedCombinations(prev =>
            prev.includes(comboId)
                ? prev.filter(id => id !== comboId)
                : [...prev, comboId]
        )
    }

    const selectAllCombinations = () => {
        if (selectedCombinations.length === combinations.length) {
            setSelectedCombinations([])
        } else {
            setSelectedCombinations(combinations.map(c => c.id))
        }
    }

    const applyBulkPrice = () => {
        if (!bulkPrice || selectedCombinations.length === 0) return
        setCombinations(combinations.map(c =>
            selectedCombinations.includes(c.id) ? { ...c, price: bulkPrice } : c
        ))
        setBulkPrice("")
    }

    const applyBulkStock = () => {
        if (bulkStock === "" || selectedCombinations.length === 0) return
        setCombinations(combinations.map(c =>
            selectedCombinations.includes(c.id) ? { ...c, stock: parseInt(bulkStock) || 0 } : c
        ))
        setBulkStock("")
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")

        const formData = new FormData(e.currentTarget)
        formData.set("images", JSON.stringify(images))

        // Normalize variations - only send option names (price/stock are on combinations now)
        // Filter out empty option names
        const normalizedVariations = variations
            .filter(v => v.variationName && v.options.length > 0)
            .map((v) => ({
                variationName: v.variationName,
                options: v.options
                    .filter((o) => o.optionName && o.optionName.trim() !== "")
                    .map((o) => ({
                        optionName: o.optionName.trim(),
                        isActive: o.isActive,
                        image: o.image || null,
                        hexCode: o.hexCode || null,
                    })),
            }))
            .filter(v => v.options.length > 0) // Remove variations with no valid options

        formData.set("variations", JSON.stringify(normalizedVariations))

        // Normalize combinations - send option NAMES instead of IDs for reliable matching
        const normalizedCombinations = combinations.map((c) => {
            // Build option names array from the label (which contains option names)
            // or find option names by matching IDs
            const optionNames: string[] = []
            for (const optionId of c.optionIds) {
                for (const variation of variations) {
                    const option = variation.options.find(o => o.id === optionId)
                    if (option) {
                        optionNames.push(option.optionName)
                        break
                    }
                }
            }

            return {
                optionNames, // Send names instead of IDs
                price: c.price ? parseFloat(c.price) : null,
                stock: c.stock,
                sku: c.sku || null,
                isActive: c.isActive,
            }
        })

        formData.set("combinations", JSON.stringify(normalizedCombinations))

        startTransition(async () => {
            const result = product
                ? await updateProduct(product.id, formData)
                : await createProduct(formData)

            if ("error" in result && result.error) {
                setError(result.error)
            } else {
                router.push("/admin/products")
                router.refresh()
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
                <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="rounded-lg border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">Basic Information</h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name *</Label>
                        <Input
                            id="name"
                            name="name"
                            required
                            defaultValue={product?.name}
                            onChange={(e) => {
                                if (!product) {
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
                            defaultValue={product?.slug}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        defaultValue={product?.description || ""}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="brand">Brand</Label>
                        <Input
                            id="brand"
                            name="brand"
                            defaultValue={product?.brand || ""}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="categoryId">Category</Label>
                        <Select name="categoryId" defaultValue={product?.categoryId || ""}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">Pricing & Inventory</h2>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="price">Price (৳) *</Label>
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            defaultValue={product ? Number(product.price) : ""}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="compareAtPrice">Compare at Price (৳)</Label>
                        <Input
                            id="compareAtPrice"
                            name="compareAtPrice"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={product?.compareAtPrice ? Number(product.compareAtPrice) : ""}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="costPrice">Cost Price (৳)</Label>
                        <Input
                            id="costPrice"
                            name="costPrice"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={product?.costPrice ? Number(product.costPrice) : ""}
                        />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                            id="sku"
                            name="sku"
                            defaultValue={product?.sku || ""}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="stock">Stock *</Label>
                        <Input
                            id="stock"
                            name="stock"
                            type="number"
                            step="1"
                            min="0"
                            required
                            defaultValue={product?.stock || 0}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="lowStockAlert">Low Stock Alert</Label>
                        <Input
                            id="lowStockAlert"
                            name="lowStockAlert"
                            type="number"
                            min="0"
                            defaultValue={product?.lowStockAlert || 10}
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-lg border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">Discount Settings</h2>
                <p className="text-sm text-muted-foreground">
                    Set up direct discounts without requiring a coupon code
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="discountType">Discount Type</Label>
                        <Select name="discountType" defaultValue={product?.discountType || "none"}>
                            <SelectTrigger>
                                <SelectValue placeholder="No discount" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No discount</SelectItem>
                                <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                <SelectItem value="FIXED_AMOUNT">Fixed Amount (৳)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="discountValue">Discount Value</Label>
                        <Input
                            id="discountValue"
                            name="discountValue"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0"
                            defaultValue={product?.discountValue ? parseFloat(product.discountValue.toString()) : ""}
                        />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="discountStartDate">Start Date (Optional)</Label>
                        <Input
                            id="discountStartDate"
                            name="discountStartDate"
                            type="datetime-local"
                            defaultValue={product?.discountStartDate ? new Date(product.discountStartDate).toISOString().slice(0, 16) : ""}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="discountEndDate">End Date (Optional)</Label>
                        <Input
                            id="discountEndDate"
                            name="discountEndDate"
                            type="datetime-local"
                            defaultValue={product?.discountEndDate ? new Date(product.discountEndDate).toISOString().slice(0, 16) : ""}
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-lg border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">Images</h2>

                <ImageUpload
                    images={images}
                    onChange={setImages}
                    maxImages={10}
                />
            </div>

            <div className="rounded-lg border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">Product Variations</h2>
                <p className="text-sm text-muted-foreground">
                    Add variation types (e.g., Size, Color) and their options. Then generate combinations to set individual prices and stock.
                </p>

                {variations.map((variation) => (
                    <div key={variation.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="flex-1 space-y-2">
                                <Label>Variation Name (e.g., Size, Color)</Label>
                                <Input
                                    placeholder="e.g., Size, Color, Material"
                                    value={variation.variationName}
                                    onChange={(e) => updateVariationName(variation.id, e.target.value)}
                                />
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeVariation(variation.id)}
                                className="mt-8"
                            >
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <Label className="text-sm">Options</Label>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addOption(variation.id)}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Option
                                    </Button>
                                </div>
                            </div>

                            {/* Bulk add options */}
                            <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <Label className="text-xs text-muted-foreground">Bulk Add (comma-separated)</Label>
                                    <Input
                                        placeholder="e.g., S, M, L, XL or Red, Blue, Green"
                                        id={`bulk-${variation.id}`}
                                        className="h-9"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault()
                                                const input = e.target as HTMLInputElement
                                                addBulkOptions(variation.id, input.value)
                                                input.value = ""
                                            }
                                        }}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="h-9"
                                    onClick={() => {
                                        const input = document.getElementById(`bulk-${variation.id}`) as HTMLInputElement
                                        if (input) {
                                            addBulkOptions(variation.id, input.value)
                                            input.value = ""
                                        }
                                    }}
                                >
                                    Add All
                                </Button>
                            </div>

                            {variation.options.map((option) => (
                                <div key={option.id} className={`flex flex-col gap-2 p-3 rounded ${!option.optionName || option.optionName.trim() === "" ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800" : "bg-muted/30"}`}>
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            placeholder="Option name (required)"
                                            value={option.optionName}
                                            onChange={(e) => updateOption(variation.id, option.id, 'optionName', e.target.value)}
                                            className={`h-8 flex-1 ${!option.optionName || option.optionName.trim() === "" ? "border-red-300 dark:border-red-700" : ""}`}
                                        />
                                        {variation.variationName?.toLowerCase().includes('color') && (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={option.hexCode || "#000000"}
                                                    onChange={(e) => updateOption(variation.id, option.id, 'hexCode', e.target.value)}
                                                    className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                                                    title="Pick color"
                                                />
                                                <Input
                                                    placeholder="#hex"
                                                    value={option.hexCode || ""}
                                                    onChange={(e) => updateOption(variation.id, option.id, 'hexCode', e.target.value)}
                                                    className="h-8 w-20 text-xs"
                                                    pattern="^#[0-9A-Fa-f]{6}$"
                                                />
                                            </div>
                                        )}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => duplicateOption(variation.id, option.id)}
                                            className="h-8 w-8"
                                            title="Duplicate option"
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeOption(variation.id, option.id)}
                                            className="h-8 w-8"
                                        >
                                            <Trash2 className="h-3 w-3 text-red-500" />
                                        </Button>
                                    </div>
                                    {/* Variant Option Image Upload */}
                                    <div className="flex items-center gap-2 pl-1">
                                        {option.image ? (
                                            <div className="relative group">
                                                <div className="w-12 h-12 rounded border overflow-hidden">
                                                    <Image
                                                        src={option.image}
                                                        alt={option.optionName || "Variant image"}
                                                        width={48}
                                                        height={48}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveOptionImage(variation.id, option.id)}
                                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) {
                                                            handleOptionImageUpload(variation.id, option.id, file)
                                                        }
                                                        e.target.value = ""
                                                    }}
                                                    disabled={uploadingOptionId === option.id}
                                                />
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                                    {uploadingOptionId === option.id ? (
                                                        <>
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                            <span>Uploading...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ImagePlus className="h-3 w-3" />
                                                            <span>Add variant image</span>
                                                        </>
                                                    )}
                                                </div>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {variation.options.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No options added yet. Use bulk add or click &quot;Add Option&quot;.
                                </p>
                            )}

                            {variation.options.some(o => !o.optionName || o.optionName.trim() === "") && (
                                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <X className="h-3 w-3" />
                                    Empty option names will be ignored when saving.
                                </p>
                            )}
                        </div>
                    </div>
                ))}

                <Button
                    type="button"
                    variant="outline"
                    onClick={addVariation}
                    className="w-full"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variation
                </Button>

                {/* Generate Combinations Button */}
                {variations.length > 0 && variations.some(v => v.options.length > 0) && (
                    <Button
                        type="button"
                        variant="default"
                        onClick={handleGenerateCombinations}
                        className="w-full"
                    >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Combinations ({variations.reduce((total, v) => total === 0 ? v.options.length : total * v.options.length, 0)} total)
                    </Button>
                )}
            </div>

            {/* Combinations Table */}
            {combinations.length > 0 && (
                <div className="rounded-lg border bg-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">Variant Combinations</h2>
                            <p className="text-sm text-muted-foreground">
                                Set price and stock for each combination. Leave price empty to use base product price.
                            </p>
                        </div>
                        <span className="text-sm text-muted-foreground">{combinations.length} combinations</span>
                    </div>

                    {/* Bulk Actions */}
                    <div className="flex flex-wrap gap-3 items-end p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedCombinations.length === combinations.length && combinations.length > 0}
                                onChange={selectAllCombinations}
                                className="h-4 w-4"
                            />
                            <span className="text-sm">
                                {selectedCombinations.length > 0 ? `${selectedCombinations.length} selected` : "Select all"}
                            </span>
                        </div>
                        <div className="flex gap-2 items-end flex-1 flex-wrap">
                            <div className="space-y-1">
                                <Label className="text-xs">Bulk Price</Label>
                                <div className="flex gap-1">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Price"
                                        value={bulkPrice}
                                        onChange={(e) => setBulkPrice(e.target.value)}
                                        className="h-8 w-24"
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={applyBulkPrice}
                                        disabled={!bulkPrice || selectedCombinations.length === 0}
                                        className="h-8"
                                    >
                                        Apply
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Bulk Stock</Label>
                                <div className="flex gap-1">
                                    <Input
                                        type="number"
                                        step="1"
                                        min="0"
                                        placeholder="Stock"
                                        value={bulkStock}
                                        onChange={(e) => setBulkStock(e.target.value)}
                                        className="h-8 w-20"
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={applyBulkStock}
                                        disabled={bulkStock === "" || selectedCombinations.length === 0}
                                        className="h-8"
                                    >
                                        Apply
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Combinations List */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {combinations.map((combo) => (
                            <div
                                key={combo.id}
                                className={`flex flex-wrap gap-2 items-center p-3 rounded-lg border ${selectedCombinations.includes(combo.id) ? "bg-primary/5 border-primary/30" : "bg-muted/20"
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedCombinations.includes(combo.id)}
                                    onChange={() => toggleCombinationSelection(combo.id)}
                                    className="h-4 w-4"
                                />
                                <span className="font-medium text-sm min-w-37.5">{combo.label}</span>
                                <div className="flex gap-2 items-center flex-wrap flex-1">
                                    <div className="flex items-center gap-1">
                                        <Label className="text-xs text-muted-foreground">Price:</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="Base price"
                                            value={combo.price}
                                            onChange={(e) => updateCombination(combo.id, 'price', e.target.value)}
                                            className="h-7 w-24"
                                        />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Label className="text-xs text-muted-foreground">Stock:</Label>
                                        <Input
                                            type="number"
                                            step="1"
                                            min="0"
                                            placeholder="0"
                                            value={combo.stock}
                                            onChange={(e) => {
                                                const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10)
                                                updateCombination(combo.id, 'stock', isNaN(value) || value < 0 ? 0 : value)
                                            }}
                                            className="h-7 w-20"
                                        />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Label className="text-xs text-muted-foreground">SKU:</Label>
                                        <Input
                                            placeholder="SKU"
                                            value={combo.sku}
                                            onChange={(e) => updateCombination(combo.id, 'sku', e.target.value)}
                                            className="h-7 w-24"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant={combo.isActive ? "ghost" : "destructive"}
                                        size="sm"
                                        onClick={() => updateCombination(combo.id, 'isActive', !combo.isActive)}
                                        className="h-7"
                                    >
                                        {combo.isActive ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                                        {combo.isActive ? "Active" : "Inactive"}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="rounded-lg border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">Status</h2>

                <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="isActive"
                            value="true"
                            defaultChecked={product?.isActive ?? true}
                            className="h-4 w-4"
                        />
                        <span>Active</span>
                    </label>

                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="isFeatured"
                            value="true"
                            defaultChecked={product?.isFeatured ?? false}
                            className="h-4 w-4"
                        />
                        <span>Featured</span>
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
                    {isPending ? "Saving..." : product ? "Update Product" : "Create Product"}
                </Button>
            </div>
        </form>
    )
}
