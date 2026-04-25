/**
 * Format a number as currency with the given symbol
 * This is a pure utility function that can be used in both server and client components
 */
export function formatCurrency(amount: number | string, symbol: string) {
    const numeric = typeof amount === "string" ? parseFloat(amount) : amount
    if (Number.isNaN(numeric)) return `${symbol}0`
    return `${symbol}${numeric.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}
