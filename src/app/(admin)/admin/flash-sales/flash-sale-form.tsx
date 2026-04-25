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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createFlashSale, updateFlashSale } from "@/actions/admin-flash-sales"
import { format } from "date-fns"
import { toZonedTime, fromZonedTime } from "date-fns-tz"

const DHAKA_TIMEZONE = "Asia/Dhaka"

type Product = {
    id: string
    name: string
    price: string
    images: string[]
}

type FlashSale = {
    id: string
    productId: string
    salePrice: string
    startDate: Date
    endDate: Date
    stockLimit: number | null
    isActive: boolean
    product: {
        id: string
        name: string
        price: string
    }
}

interface FlashSaleFormProps {
    flashSale?: FlashSale
    products: Product[]
}

export function FlashSaleForm({ flashSale, products }: FlashSaleFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")
    const [selectedProduct, setSelectedProduct] = useState(flashSale?.productId || "")

    const selectedProductData = products.find((p) => p.id === selectedProduct)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")

        const formData = new FormData(e.currentTarget)
        formData.set("productId", selectedProduct)

        // Convert dates from Dhaka timezone to UTC for storage
        const startDateInput = formData.get("startDate") as string
        const endDateInput = formData.get("endDate") as string

        if (startDateInput) {
            const dhakaDate = new Date(startDateInput)
            const utcDate = fromZonedTime(dhakaDate, DHAKA_TIMEZONE)
            formData.set("startDate", utcDate.toISOString())
        }

        if (endDateInput) {
            const dhakaDate = new Date(endDateInput)
            const utcDate = fromZonedTime(dhakaDate, DHAKA_TIMEZONE)
            formData.set("endDate", utcDate.toISOString())
        }

        startTransition(async () => {
            const result = flashSale
                ? await updateFlashSale(flashSale.id, formData)
                : await createFlashSale(formData)

            if ("error" in result && result.error) {
                setError(result.error)
            } else {
                router.push("/admin/flash-sales")
                router.refresh()
            }
        })
    }

    const formatDateForInput = (date: Date) => {
        // Convert UTC date to Dhaka timezone for display
        const dhakaDate = toZonedTime(new Date(date), DHAKA_TIMEZONE)
        return format(dhakaDate, "yyyy-MM-dd'T'HH:mm")
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-600">
                    {error}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Flash Sale Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="productId">Product</Label>
                        <Select
                            value={selectedProduct}
                            onValueChange={setSelectedProduct}
                            disabled={!!flashSale}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map((product) => (
                                    <SelectItem key={product.id} value={product.id}>
                                        {product.name} - ৳{product.price}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedProductData && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                Original Price: <span className="font-bold">৳{selectedProductData.price}</span>
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="salePrice">Sale Price (৳)</Label>
                        <Input
                            id="salePrice"
                            name="salePrice"
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            defaultValue={flashSale?.salePrice || ""}
                            placeholder="Enter sale price"
                        />
                        {selectedProductData && (
                            <p className="text-xs text-muted-foreground">
                                Must be less than original price ৳{selectedProductData.price}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date & Time (GMT+6)</Label>
                            <Input
                                id="startDate"
                                name="startDate"
                                type="datetime-local"
                                required
                                defaultValue={flashSale ? formatDateForInput(flashSale.startDate) : ""}
                            />
                            <p className="text-xs text-muted-foreground">Dhaka timezone</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date & Time (GMT+6)</Label>
                            <Input
                                id="endDate"
                                name="endDate"
                                type="datetime-local"
                                required
                                defaultValue={flashSale ? formatDateForInput(flashSale.endDate) : ""}
                            />
                            <p className="text-xs text-muted-foreground">Dhaka timezone</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="stockLimit">Stock Limit (Optional)</Label>
                        <Input
                            id="stockLimit"
                            name="stockLimit"
                            type="number"
                            min="0"
                            defaultValue={flashSale?.stockLimit || ""}
                            placeholder="Leave empty for unlimited"
                        />
                        <p className="text-xs text-muted-foreground">
                            Maximum number of items that can be sold at this price
                        </p>
                    </div>

                    <div className="pt-2">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="isActive"
                                value="true"
                                defaultChecked={flashSale?.isActive ?? true}
                                className="h-4 w-4"
                            />
                            <span>Active</span>
                        </label>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isPending || !selectedProduct}>
                    {isPending ? "Saving..." : flashSale ? "Update Flash Sale" : "Create Flash Sale"}
                </Button>
            </div>
        </form>
    )
}
