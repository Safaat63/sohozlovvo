"use client"

import { useState } from "react"
import { updateCartItem, removeFromCart } from "@/actions/cart"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface CartItemActionsProps {
    itemId: string
    quantity: number
    stock: number
}

export function CartItemActions({ itemId, quantity, stock }: CartItemActionsProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function updateQuantity(newQuantity: number) {
        setLoading(true)
        await updateCartItem(itemId, newQuantity)
        router.refresh()
        setLoading(false)
    }

    async function handleRemove() {
        setLoading(true)
        await removeFromCart(itemId)
        router.refresh()
        setLoading(false)
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-md">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(quantity - 1)}
                    disabled={loading || quantity <= 1}
                >
                    <Minus className="h-3 w-3" />
                </Button>
                <span className="px-4 py-1 min-w-12.5 text-center text-sm">
                    {quantity}
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(quantity + 1)}
                    disabled={loading || quantity >= stock}
                >
                    <Plus className="h-3 w-3" />
                </Button>
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                disabled={loading}
            >
                <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
        </div>
    )
}
