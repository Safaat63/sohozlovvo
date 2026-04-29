"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Plus } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export interface VariationType {
    id: string
    name: string // e.g., "Color", "Size", "Design"
    options: VariationOption[]
}

export interface VariationOption {
    id: string
    name: string // e.g., "Red", "Large", "Pattern A"
    isActive: boolean
}

export interface VariantCombination {
    id: string
    optionIds: string[] // Array of option IDs from different variation types
    sku: string
    stock: number
    price: string // Empty string means use base price
    isActive: boolean
}

interface VariantCombinationManagerProps {
    variations: VariationType[]
    combinations: VariantCombination[]
    onVariationsChange: (variations: VariationType[]) => void
    onCombinationsChange: (combinations: VariantCombination[]) => void
}

export function VariantCombinationManager({
    variations,
    combinations,
    onVariationsChange,
    onCombinationsChange,
}: VariantCombinationManagerProps) {
    // Add new variation type
    const addVariationType = () => {
        onVariationsChange([
            ...variations,
            {
                id: `temp-${Date.now()}`,
                name: "",
                options: [],
            },
        ])
    }

    // Remove variation type
    const removeVariationType = (varId: string) => {
        onVariationsChange(variations.filter((v) => v.id !== varId))
        // Regenerate combinations without this variation
        regenerateCombinations(variations.filter((v) => v.id !== varId))
    }

    // Update variation type name
    const updateVariationName = (varId: string, name: string) => {
        onVariationsChange(
            variations.map((v) => (v.id === varId ? { ...v, name } : v))
        )
    }

    // Add option to variation
    const addOption = (varId: string) => {
        onVariationsChange(
            variations.map((v) =>
                v.id === varId
                    ? {
                        ...v,
                        options: [
                            ...v.options,
                            {
                                id: `temp-opt-${Date.now()}`,
                                name: "",
                                isActive: true,
                            },
                        ],
                    }
                    : v
            )
        )
    }

    // Remove option
    const removeOption = (varId: string, optId: string) => {
        onVariationsChange(
            variations.map((v) =>
                v.id === varId
                    ? { ...v, options: v.options.filter((o) => o.id !== optId) }
                    : v
            )
        )
        // Regenerate combinations
        const updatedVars = variations.map((v) =>
            v.id === varId
                ? { ...v, options: v.options.filter((o) => o.id !== optId) }
                : v
        )
        regenerateCombinations(updatedVars)
    }

    // Update option
    const updateOption = (
        varId: string,
        optId: string,
        field: keyof VariationOption,
        value: any
    ) => {
        onVariationsChange(
            variations.map((v) =>
                v.id === varId
                    ? {
                        ...v,
                        options: v.options.map((o) =>
                            o.id === optId ? { ...o, [field]: value } : o
                        ),
                    }
                    : v
            )
        )
    }

    // Generate all possible combinations
    const regenerateCombinations = (vars: VariationType[]) => {
        const activeVars = vars.filter(
            (v) => v.name.trim() && v.options.some((o) => o.name.trim() && o.isActive)
        )

        if (activeVars.length === 0) {
            onCombinationsChange([])
            return
        }

        // Get all active options for each variation
        const optionSets = activeVars.map((v) =>
            v.options.filter((o) => o.name.trim() && o.isActive)
        )

        // Generate cartesian product of all options
        const cartesian = (...arrays: VariationOption[][]): VariationOption[][] => {
            return arrays.reduce(
                (acc, curr) =>
                    acc.flatMap((a) => curr.map((b) => [...a, b])),
                [[]] as VariationOption[][]
            )
        }

        const allCombos = cartesian(...optionSets)

        // Map to our combination format, preserving existing data where possible
        const newCombinations: VariantCombination[] = allCombos.map((combo) => {
            const optionIds = combo.map((o) => o.id)
            const existing = combinations.find(
                (c) =>
                    c.optionIds.length === optionIds.length &&
                    c.optionIds.every((id) => optionIds.includes(id))
            )

            return existing || {
                id: `temp-combo-${Date.now()}-${Math.random()}`,
                optionIds,
                sku: "",
                stock: 0,
                price: "", // Empty = use base price
                isActive: true,
            }
        })

        onCombinationsChange(newCombinations)
    }

    // Update combination field
    const updateCombination = (
        comboId: string,
        field: keyof VariantCombination,
        value: any
    ) => {
        onCombinationsChange(
            combinations.map((c) => (c.id === comboId ? { ...c, [field]: value } : c))
        )
    }

    // Get option name by ID
    const getOptionName = (optionId: string): string => {
        for (const v of variations) {
            const option = v.options.find((o) => o.id === optionId)
            if (option) return option.name
        }
        return ""
    }

    // Get variation name by option ID
    const getVariationName = (optionId: string): string => {
        for (const v of variations) {
            if (v.options.some((o) => o.id === optionId)) return v.name
        }
        return ""
    }

    return (
        <div className="space-y-6">
            {/* Variation Types Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold">Variation Types</h3>
                        <p className="text-sm text-muted-foreground">
                            Define variation types (e.g., Color, Size, Design) and their options
                        </p>
                    </div>
                </div>

                {variations.map((variation) => (
                    <div
                        key={variation.id}
                        className="border rounded-lg p-4 space-y-4 bg-muted/20"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex-1 space-y-2">
                                <Label>Variation Type</Label>
                                <Input
                                    placeholder="e.g., Color, Size, Design"
                                    value={variation.name}
                                    onChange={(e) =>
                                        updateVariationName(variation.id, e.target.value)
                                    }
                                />
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeVariationType(variation.id)}
                                className="mt-8"
                            >
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>

                        {/* Options */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm">Options</Label>
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

                            {variation.options.map((option) => (
                                <div
                                    key={option.id}
                                    className="flex gap-2 items-center bg-background p-2 rounded"
                                >
                                    <Checkbox
                                        checked={option.isActive}
                                        onCheckedChange={(checked) =>
                                            updateOption(
                                                variation.id,
                                                option.id,
                                                "isActive",
                                                checked
                                            )
                                        }
                                    />
                                    <Input
                                        placeholder="e.g., Red, Large, Pattern A"
                                        value={option.name}
                                        onChange={(e) =>
                                            updateOption(
                                                variation.id,
                                                option.id,
                                                "name",
                                                e.target.value
                                            )
                                        }
                                        className="h-9 flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeOption(variation.id, option.id)}
                                        className="h-9"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}

                            {variation.options.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-2">
                                    No options added yet
                                </p>
                            )}
                        </div>
                    </div>
                ))}

                <Button
                    type="button"
                    variant="outline"
                    onClick={addVariationType}
                    className="w-full"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variation Type
                </Button>
            </div>

            {/* Generate Combinations Button */}
            {variations.some((v) => v.name && v.options.length > 0) && (
                <div className="flex items-center justify-center">
                    <Button
                        type="button"
                        onClick={() => regenerateCombinations(variations)}
                        variant="default"
                        size="lg"
                    >
                        Generate All Combinations
                    </Button>
                </div>
            )}

            {/* Combinations Table */}
            {combinations.length > 0 && (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-base font-semibold">
                            Variant Combinations ({combinations.length})
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Set stock, price (optional), and SKU for each combination. Leave price
                            empty to use base product price.
                        </p>
                    </div>

                    <div className="border rounded-lg overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">Active</TableHead>
                                    <TableHead>Combination</TableHead>
                                    <TableHead className="w-32">Stock</TableHead>
                                    <TableHead className="w-32">Price (৳)</TableHead>
                                    <TableHead className="w-40">SKU</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {combinations.map((combo) => {
                                    const comboLabel = combo.optionIds
                                        .map((optId) => {
                                            const varName = getVariationName(optId)
                                            const optName = getOptionName(optId)
                                            return `${varName}: ${optName}`
                                        })
                                        .join(" | ")

                                    return (
                                        <TableRow key={combo.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={combo.isActive}
                                                    onCheckedChange={(checked) =>
                                                        updateCombination(
                                                            combo.id,
                                                            "isActive",
                                                            checked
                                                        )
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {comboLabel}
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={combo.stock}
                                                    onChange={(e) =>
                                                        updateCombination(
                                                            combo.id,
                                                            "stock",
                                                            parseInt(e.target.value) || 0
                                                        )
                                                    }
                                                    className="h-9"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Base price"
                                                    value={combo.price}
                                                    onChange={(e) =>
                                                        updateCombination(
                                                            combo.id,
                                                            "price",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="h-9"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    placeholder="Optional"
                                                    value={combo.sku}
                                                    onChange={(e) =>
                                                        updateCombination(
                                                            combo.id,
                                                            "sku",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="h-9"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    )
}
