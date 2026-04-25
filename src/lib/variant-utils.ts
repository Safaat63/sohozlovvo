/**
 * Helper utilities for variant combination system
 */

export interface VariationType {
    id: string
    name: string
    options: VariationOption[]
}

export interface VariationOption {
    id: string
    name: string
    isActive: boolean
}

export interface VariantCombination {
    id: string
    optionIds: string[]
    sku: string
    stock: number
    price: string | number
    isActive: boolean
}

/**
 * Generate all possible combinations from variation types
 */
export function generateCombinations(variations: VariationType[]): VariantCombination[] {
    const activeVars = variations.filter((v) =>
        v.name.trim() && v.options.some((o) => o.name.trim() && o.isActive)
    )

    if (activeVars.length === 0) {
        return []
    }

    // Get all active options for each variation
    const optionSets = activeVars.map((v) =>
        v.options.filter((o) => o.name.trim() && o.isActive)
    )

    // Generate cartesian product
    const cartesian = (...arrays: VariationOption[][]): VariationOption[][] => {
        return arrays.reduce(
            (acc, curr) => acc.flatMap((a) => curr.map((b) => [...a, b])),
            [[]] as VariationOption[][]
        )
    }

    const allCombos = cartesian(...optionSets)

    return allCombos.map((combo, index) => ({
        id: `temp-combo-${Date.now()}-${index}`,
        optionIds: combo.map((o) => o.id),
        sku: "",
        stock: 0,
        price: "",
        isActive: true,
    }))
}

/**
 * Find combination by selected option IDs
 */
export function findCombinationByOptions(
    combinations: VariantCombination[],
    selectedOptionIds: string[]
): VariantCombination | null {
    return (
        combinations.find((combo) => {
            if (combo.optionIds.length !== selectedOptionIds.length) return false
            return combo.optionIds.every((id) => selectedOptionIds.includes(id))
        }) || null
    )
}

/**
 * Format combination as display string
 */
export function formatCombinationDisplay(
    combination: VariantCombination,
    variations: VariationType[]
): string {
    return combination.optionIds
        .map((optId) => {
            for (const v of variations) {
                const option = v.options.find((o) => o.id === optId)
                if (option) return `${v.name}: ${option.name}`
            }
            return ""
        })
        .filter(Boolean)
        .join(" | ")
}

/**
 * Get variation details as JSON string for order history
 */
export function getVariationDetailsJSON(
    combinationId: string,
    combinations: VariantCombination[],
    variations: VariationType[]
): string {
    const combo = combinations.find((c) => c.id === combinationId)
    if (!combo) return "[]"

    const details = combo.optionIds.map((optId) => {
        for (const v of variations) {
            const option = v.options.find((o) => o.id === optId)
            if (option) {
                return {
                    type: v.name,
                    value: option.name,
                }
            }
        }
        return null
    }).filter(Boolean)

    return JSON.stringify(details)
}

/**
 * Parse variation details JSON
 */
export function parseVariationDetails(json: string): Array<{ type: string; value: string }> {
    try {
        return JSON.parse(json)
    } catch {
        return []
    }
}

/**
 * Calculate total stock across all combinations
 */
export function calculateTotalStock(combinations: VariantCombination[]): number {
    return combinations
        .filter((c) => c.isActive)
        .reduce((sum, c) => sum + (typeof c.stock === 'number' ? c.stock : 0), 0)
}

/**
 * Check if product has variations
 */
export function hasVariations(variations: VariationType[]): boolean {
    return variations.some((v) =>
        v.name.trim() && v.options.some((o) => o.name.trim())
    )
}
