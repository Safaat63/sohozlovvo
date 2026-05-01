"use client"

import { useMemo, useState, useTransition } from "react"
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
import districtsData from "@/lib/bangladesh-geojson/bd-districts.json"
import upazilasData from "@/lib/bangladesh-geojson/bd-upazilas.json"

type Address = {
    id: string
    name: string
    phone: string
    street: string
    city: string
    thana: string
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
    const [selectedDistrict, setSelectedDistrict] = useState(address?.city || "")
    const [selectedThana, setSelectedThana] = useState(address?.thana || "")

    const districtIdByName = useMemo(() => {
        const map = new Map<string, string>()
        districtsData.districts.forEach((district) => {
            map.set(district.name, district.id)
        })
        return map
    }, [])

    const selectedDistrictId = districtIdByName.get(selectedDistrict)
    const thanaOptions = useMemo(() => {
        if (!selectedDistrictId) return []
        return upazilasData.upazilas
            .filter((upazila) => upazila.district_id === selectedDistrictId)
            .map((upazila) => upazila.name)
    }, [selectedDistrictId])

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
                            <Select
                                name="city"
                                value={selectedDistrict}
                                onValueChange={(value) => {
                                    setSelectedDistrict(value)
                                    setSelectedThana("")
                                }}
                            >
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
                            <Label htmlFor="thana">Thana *</Label>
                            <Select
                                name="thana"
                                value={selectedThana}
                                onValueChange={setSelectedThana}
                                disabled={!selectedDistrictId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={selectedDistrictId ? "Select thana" : "Select district first"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {thanaOptions.map((thana) => (
                                        <SelectItem key={thana} value={thana}>
                                            {thana}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <input type="hidden" name="thana" value={selectedThana} required />
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
