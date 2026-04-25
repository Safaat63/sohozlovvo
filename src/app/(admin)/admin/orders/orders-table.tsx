"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { bulkUpdateOrders, deleteOrders, deleteOrder } from "@/actions/admin"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { formatDateTimeDhaka } from "@/lib/utils"
import { InvoiceButton } from "@/components/invoice-button"
import { Trash2 } from "lucide-react"

const ORDER_STATUSES = ["PENDING", "VERIFIED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"] as const
type OrderStatus = (typeof ORDER_STATUSES)[number]
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const
type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" {
    switch (status) {
        case "PENDING":
            return "warning"
        case "VERIFIED":
        case "PROCESSING":
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
    paymentStatus: PaymentStatus
    paymentMethod: string
    total: { toString: () => string }
    createdAt: Date
    customerName: string | null
    customerEmail: string | null
    customerPhone: string | null
    user?: { name: string | null; email: string | null } | null
    items: { name: string; quantity: number; price: { toString: () => string }; sku: string | null }[]
    shippingAddress: string | null
    couponCode?: string | null
    discount?: { toString: () => string } | null
    subtotal: { toString: () => string }
    shippingCost: { toString: () => string }
}

type Pagination = { page: number; limit: number; total: number; pages: number }

export function OrdersTable({
    orders,
    pagination,
    filters,
}: {
    orders: Order[]
    pagination: Pagination
    filters: { status?: OrderStatus | null; limit?: number }
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [bulkStatus, setBulkStatus] = useState<OrderStatus | "keep">(filters.status || "keep")
    const [bulkPaymentStatus, setBulkPaymentStatus] = useState<PaymentStatus | "keep">("keep")
    const allSelected = useMemo(() => selectedIds.length === orders.length && orders.length > 0, [selectedIds, orders.length])

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", page.toString())
        router.push(`/admin/orders?${params.toString()}`)
    }

    const handleLimitChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("limit", value)
        params.set("page", "1")
        router.push(`/admin/orders?${params.toString()}`)
    }

    const handleStatusFilter = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== "all") params.set("status", value)
        else params.delete("status")
        params.set("page", "1")
        router.push(`/admin/orders?${params.toString()}`)
    }

    const toggleSelectAll = () => {
        setSelectedIds(allSelected ? [] : orders.map((o) => o.id))
    }

    const toggleSelectOne = (id: string) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
    }

    const applyBulkUpdate = () => {
        if (!selectedIds.length) return alert("Select at least one order")
        if (bulkStatus === "keep" && bulkPaymentStatus === "keep") return alert("Choose a status to apply")

        startTransition(async () => {
            const result = await bulkUpdateOrders({
                ids: selectedIds,
                status: bulkStatus === "keep" ? undefined : bulkStatus,
                paymentStatus: bulkPaymentStatus === "keep" ? undefined : bulkPaymentStatus
            })
            if (result.error) alert(result.error)
            setSelectedIds([])
            router.refresh()
        })
    }

    return (
        <div className="space-y-4">
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
                <div className="text-sm text-muted-foreground">Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</div>
            </div>

            <div className="rounded-lg border bg-card">
                <div className="flex flex-col gap-2 border-b p-3 sm:p-4">
                    <div className="flex flex-wrap gap-2 items-center">
                        <div className="text-sm text-muted-foreground">{selectedIds.length} selected</div>
                        <Select value={bulkStatus} onValueChange={(value) => setBulkStatus(value as OrderStatus | "keep")}>
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Order status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="keep">Keep order status</SelectItem>
                                {ORDER_STATUSES.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={bulkPaymentStatus} onValueChange={(value) => setBulkPaymentStatus(value as PaymentStatus | "keep")}>
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Payment status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="keep">Keep payment status</SelectItem>
                                {PAYMENT_STATUSES.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button size="sm" onClick={applyBulkUpdate} disabled={isPending}>
                            Apply to selected
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            disabled={!selectedIds.length || isPending}
                            onClick={() => {
                                if (!confirm(`Delete ${selectedIds.length} order(s)? This action cannot be undone.`)) return
                                startTransition(async () => {
                                    const result = await deleteOrders(selectedIds)
                                    if (result.error) alert(result.error)
                                    setSelectedIds([])
                                    router.refresh()
                                })
                            }}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete selected
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <div className="min-w-240 divide-y">
                        <div className="hidden sm:grid grid-cols-12 px-3 sm:px-4 py-2 text-sm font-medium bg-muted/50">
                            <div className="col-span-1 flex items-center">
                                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} aria-label="Select all" />
                            </div>
                            <div className="col-span-4">Order</div>
                            <div className="col-span-2">Customer</div>
                            <div className="col-span-2 text-right">Total</div>
                            <div className="col-span-2 text-center">Status</div>
                            <div className="col-span-1 text-right">Actions</div>
                        </div>

                        {orders.map((order) => {
                            const invoiceData = {
                                orderNumber: order.orderNumber,
                                createdAt: order.createdAt.toString(),
                                customerName: order.customerName || order.user?.name || "Guest",
                                customerEmail: order.customerEmail || order.user?.email || "",
                                customerPhone: order.customerPhone,
                                shippingAddress: order.shippingAddress || "",
                                items: order.items.map((item) => ({
                                    name: item.name,
                                    quantity: item.quantity,
                                    price: item.price.toString(),
                                    sku: item.sku,
                                })),
                                subtotal: order.subtotal.toString(),
                                shippingCost: order.shippingCost.toString(),
                                tax: "0",
                                discount: order.discount?.toString() || "0",
                                total: order.total.toString(),
                                paymentMethod: order.paymentMethod,
                                paymentStatus: order.paymentStatus,
                                couponCode: order.couponCode,
                            }

                            return (
                                <div key={order.id} className="flex flex-col sm:grid sm:grid-cols-12 px-3 sm:px-4 py-3 sm:py-4 gap-3 sm:gap-2 lg:gap-3 items-start">
                                    <div className="flex items-center sm:col-span-1">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(order.id)}
                                            onChange={() => toggleSelectOne(order.id)}
                                            aria-label={`Select order ${order.orderNumber}`}
                                        />
                                    </div>
                                    <div className="sm:col-span-4">
                                        <div className="font-medium">#{order.orderNumber}</div>
                                        <div className="text-xs text-muted-foreground">{formatDateTimeDhaka(order.createdAt)}</div>
                                    </div>
                                    <div className="sm:col-span-2 text-sm space-y-1">
                                        <div className="font-medium wrap-break-word">{order.customerName || order.user?.name || "Guest"}</div>
                                        <div className="text-xs text-muted-foreground break-all">{order.customerEmail || order.user?.email || ""}</div>
                                    </div>
                                    <div className="sm:col-span-2 text-left sm:text-right font-semibold">
                                        <span className="sm:hidden text-xs text-muted-foreground">Total: </span>
                                        ৳{parseFloat(order.total.toString()).toLocaleString()}
                                    </div>
                                    <div className="sm:col-span-2 flex flex-wrap sm:flex-col sm:items-center gap-1">
                                        <div className="sm:hidden text-xs text-muted-foreground mb-1">Status:</div>
                                        <Badge variant={getStatusVariant(order.status)} className="text-xs">{order.status}</Badge>
                                        <Badge variant={order.paymentStatus === "PAID" ? "success" : "warning"} className="text-xs">
                                            {order.paymentStatus}
                                        </Badge>
                                    </div>
                                    <div className="w-full sm:w-auto sm:col-span-1 flex flex-row gap-2 sm:flex-col sm:items-end sm:justify-end">
                                        <InvoiceButton order={invoiceData} />
                                        <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-initial">
                                            <Link href={`/admin/orders/${order.id}`}>Details</Link>
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="flex-1 sm:flex-initial"
                                            disabled={isPending}
                                            onClick={() => {
                                                if (!confirm(`Delete order #${order.orderNumber}? This action cannot be undone.`)) return
                                                startTransition(async () => {
                                                    const result = await deleteOrder(order.id)
                                                    if (result.error) alert(result.error)
                                                    else alert("Order deleted successfully")
                                                    router.refresh()
                                                })
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}

                        {orders.length === 0 && (
                            <div className="p-6 text-center text-muted-foreground">No orders found</div>
                        )}
                    </div>
                </div>
            </div>

            {pagination.pages > 1 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                        Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page === 1}
                            onClick={() => handlePageChange(pagination.page - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page === pagination.pages}
                            onClick={() => handlePageChange(pagination.page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
