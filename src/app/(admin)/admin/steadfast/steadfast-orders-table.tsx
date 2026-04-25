"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDateTimeDhaka } from "@/lib/utils"
import { createSteadfastOrder, createBulkSteadfastOrders } from "@/actions/admin-steadfast"
import { Send, Loader2, ExternalLink } from "lucide-react"
import { toast } from "sonner"

const ORDER_STATUSES = ["PENDING", "VERIFIED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"] as const
type OrderStatus = (typeof ORDER_STATUSES)[number]

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" {
    switch (status) {
        case "PENDING":
            return "warning"
        case "VERIFIED":
        case "PROCESSING":
            return "default"
        case "SHIPPED":
            return "default"
        case "DELIVERED":
            return "success"
        case "CANCELLED":
        case "RETURNED":
            return "destructive"
        default:
            return "default"
    }
}

type Order = {
    id: string
    orderNumber: string
    status: OrderStatus
    paymentStatus: string
    paymentMethod: string
    total: string
    createdAt: Date
    customerName: string | null
    customerPhone: string | null
    trackingNumber: string | null
    shippingAddress: string | null
    user?: { name: string | null; email: string | null } | null
    items: { name: string; quantity: number }[]
}

type Pagination = { page: number; limit: number; total: number; pages: number }

export function SteadfastOrdersTable({
    orders,
    pagination,
    filters,
}: {
    orders: Order[]
    pagination: Pagination
    filters: { status?: string; hasTracking?: boolean; limit?: number }
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [sendingOrderId, setSendingOrderId] = useState<string | null>(null)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const allSelected = useMemo(
        () => selectedIds.length === orders.filter((o) => !o.trackingNumber).length && orders.filter((o) => !o.trackingNumber).length > 0,
        [selectedIds, orders]
    )

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", page.toString())
        router.push(`/admin/steadfast?${params.toString()}`)
    }

    const handleLimitChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("limit", value)
        params.set("page", "1")
        router.push(`/admin/steadfast?${params.toString()}`)
    }

    const handleStatusFilter = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== "all") params.set("status", value)
        else params.delete("status")
        params.set("page", "1")
        router.push(`/admin/steadfast?${params.toString()}`)
    }

    const handleTrackingFilter = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === "true" || value === "false") params.set("hasTracking", value)
        else params.delete("hasTracking")
        params.set("page", "1")
        router.push(`/admin/steadfast?${params.toString()}`)
    }

    const toggleSelectAll = () => {
        const eligibleOrders = orders.filter((o) => !o.trackingNumber)
        setSelectedIds(allSelected ? [] : eligibleOrders.map((o) => o.id))
    }

    const toggleSelectOne = (id: string) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
    }

    const handleSendToSteadfast = async (orderId: string) => {
        setSendingOrderId(orderId)
        startTransition(async () => {
            const result = await createSteadfastOrder(orderId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Order sent to Steadfast successfully!")
            }
            setSendingOrderId(null)
            router.refresh()
        })
    }

    const handleBulkSend = () => {
        if (!selectedIds.length) {
            toast.error("Select at least one order")
            return
        }

        startTransition(async () => {
            const result = await createBulkSteadfastOrders(selectedIds)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(`${result.successCount} of ${result.totalCount} orders sent successfully!`)
                setSelectedIds([])
            }
            router.refresh()
        })
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-muted-foreground">Filter:</span>
                    <Select value={filters.status || "all"} onValueChange={handleStatusFilter}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            {ORDER_STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.hasTracking === true ? "true" : filters.hasTracking === false ? "false" : "all"}
                        onValueChange={handleTrackingFilter}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Tracking" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All orders</SelectItem>
                            <SelectItem value="false">Not sent</SelectItem>
                            <SelectItem value="true">Sent to Steadfast</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={(filters.limit || pagination.limit).toString()} onValueChange={handleLimitChange}>
                        <SelectTrigger className="w-28">
                            <SelectValue placeholder="Page size" />
                        </SelectTrigger>
                        <SelectContent>
                            {[10, 20, 50, 100].map((size) => (
                                <SelectItem key={size} value={size.toString()}>{size}/page</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </div>
            </div>

            {/* Bulk Actions */}
            <div className="flex flex-wrap gap-2 items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                <div className="text-sm text-muted-foreground">{selectedIds.length} selected</div>
                <Button
                    size="sm"
                    onClick={handleBulkSend}
                    disabled={isPending || selectedIds.length === 0}
                >
                    {isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Selected to Steadfast
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800">
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={toggleSelectAll}
                                    aria-label="Select all"
                                />
                            </TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead className="hidden md:table-cell">Customer</TableHead>
                            <TableHead className="hidden lg:table-cell">Phone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden sm:table-cell">Total</TableHead>
                            <TableHead className="hidden lg:table-cell">Tracking</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No orders found
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.includes(order.id)}
                                            onCheckedChange={() => toggleSelectOne(order.id)}
                                            disabled={!!order.trackingNumber}
                                            aria-label={`Select order ${order.orderNumber}`}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            href={`/admin/steadfast/${order.id}`}
                                            className="font-medium hover:underline text-blue-600"
                                        >
                                            {order.orderNumber}
                                        </Link>
                                        <div className="text-xs text-muted-foreground">
                                            {formatDateTimeDhaka(order.createdAt)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="font-medium">
                                            {order.customerName || order.user?.name || "Guest"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        {order.customerPhone || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(order.status)}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell font-medium">
                                        ৳{parseFloat(order.total.toString()).toFixed(0)}
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        {order.trackingNumber ? (
                                            <Badge variant="success" className="font-mono text-xs">
                                                {order.trackingNumber}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline">Not sent</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {!order.trackingNumber ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleSendToSteadfast(order.id)}
                                                    disabled={isPending || sendingOrderId === order.id}
                                                >
                                                    {sendingOrderId === order.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Send className="h-4 w-4 mr-1" />
                                                            Send
                                                        </>
                                                    )}
                                                </Button>
                                            ) : (
                                                <Button size="sm" variant="ghost" asChild>
                                                    <Link href={`/admin/steadfast/${order.id}`}>
                                                        <ExternalLink className="h-4 w-4 mr-1" />
                                                        View
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                    >
                        Previous
                    </Button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                            let pageNum: number
                            if (pagination.pages <= 5) {
                                pageNum = i + 1
                            } else if (pagination.page <= 3) {
                                pageNum = i + 1
                            } else if (pagination.page >= pagination.pages - 2) {
                                pageNum = pagination.pages - 4 + i
                            } else {
                                pageNum = pagination.page - 2 + i
                            }
                            return (
                                <Button
                                    key={pageNum}
                                    variant={pagination.page === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePageChange(pageNum)}
                                >
                                    {pageNum}
                                </Button>
                            )
                        })}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    )
}
