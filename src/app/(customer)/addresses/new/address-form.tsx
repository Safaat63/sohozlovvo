"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createAddress, updateAddress } from "@/actions/addresses"
import { BANGLADESH_DISTRICTS } from "@/lib/bangladesh-districts"

type Address = {
    id: string
    name: string
    phone: string
    street: string
    city: string
    state: string
    postalCode: string
    country: string
    isDefault: boolean
}

interface AddressFormProps {
    address?: Address
}

export function AddressForm({ address }: AddressFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")

        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            const result = address
                ? await updateAddress(address.id, formData)
                : await createAddress(formData)

            if (result?.error) {
                setError(result.error)
            } else {
                router.push("/addresses")
            }
        })
    }

    return (
        <form onSubmit={handleSubmit}>
            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-600 mb-6">
                    {error}
                </div>
            )}

            <Card>
                <CardContent className="p-4 md:p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                required
                                defaultValue={address?.name}
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
                                defaultValue={address?.phone}
                                placeholder="01234567890"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="street">Street Address *</Label>
                        <Input
                            id="street"
                            name="street"
                            required
                            defaultValue={address?.street}
                            placeholder="123 Main Street, Apt 4"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">District (Zilla) *</Label>
                            <Select name="city" defaultValue={address?.city || ""}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select district" />
                                </SelectTrigger>
                                <SelectContent>
                                    {BANGLADESH_DISTRICTS.map((district) => (
                                        <SelectItem key={district} value={district}>
                                            {district}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="state">State / Division *</Label>
                            <Input
                                id="state"
                                name="state"
                                required
                                defaultValue={address?.state}
                                placeholder="Dhaka Division"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="postalCode">Postal Code *</Label>
                            <Input
                                id="postalCode"
                                name="postalCode"
                                required
                                defaultValue={address?.postalCode}
                                placeholder="1205"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                                id="country"
                                name="country"
                                defaultValue={address?.country || "Bangladesh"}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isDefault"
                                defaultChecked={address?.isDefault}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <span className="text-sm">Set as default address</span>
                        </label>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4 mt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : address ? "Update Address" : "Add Address"}
                </Button>
            </div>
        </form>
    )
}
