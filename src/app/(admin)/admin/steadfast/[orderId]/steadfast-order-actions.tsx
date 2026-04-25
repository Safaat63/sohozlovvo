"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    createSteadfastOrder,
    checkStatusByTrackingCode,
    createReturnRequest,
    type SteadfastDeliveryStatus,
} from "@/actions/admin-steadfast"
import { Send, RefreshCw, Truck, Undo2, Loader2, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import { toast } from "sonner"

const statusConfig: Record<SteadfastDeliveryStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
    pending: { label: "Pending", color: "bg-yellow-500", icon: Clock },
    in_review: { label: "In Review", color: "bg-blue-500", icon: Clock },
    hold: { label: "On Hold", color: "bg-orange-500", icon: AlertCircle },
    delivered: { label: "Delivered", color: "bg-green-500", icon: CheckCircle },
    delivered_approval_pending: { label: "Delivered (Pending Approval)", color: "bg-green-400", icon: CheckCircle },
    partial_delivered: { label: "Partially Delivered", color: "bg-teal-500", icon: CheckCircle },
    partial_delivered_approval_pending: { label: "Partially Delivered (Pending)", color: "bg-teal-400", icon: CheckCircle },
    cancelled: { label: "Cancelled", color: "bg-red-500", icon: XCircle },
    cancelled_approval_pending: { label: "Cancelled (Pending Approval)", color: "bg-red-400", icon: XCircle },
    unknown: { label: "Unknown", color: "bg-gray-500", icon: AlertCircle },
    unknown_approval_pending: { label: "Unknown (Pending)", color: "bg-gray-400", icon: AlertCircle },
}

export function SteadfastOrderActions({
    orderId,
    orderNumber,
    trackingNumber,
    codAmount,
}: {
    orderId: string
    orderNumber: string
    trackingNumber: string | null
    codAmount: number
}) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [deliveryStatus, setDeliveryStatus] = useState<SteadfastDeliveryStatus | null>(null)
    const [returnReason, setReturnReason] = useState("")
    const [returnDialogOpen, setReturnDialogOpen] = useState(false)

    const handleSendToSteadfast = () => {
        startTransition(async () => {
            const result = await createSteadfastOrder(orderId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Order sent to Steadfast successfully!")
                router.refresh()
            }
        })
    }

    const handleCheckStatus = () => {
        if (!trackingNumber) {
            toast.error("No tracking number available")
            return
        }

        startTransition(async () => {
            const result = await checkStatusByTrackingCode(trackingNumber)
            if (result.error) {
                toast.error(result.error)
            } else if (result.deliveryStatus) {
                setDeliveryStatus(result.deliveryStatus)
                toast.success("Status updated!")
            }
        })
    }

    const handleCreateReturnRequest = () => {
        startTransition(async () => {
            const result = await createReturnRequest({
                invoice: orderNumber,
                reason: returnReason || undefined,
            })
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Return request created successfully!")
                setReturnDialogOpen(false)
                setReturnReason("")
            }
        })
    }

    const StatusIcon = deliveryStatus ? statusConfig[deliveryStatus].icon : null

    return (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Steadfast Courier
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Tracking Info */}
                {trackingNumber ? (
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Tracking Code</p>
                                <p className="font-mono font-bold text-lg">{trackingNumber}</p>
                            </div>
                            <Badge variant="success">Sent to Steadfast</Badge>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <p className="font-medium">Not yet sent to Steadfast</p>
                                <p className="text-sm text-muted-foreground">
                                    Send this order to Steadfast Courier for delivery
                                </p>
                            </div>
                            <Button onClick={handleSendToSteadfast} disabled={isPending}>
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4 mr-2" />
                                )}
                                Send to Steadfast
                            </Button>
                        </div>
                    </div>
                )}

                {/* COD Amount */}
                {codAmount > 0 && (
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Cash on Delivery Amount</span>
                            <span className="font-bold text-lg text-orange-600 dark:text-orange-400">
                                ৳{codAmount.toFixed(0)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Delivery Status */}
                {trackingNumber && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Delivery Status</Label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCheckStatus}
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4 mr-1" />
                                )}
                                Check Status
                            </Button>
                        </div>
                        {deliveryStatus && (
                            <div
                                className={`p-3 rounded-lg flex items-center gap-3 ${statusConfig[deliveryStatus].color} bg-opacity-10`}
                            >
                                {StatusIcon && (
                                    <StatusIcon
                                        className={`h-5 w-5 ${deliveryStatus.includes("delivered")
                                                ? "text-green-600"
                                                : deliveryStatus.includes("cancelled")
                                                    ? "text-red-600"
                                                    : "text-yellow-600"
                                            }`}
                                    />
                                )}
                                <span className="font-medium">{statusConfig[deliveryStatus].label}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                {trackingNumber && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t dark:border-gray-700">
                        <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Undo2 className="h-4 w-4 mr-1" />
                                    Request Return
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Return Request</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div>
                                        <Label>Order Number</Label>
                                        <Input value={orderNumber} disabled className="mt-1" />
                                    </div>
                                    <div>
                                        <Label>Tracking Code</Label>
                                        <Input value={trackingNumber} disabled className="mt-1" />
                                    </div>
                                    <div>
                                        <Label>Reason (Optional)</Label>
                                        <Textarea
                                            value={returnReason}
                                            onChange={(e) => setReturnReason(e.target.value)}
                                            placeholder="Enter reason for return..."
                                            className="mt-1"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setReturnDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleCreateReturnRequest}
                                        disabled={isPending}
                                    >
                                        {isPending ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Undo2 className="h-4 w-4 mr-2" />
                                        )}
                                        Submit Request
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Button variant="ghost" size="sm" asChild>
                            <a
                                href={`https://portal.packzy.com/track/${trackingNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Track on Steadfast
                            </a>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
