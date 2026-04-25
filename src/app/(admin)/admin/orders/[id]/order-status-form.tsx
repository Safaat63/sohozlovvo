"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateOrderStatus } from "@/actions/admin"

interface OrderStatusFormProps {
    orderId: string
    currentStatus: string
    currentPaymentStatus: string
    currentTrackingNumber: string
}

const ORDER_STATUSES = [
    { value: "PENDING", label: "Pending" },
    { value: "VERIFIED", label: "Payment Verified" },
    { value: "PROCESSING", label: "Processing" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "RETURNED", label: "Returned" },
]

const PAYMENT_STATUSES = [
    { value: "PENDING", label: "Pending" },
    { value: "PAID", label: "Paid" },
    { value: "FAILED", label: "Failed" },
    { value: "REFUNDED", label: "Refunded" },
]

export function OrderStatusForm({
    orderId,
    currentStatus,
    currentPaymentStatus,
    currentTrackingNumber,
}: OrderStatusFormProps) {
    const [status, setStatus] = useState(currentStatus)
    const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus)
    const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        startTransition(async () => {
            await updateOrderStatus(orderId, status, paymentStatus, trackingNumber || undefined)
            router.refresh()
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="status">Order Status</Label>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        {ORDER_STATUSES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                                {s.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                    <SelectTrigger id="paymentStatus">
                        <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                    <SelectContent>
                        {PAYMENT_STATUSES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                                {s.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Only show tracking number for statuses that need it (not DELIVERED, CANCELLED, RETURNED) */}
            {!["DELIVERED", "CANCELLED", "RETURNED"].includes(status) && (
                <div className="space-y-2">
                    <Label htmlFor="tracking">Tracking Number</Label>
                    <Input
                        id="tracking"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Enter tracking number"
                    />
                    <p className="text-xs text-muted-foreground">
                        Add when order is shipped. Customer will receive an email notification.
                    </p>
                </div>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Updating..." : "Update Order"}
            </Button>
        </form>
    )
}
