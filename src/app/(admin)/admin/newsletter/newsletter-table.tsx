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
import { formatDateDhaka } from "@/lib/utils"
import { bulkToggleNewsletterStatus, bulkDeleteNewsletterSubscribers } from "@/actions/admin-newsletter"
import { RemoveSubscriberButton } from "./remove-subscriber-button"

type Subscriber = {
    id: string
    email: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

export function NewsletterTable({
    subscribers,
    pagination,
    currentLimit,
}: {
    subscribers: Subscriber[]
    pagination: { page: number; limit: number; total: number; pages: number }
    currentLimit?: number
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const allSelected = useMemo(() => selectedIds.length === subscribers.length && subscribers.length > 0, [selectedIds, subscribers.length])

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", page.toString())
        router.push(`/admin/newsletter?${params.toString()}`)
    }

    const handleLimitChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("limit", value)
        params.set("page", "1")
        router.push(`/admin/newsletter?${params.toString()}`)
    }

    const handleBulkToggleStatus = async (isActive: boolean) => {
        if (!selectedIds.length) return alert("Select at least one subscriber")
        if (!confirm(`Change ${selectedIds.length} subscriber(s) to ${isActive ? "active" : "inactive"}?`)) return

        startTransition(async () => {
            const result = await bulkToggleNewsletterStatus(selectedIds, isActive)
            if (result.error) alert(result.error)
            setSelectedIds([])
            router.refresh()
        })
    }

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return alert("Select at least one subscriber")
        if (!confirm(`Delete ${selectedIds.length} subscriber(s)? This cannot be undone.`)) return

        startTransition(async () => {
            const result = await bulkDeleteNewsletterSubscribers(selectedIds)
            if (result.error) alert(result.error)
            setSelectedIds([])
            router.refresh()
        })
    }

    const toggleSelectAll = () => {
        setSelectedIds(allSelected ? [] : subscribers.map((s) => s.id))
    }

    const toggleSelectOne = (id: string) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id])
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Select value={(currentLimit || pagination.limit).toString()} onValueChange={handleLimitChange}>
                    <SelectTrigger className="w-full sm:w-28">
                        <SelectValue placeholder="Page size" />
                    </SelectTrigger>
                    <SelectContent>
                        {[10, 20, 50, 100].map((size) => (
                            <SelectItem key={size} value={size.toString()}>{size}/page</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Bulk actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <div className="text-sm text-muted-foreground">
                    {selectedIds.length} selected
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => handleBulkToggleStatus(true)} disabled={isPending}>
                        Activate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleBulkToggleStatus(false)} disabled={isPending}>
                        Deactivate
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isPending}>
                        Delete Selected
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
                <table className="w-full min-w-180">
                    <thead className="border-b bg-muted/50">
                        <tr>
                            <th className="p-3 text-left font-medium">
                                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} aria-label="Select all" />
                            </th>
                            <th className="p-3 text-left font-medium">Email</th>
                            <th className="p-3 text-left font-medium">Status</th>
                            <th className="p-3 text-left font-medium">Subscribed Date</th>
                            <th className="p-3 text-left font-medium">Last Updated</th>
                            <th className="p-3 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscribers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                    No subscribers yet
                                </td>
                            </tr>
                        ) : (
                            subscribers.map((subscriber) => (
                                <tr key={subscriber.id} className="border-b last:border-0">
                                    <td className="p-3">
                                        <input type="checkbox" checked={selectedIds.includes(subscriber.id)} onChange={() => toggleSelectOne(subscriber.id)} aria-label={`Select ${subscriber.email}`} />
                                    </td>
                                    <td className="p-3 font-medium">{subscriber.email}</td>
                                    <td className="p-3">
                                        {subscriber.isActive ? (
                                            <Badge variant="success">Active</Badge>
                                        ) : (
                                            <Badge variant="destructive">Unsubscribed</Badge>
                                        )}
                                    </td>
                                    <td className="p-3">{formatDateDhaka(subscriber.createdAt, "PP")}</td>
                                    <td className="p-3">{formatDateDhaka(subscriber.updatedAt, "PP")}</td>
                                    <td className="p-3 text-right">
                                        <RemoveSubscriberButton email={subscriber.email} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                        Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                        {pagination.total} subscribers
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