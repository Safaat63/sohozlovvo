"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { updateFeedbackStatus, deleteFeedback } from "@/actions/admin"
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
import { Trash2 } from "lucide-react"

const FEEDBACK_TYPES = ["general", "complaint", "suggestion", "appreciation", "bug", 'contact-form'] as const
const FEEDBACK_STATUSES = ["pending", "reviewed", "resolved", "dismissed"] as const
type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number]

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" {
    switch (status) {
        case "pending":
            return "warning"
        case "reviewed":
            return "default"
        case "resolved":
            return "success"
        case "dismissed":
            return "destructive"
        default:
            return "default"
    }
}

function getTypeVariant(type: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" {
    switch (type) {
        case "general":
            return "default"
        case "complaint":
            return "destructive"
        case "suggestion":
            return "secondary"
        case "appreciation":
            return "success"
        case "bug":
            return "warning"
        default:
            return "default"
    }
}

type Feedback = {
    id: string
    name: string | null
    email: string | null
    subject: string | null
    phone: string | null
    message: string
    type: string
    status: string
    createdAt: Date
}

type Pagination = { page: number; limit: number; total: number; pages: number }

export function FeedbackTable({
    feedback,
    pagination,
    filters,
}: {
    feedback: Feedback[]
    pagination: Pagination
    filters: { status?: string | null; type?: string | null; limit?: number }
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [bulkStatus, setBulkStatus] = useState<FeedbackStatus | "keep">(filters.status as FeedbackStatus || "keep")
    const allSelected = useMemo(() => selectedIds.length === feedback.length && feedback.length > 0, [selectedIds, feedback.length])

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", page.toString())
        router.push(`/admin/feedback?${params.toString()}`)
    }

    const handleLimitChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("limit", value)
        params.set("page", "1")
        router.push(`/admin/feedback?${params.toString()}`)
    }

    const handleStatusFilter = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== "all") params.set("status", value)
        else params.delete("status")
        params.set("page", "1")
        router.push(`/admin/feedback?${params.toString()}`)
    }

    const handleTypeFilter = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== "all") params.set("type", value)
        else params.delete("type")
        params.set("page", "1")
        router.push(`/admin/feedback?${params.toString()}`)
    }

    const toggleSelectAll = () => {
        setSelectedIds(allSelected ? [] : feedback.map((f) => f.id))
    }

    const toggleSelectOne = (id: string) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
    }

    const applyBulkUpdate = () => {
        if (!selectedIds.length) return alert("Select at least one feedback message")
        if (bulkStatus === "keep") return alert("Choose a status to apply")

        startTransition(async () => {
            const result = await updateFeedbackStatus({
                ids: selectedIds,
                status: bulkStatus
            })
            if (result.error) alert(result.error)
            setSelectedIds([])
            router.refresh()
        })
    }

    const handleDelete = (ids: string[]) => {
        if (!confirm(`Are you sure you want to delete ${ids.length} feedback message(s)?`)) return

        startTransition(async () => {
            const result = await deleteFeedback(ids)
            if (result.error) alert(result.error)
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
                            {FEEDBACK_STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filters.type || "all"} onValueChange={handleTypeFilter}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All types</SelectItem>
                            {FEEDBACK_TYPES.map((t) => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
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
                        <Select value={bulkStatus} onValueChange={(value) => setBulkStatus(value as FeedbackStatus | "keep")}>
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="keep">Keep status</SelectItem>
                                {FEEDBACK_STATUSES.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button size="sm" onClick={applyBulkUpdate} disabled={isPending}>
                            Apply to selected
                        </Button>
                        {selectedIds.length > 0 && (
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(selectedIds)}
                                disabled={isPending}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete selected
                            </Button>
                        )}
                    </div>
                </div>

                <div className="divide-y">
                    <div className="hidden sm:grid grid-cols-12 px-3 sm:px-4 py-2 text-sm font-medium bg-muted/50">
                        <div className="col-span-1 flex items-center">
                            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} aria-label="Select all" />
                        </div>
                        <div className="col-span-3">Contact</div>
                        <div className="col-span-4">Message</div>
                        <div className="col-span-2">Type & Status</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    {feedback.map((item) => (
                        <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 px-3 sm:px-4 py-3 sm:py-4 gap-3 sm:gap-2 items-start">
                            <div className="flex items-center sm:col-span-1">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(item.id)}
                                    onChange={() => toggleSelectOne(item.id)}
                                    aria-label={`Select feedback ${item.id}`}
                                />
                            </div>
                            <div className="sm:col-span-3">
                                <div className="font-medium">{item.name || "Anonymous"}</div>
                                <div className="text-xs text-muted-foreground">{item.email || ""}</div>
                                <div className="text-xs text-muted-foreground">{item.phone || ""}</div>
                                <div className="text-xs text-muted-foreground">{formatDateTimeDhaka(item.createdAt)}</div>
                            </div>
                            <div className="sm:col-span-4 text-sm space-y-1">
                                {item.subject && (
                                    <div className="font-medium">{item.subject}</div>
                                )}
                                <div className="text-muted-foreground overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.message}</div>
                            </div>
                            <div className="sm:col-span-2 flex flex-wrap sm:flex-col gap-1">
                                <Badge variant={getTypeVariant(item.type)} className="text-xs capitalize">{item.type}</Badge>
                                <Badge variant={getStatusVariant(item.status)} className="text-xs capitalize">{item.status}</Badge>
                            </div>
                            <div className="sm:col-span-2 flex flex-wrap justify-start sm:justify-end gap-2">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/admin/feedback/${item.id}`}>View</Link>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete([item.id])}
                                    disabled={isPending}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {feedback.length === 0 && (
                        <div className="p-6 text-center text-muted-foreground">No feedback messages found</div>
                    )}
                </div>
            </div>

            {pagination.pages > 1 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                        Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} feedback messages
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