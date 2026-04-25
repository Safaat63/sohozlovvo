"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, Plus, Minus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetTrigger,
} from "@/components/ui/sheet"
import { updateCartItem, removeFromCart } from "@/actions/cart"
import { formatCurrency, useCurrencySymbol } from "@/components/currency-provider"

// Custom shopping bag icon component
function ShoppingBagIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
    )
}

type CartItem = {
    id: string
    quantity: number
    combinationId?: string | null
    combinationLabel?: string | null
    itemPrice: string
    itemStock: number
    product: {
        id: string
        name: string
        slug: string
        price: string
        images: string[]
        stock: number
    }
}

type Cart = {
    id: string
    items: CartItem[]
}

interface SideCartProps {
    cart: Cart | null
    itemCount: number
}

export function SideCart({ cart, itemCount }: SideCartProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [updatingItem, setUpdatingItem] = useState<string | null>(null)
    const currency = useCurrencySymbol()

    const items = cart?.items || []

    const subtotal = items.reduce((sum, item) => {
        const price = parseFloat(item.itemPrice)
        return sum + price * item.quantity
    }, 0)

    const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
        setUpdatingItem(itemId)
        startTransition(async () => {
            await updateCartItem(itemId, newQuantity)
            setUpdatingItem(null)
        })
    }

    const handleRemove = (itemId: string) => {
        setUpdatingItem(itemId)
        startTransition(async () => {
            await removeFromCart(itemId)
            setUpdatingItem(null)
        })
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button className="relative p-2.5 text-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-200">
                    <ShoppingBagIcon className="h-5 w-5" />
                    {itemCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-primary rounded-full shadow-lg animate-pulse">
                            {itemCount}
                        </span>
                    )}
                </button>
            </SheetTrigger>
            <SheetContent className="flex flex-col border-l-primary/10">
                <SheetHeader className="border-b border-primary/10 pb-4">
                    <SheetTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <ShoppingBagIcon className="h-5 w-5 text-primary" />
                        </div>
                        Shopping Bag ({itemCount})
                    </SheetTitle>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                        <div className="p-6 bg-primary/5 rounded-full mb-4">
                            <ShoppingBagIcon className="h-16 w-16 text-primary/40" />
                        </div>
                        <h3 className="font-semibold mb-2 dark:text-white">Your bag is empty</h3>
                        <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4">
                            Add some products to get started
                        </p>
                        <Button asChild onClick={() => setOpen(false)}>
                            <Link href="/products">Browse Products</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto py-4">
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-3 p-3 border dark:border-gray-700 rounded-lg relative dark:bg-gray-800"
                                    >
                                        {updatingItem === item.id && (
                                            <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg">
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            </div>
                                        )}
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden shrink-0 relative">
                                            {item.product.images[0] ? (
                                                <Image
                                                    src={item.product.images[0]}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={`/products/${item.product.slug}`}
                                                className="font-medium text-sm hover:underline line-clamp-2"
                                                onClick={() => setOpen(false)}
                                            >
                                                {item.product.name}
                                            </Link>
                                            {item.combinationLabel && (
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {item.combinationLabel}
                                                </p>
                                            )}
                                            <p className="text-sm font-bold mt-1">
                                                {formatCurrency(parseFloat(item.itemPrice), currency)}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() =>
                                                        handleUpdateQuantity(
                                                            item.id,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    disabled={
                                                        isPending || item.quantity <= 1
                                                    }
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="text-sm w-8 text-center">
                                                    {item.quantity}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() =>
                                                        handleUpdateQuantity(
                                                            item.id,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    disabled={
                                                        isPending ||
                                                        item.quantity >= item.itemStock
                                                    }
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 shrink-0"
                                            onClick={() => handleRemove(item.id)}
                                            disabled={isPending}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <SheetFooter className="border-t dark:border-gray-700">
                            <div className="w-full space-y-4">
                                <div className="flex items-center justify-between text-lg font-semibold">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(subtotal, currency)}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Shipping and taxes calculated at checkout
                                </p>
                                <div className="flex flex-col gap-2">
                                    <Button asChild className="w-full" onClick={() => setOpen(false)}>
                                        <Link href="/checkout">Checkout</Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        asChild
                                        className="w-full"
                                        onClick={() => setOpen(false)}
                                    >
                                        <Link href="/cart">View Cart</Link>
                                    </Button>
                                </div>
                            </div>
                        </SheetFooter>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}
