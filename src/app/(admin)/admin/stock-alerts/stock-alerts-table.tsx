"use client"

import { useMemo, useState, useTransition } from "react"
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
import { bulkDeleteAlerts, bulkMarkAlertsNotified, notifyStockAlerts } from "@/actions/stock-alerts"
import { formatDateDhaka } from "@/lib/utils"

interface AlertRow {
    id: string
    email: string
    notified: boolean
    createdAt: Date
    productId: string
    product?: { id: string; name: string; slug: string; stock: number } | null
}

interface Pagination {
    page: number
    limit: number
    total: number
    pages: number
}

export function StockAlertsTable({ alerts, pagination }: { alerts: AlertRow[]; pagination: Pagination }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isPending, startTransition] = useTransition()
    const allSelected = useMemo(() => selectedIds.length === alerts.length && alerts.length > 0, [selectedIds, alerts.length])

    const toggleSelectAll = () => {
        setSelectedIds(allSelected ? [] : alerts.map((a) => a.id))
    }

    const toggleSelectOne = (id: string) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
    }

    const handleLimitChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("limit", value)
        params.set("page", "1")
        router.push(`/admin/stock-alerts?${params.toString()}`)
    }

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", page.toString())
        router.push(`/admin/stock-alerts?${params.toString()}`)
    }

    const applyBulkNotify = () => {
        if (!selectedIds.length) return alert("Select at least one alert")
        startTransition(async () => {
            const result = await bulkMarkAlertsNotified(selectedIds)
            if (result.error) alert(result.error)
            setSelectedIds([])
            router.refresh()
        })
    }

    const applyBulkDelete = () => {
        if (!selectedIds.length) return alert("Select at least one alert")
        if (!confirm(`Delete ${selectedIds.length} alert(s)?`)) return
        startTransition(async () => {
            const result = await bulkDeleteAlerts(selectedIds)
            if (result.error) alert(result.error)
            setSelectedIds([])
            router.refresh()
        })
    }

    const notifySingle = (productId: string) => {
        startTransition(async () => {
            await notifyStockAlerts(productId)
            router.refresh()
        })
    }

    return (
        <div className="space-y-4 rounded-lg border bg-card">
            <div className="flex flex-col sm:flex-row justify-between gap-3 border-b p-3 sm:p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {selectedIds.length} selected
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={applyBulkNotify} disabled={isPending}>
                        Mark notified
                    </Button>
                    <Button size="sm" variant="destructive" onClick={applyBulkDelete} disabled={isPending}>
                        Delete selected
                    </Button>
                    <Select value={pagination.limit.toString()} onValueChange={handleLimitChange}>
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
            </div>

            <div className="divide-y">
                <div className="hidden sm:grid grid-cols-12 px-3 sm:px-4 py-2 text-sm font-medium bg-muted/50">
                    <div className="col-span-1 flex items-center">
                        <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} aria-label="Select all" />
                    </div>
                    <div className="col-span-5">Email</div>
                    <div className="col-span-3">Product</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                {alerts.map((alert) => (
                    <div key={alert.id} className="grid grid-cols-1 sm:grid-cols-12 px-3 sm:px-4 py-3 gap-3 sm:gap-2 items-start">
                        <div className="flex items-center sm:col-span-1">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(alert.id)}
                                onChange={() => toggleSelectOne(alert.id)}
                                aria-label={`Select ${alert.email}`}
                            />
                        </div>
                        <div className="sm:col-span-5">
                            <div className="font-medium wrap-break-word">{alert.email}</div>
                            <div className="text-xs text-muted-foreground">{formatDateDhaka(alert.createdAt, "PP")}</div>
                        </div>
                        <div className="sm:col-span-3 text-sm space-y-1">
                            <div className="font-medium">{alert.product?.name || "Product"}</div>
                            <div className="text-xs text-muted-foreground">Stock: {alert.product?.stock ?? 0}</div>
                        </div>
                        <div className="sm:col-span-2 flex sm:justify-center">
                            <Badge variant={alert.notified ? "success" : "warning"}>{alert.notified ? "Notified" : "Pending"}</Badge>
                        </div>
                        <div className="sm:col-span-2 flex flex-wrap gap-2 sm:justify-end">
                            {!alert.notified && (
                                <Button size="sm" variant="outline" onClick={() => notifySingle(alert.productId)} disabled={isPending}>
                                    Notify
                                </Button>
                            )}
                        </div>
                    </div>
                ))}

                {alerts.length === 0 && (
                    <div className="p-6 text-center text-muted-foreground">No stock alerts pending.</div>
                )}
            </div>

            {pagination.pages > 1 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-3 sm:px-4 pb-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
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
