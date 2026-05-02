"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Package } from "lucide-react"
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
    const [searchAttempted, setSearchAttempted] = useState(false)

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
        setSearchAttempted(true)

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
        <div className="w-full pb-16">
            {/* Top Header Section */}
            <div className="bg-white w-full pt-16 pb-20 px-4 relative">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-3">
                        <div className="text-[#f48721] text-xs font-bold tracking-wider uppercase flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#f48721]"></span>
                            Live Order Tracking
                        </div>
                        <h1 className="text-4xl font-black text-[#1a202c]">Track Your Order</h1>
                        <p className="text-slate-500 font-medium">
                            Real-time updates on your shipment progress
                        </p>
                    </div>

                    <form
                        className="flex w-full md:w-auto gap-3"
                        onSubmit={(e) => {
                            e.preventDefault()
                            fetchOrder()
                        }}
                    >
                        <Input
                            value={orderNumber}
                            onChange={(e) => setOrderNumber(e.target.value)}
                            placeholder="Enter order number..."
                            className="w-full md:w-[320px] bg-slate-50 border-slate-200 focus-visible:ring-[#f48721] text-md h-12"
                            aria-label="Order number"
                        />
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="bg-[#f48721] hover:bg-[#d9771c] text-white px-8 h-12 font-medium"
                        >
                            {loading ? "Searching..." : "Search"}
                        </Button>
                    </form>
                </div>

                {/* Subtle curve matching the screenshot transition */}
                <div className="absolute bottom-0 left-0 right-0 overflow-hidden text-[#f8f9fa] translate-y-[99%]">
                    <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-10 md:h-12">
                        <path d="M0 0C480 64 960 64 1440 0V48H0V0Z" fill="currentColor" />
                    </svg>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-4xl mx-auto px-4 mt-16">
                
                {/* Empty / Error State (Order Not Found) */}
                {searchAttempted && error && !data && (
                    <Card className="max-w-2xl mx-auto border-none shadow-sm rounded-3xl py-16 bg-white">
                        <CardContent className="flex flex-col items-center text-center space-y-6">
                            <div className="bg-[#f48721]/10 p-4 rounded-full mb-2">
                                <Package className="w-12 h-12 text-[#f48721]" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-2xl font-black text-[#1a202c]">
                                    Order Not Found
                                </h2>
                                <p className="text-slate-500 max-w-sm mx-auto">
                                    We couldn&apos;t find an order with that number. Please double-check and try again.
                                </p>
                            </div>
                            <Link href="/" passHref>
                                <Button className="bg-[#f48721] hover:bg-[#d9771c] text-white px-8 h-11 mt-4 rounded-lg font-medium">
                                    Back to Shopping
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* Success Results State */}
                {hasResults && data && (
                    <div className="space-y-6">
                        <Card className="border-none shadow-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between gap-2 text-[#1a202c]">
                                    <span>Order #{data.orderNumber}</span>
                                    <Badge variant={getBadgeVariant(data.status)}>{formatStatus(data.status)}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                                    <span className="font-medium">Payment: </span>
                                    <Badge variant={getBadgeVariant(data.paymentStatus)}>
                                        {formatStatus(data.paymentStatus)}
                                    </Badge>
                                    {data.trackingNumber && (
                                        <span className="ml-auto text-xs font-medium">
                                            Tracking: {data.trackingNumber}
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-[#1a202c]">Products</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-4 pb-4 border-b last:border-0 border-slate-100"
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
                                            <p className="font-medium text-[#1a202c]">{item.name}</p>
                                            {item.variationText && (
                                                <p className="text-sm text-slate-500">{item.variationText}</p>
                                            )}
                                            <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-[#1a202c]">৳{item.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}