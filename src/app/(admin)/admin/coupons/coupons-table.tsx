"use client"

import { useTransition, useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { formatDateDhaka } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { deleteCoupon, toggleCouponStatus, bulkToggleCouponStatus, bulkDeleteCoupons } from "@/actions/admin-coupons"

type Coupon = {
    id: string
    code: string
    description: string | null
    discountType: string
    discountValue: number
    minPurchaseAmount: number | null
    maxDiscountAmount: number | null
    usageLimit: number | null
    usageCount: number
    startDate: Date | null
    endDate: Date | null
    isActive: boolean
}

export function CouponsTable({
    coupons,
    pagination,
    currentStatus,
    currentLimit,
}: {
    coupons: Coupon[]
    pagination: { page: number; limit: number; total: number; pages: number }
    currentStatus?: string
    currentLimit?: number
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const allSelected = useMemo(() => selectedIds.length === coupons.length && coupons.length > 0, [selectedIds, coupons.length])

    const handleFilterChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== "all") {
            params.set("status", value)
        } else {
            params.delete("status")
        }
        params.set("page", "1")
        router.push(`/admin/coupons?${params.toString()}`)
    }

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", page.toString())
        router.push(`/admin/coupons?${params.toString()}`)
    }

    const handleLimitChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("limit", value)
        params.set("page", "1")
        router.push(`/admin/coupons?${params.toString()}`)
    }

    const handleDelete = async (id: string, code: string) => {
        if (!confirm(`Are you sure you want to delete coupon "${code}"?`)) return

        startTransition(async () => {
            const result = await deleteCoupon(id)
            if (result.error) {
                alert(result.error)
            }
        })
    }

    const handleToggleStatus = async (id: string) => {
        startTransition(async () => {
            await toggleCouponStatus(id)
        })
    }

    const handleBulkToggleStatus = async (isActive: boolean) => {
        if (!selectedIds.length) return alert("Select at least one coupon")
        if (!confirm(`Change ${selectedIds.length} coupon(s) to ${isActive ? "active" : "inactive"}?`)) return

        startTransition(async () => {
            const result = await bulkToggleCouponStatus(selectedIds, isActive)
            if (result.error) alert(result.error)
            setSelectedIds([])
            router.refresh()
        })
    }

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return alert("Select at least one coupon")
        if (!confirm(`Delete ${selectedIds.length} coupon(s)? This cannot be undone.`)) return

        startTransition(async () => {
            const result = await bulkDeleteCoupons(selectedIds)
            if (result.error) alert(result.error)
            setSelectedIds([])
            router.refresh()
        })
    }

    const toggleSelectAll = () => {
        setSelectedIds(allSelected ? [] : coupons.map((c) => c.id))
    }

    const toggleSelectOne = (id: string) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id])
    }

    const formatDiscount = (coupon: Coupon) => {
        const value = parseFloat(coupon.discountValue.toString())
        if (coupon.discountType === "PERCENTAGE") {
            return `${value}%`
        }
        return `৳${value.toLocaleString()}`
    }

    const isExpired = (coupon: Coupon) => {
        return coupon.endDate && new Date(coupon.endDate) < new Date()
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Select
                    value={currentStatus || "all"}
                    onValueChange={handleFilterChange}
                >
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Coupons</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                </Select>

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
            <div className="rounded-lg border bg-card overflow-x-auto">
                <table className="w-full min-w-175">
                    <thead className="border-b bg-muted/50">
                        <tr>
                            <th className="p-3 md:p-4 text-left font-medium">
                                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} aria-label="Select all" />
                            </th>
                            <th className="p-3 md:p-4 text-left font-medium">Code</th>
                            <th className="p-3 md:p-4 text-left font-medium">Discount</th>
                            <th className="p-3 md:p-4 text-center font-medium">Usage</th>
                            <th className="p-3 md:p-4 text-left font-medium">Valid Period</th>
                            <th className="p-3 md:p-4 text-center font-medium">Status</th>
                            <th className="p-3 md:p-4 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map((coupon) => (
                            <tr key={coupon.id} className="border-b last:border-0">
                                <td className="p-3 md:p-4">
                                    <input type="checkbox" checked={selectedIds.includes(coupon.id)} onChange={() => toggleSelectOne(coupon.id)} aria-label={`Select ${coupon.code}`} />
                                </td>
                                <td className="p-3 md:p-4">
                                    <div>
                                        <code className="rounded bg-muted px-2 py-1 text-sm font-medium">
                                            {coupon.code}
                                        </code>
                                        {coupon.description && (
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {coupon.description}
                                            </p>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3 md:p-4">
                                    <div className="font-medium">{formatDiscount(coupon)}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {coupon.discountType.replace("_", " ")}
                                    </div>
                                </td>
                                <td className="p-3 md:p-4 text-center">
                                    {coupon.usageCount}
                                    {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                                </td>
                                <td className="p-3 md:p-4 text-sm">
                                    {coupon.startDate && (
                                        <div>
                                            From: {formatDateDhaka(coupon.startDate, "MMM d, yyyy")}
                                        </div>
                                    )}
                                    {coupon.endDate && (
                                        <div>
                                            To: {formatDateDhaka(coupon.endDate, "MMM d, yyyy")}
                                        </div>
                                    )}
                                    {!coupon.startDate && !coupon.endDate && (
                                        <span className="text-muted-foreground">No limit</span>
                                    )}
                                </td>
                                <td className="p-3 md:p-4 text-center">
                                    {isExpired(coupon) ? (
                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                                            Expired
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleToggleStatus(coupon.id)}
                                            disabled={isPending}
                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${coupon.isActive
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {coupon.isActive ? "Active" : "Inactive"}
                                        </button>
                                    )}
                                </td>
                                <td className="p-3 md:p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/admin/coupons/${coupon.id}/edit`}>
                                            <Button variant="outline" size="sm">
                                                Edit
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(coupon.id, coupon.code)}
                                            disabled={isPending}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {coupons.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                        No coupons found
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                        Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                        {pagination.total} coupons
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
