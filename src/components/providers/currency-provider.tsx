"use client"

import { createContext, useContext, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency"

interface CurrencyContextValue {
    symbol: string
}

const CurrencyContext = createContext<CurrencyContextValue>({ symbol: "৳" })

export function CurrencyProvider({ symbol, children }: { symbol: string; children: ReactNode }) {
    return (
        <CurrencyContext.Provider value={{ symbol }}>
            {children}
        </CurrencyContext.Provider>
    )
}

export function useCurrencySymbol() {
    const ctx = useContext(CurrencyContext)
    return ctx.symbol || "৳"
}

export { formatCurrency }

export function Currency({ value, className }: { value: number | string; className?: string }) {
    const symbol = useCurrencySymbol()
    return <span className={cn(className)}>{formatCurrency(value, symbol)}</span>
}
