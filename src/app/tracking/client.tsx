"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getOrderTracking } from "@/actions/tracking"

const statusLabels: Record<string, string> = {
    PENDING: "Pending",
    VERIFIED: "Payment Verified",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    RETURNED: "Returned",
    PAID: "Paid",
    FAILED: "Failed",
    REFUNDED: "Refunded",
}

type BadgeVariant = "default" | "secondary" | "destructive" | "success" | "warning" | "outline"

const badgeVariants: Record<string, BadgeVariant> = {
    PENDING: "warning",
    VERIFIED: "default",
    PROCESSING: "default",
    SHIPPED: "default",
    DELIVERED: "success",
    CANCELLED: "destructive",
    RETURNED: "destructive",
    PAID: "success",
    FAILED: "destructive",
    REFUNDED: "secondary",
}

type Variation = { type: string; value: string }

type TrackingItem = {
    id: string
    name: string
    quantity: number
    price: number
    image: string | null
    variations: Variation[]
    variationText: string
}

type TrackingData = {
    orderNumber: string
    status: string
    paymentStatus: string
    trackingNumber: string | null
    items: TrackingItem[]
}

function formatStatus(value: string) {
    return statusLabels[value] || value
}

function getBadgeVariant(value: string): BadgeVariant {
    return badgeVariants[value] || "secondary"
}

export function TrackingClient({ initialOrderNumber = "" }: { initialOrderNumber?: string }) {
    const [orderNumber, setOrderNumber] = useState(initialOrderNumber)
    const [data, setData] = useState<TrackingData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const hasResults = useMemo(() => !!data, [data])

    const fetchOrder = async (value?: string) => {
        const target = (value ?? orderNumber).trim()
        if (!target) {
            setError("Enter an order number to track")
            setData(null)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const result = await getOrderTracking(target)
            if (result.error) {
                setData(null)
                setError(result.error)
            } else if (result.data) {
                setData(result.data)
            }
        } catch (err) {
            setData(null)
            setError(err instanceof Error ? err.message : "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (initialOrderNumber) {
            fetchOrder(initialOrderNumber)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialOrderNumber])

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Track Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form
                        className="flex flex-col gap-3 sm:flex-row"
                        onSubmit={(e) => {
                            e.preventDefault()
                            fetchOrder()
                        }}
                    >
                        <Input
                            value={orderNumber}
                            onChange={(e) => setOrderNumber(e.target.value)}
                            placeholder="Enter your order number (e.g. ORD-1234-ABCD)"
                            aria-label="Order number"
                        />
                        <Button type="submit" disabled={loading}>
                            {loading ? "Loading..." : "Track"}
                        </Button>
                    </form>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </CardContent>
            </Card>

            {hasResults && data && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between gap-2">
                                <span>Order #{data.orderNumber}</span>
                                <Badge variant={getBadgeVariant(data.status)}>{formatStatus(data.status)}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                <span>Payment: </span>
                                <Badge variant={getBadgeVariant(data.paymentStatus)}>
                                    {formatStatus(data.paymentStatus)}
                                </Badge>
                                {data.trackingNumber && (
                                    <span className="ml-auto text-xs text-muted-foreground">
                                        Tracking: {data.trackingNumber}
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Products</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-4 pb-4 border-b last:border-0 border-border"
                                >
                                    {item.image && (
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            width={80}
                                            height={80}
                                            className="rounded object-cover"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium">{item.name}</p>
                                        {item.variationText && (
                                            <p className="text-sm text-muted-foreground">{item.variationText}</p>
                                        )}
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">৳{item.price.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
