"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { formatDateDhaka } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateCustomerRole, deleteCustomer, bulkUpdateCustomerRole, bulkDeleteCustomers } from "@/actions/admin-customers"

type Customer = {
    id: string
    name: string | null
    email: string
    phone: string | null
    role: string
    createdAt: Date
    totalSpent: number
    orderCount: number
    reviewCount: number
    loyaltyPoints: number
}

export function CustomersTable({
    customers,
    pagination,
    filters,
}: {
    customers: Customer[]
    pagination: { page: number; limit: number; total: number; pages: number }
    filters: { search?: string; role?: "CUSTOMER" | "ADMIN" | "all"; limit?: number }
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [search, setSearch] = useState(filters.search || "")
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const allSelected = useMemo(() => selectedIds.length === customers.length && customers.length > 0, [selectedIds, customers.length])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams(searchParams.toString())
        if (search) {
            params.set("search", search)
        } else {
            params.delete("search")
        }
        params.set("page", "1")
        router.push(`/admin/customers?${params.toString()}`)
    }

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== "all") {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        params.set("page", "1")
        router.push(`/admin/customers?${params.toString()}`)
    }

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", page.toString())
        router.push(`/admin/customers?${params.toString()}`)
    }

    const handleLimitChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("limit", value)
        params.set("page", "1")
        router.push(`/admin/customers?${params.toString()}`)
    }

    const handleRoleChange = async (id: string, role: string) => {
        if (!confirm(`Change user role to ${role}?`)) return

        startTransition(async () => {
            const result = await updateCustomerRole(id, role)
            if (result.error) {
                alert(result.error)
            }
        })
    }

    const handleDelete = async (id: string, email: string) => {
        if (!confirm(`Are you sure you want to delete user "${email}"? This action cannot be undone.`)) return

        startTransition(async () => {
            const result = await deleteCustomer(id)
            if (result.error) {
                alert(result.error)
            }
        })
    }

    const handleBulkRole = async (role: "CUSTOMER" | "ADMIN") => {
        if (!selectedIds.length) return alert("Select at least one customer")
        if (!confirm(`Change ${selectedIds.length} customer(s) to ${role}?`)) return

        startTransition(async () => {
            const result = await bulkUpdateCustomerRole(selectedIds, role)
            if (result.error) alert(result.error)
            setSelectedIds([])
            router.refresh()
        })
    }

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return alert("Select at least one customer")
        if (!confirm(`Delete ${selectedIds.length} customer(s)? This cannot be undone.`)) return

        startTransition(async () => {
            const result = await bulkDeleteCustomers(selectedIds)
            if (result.error) alert(result.error)
            setSelectedIds([])
            router.refresh()
        })
    }

    const toggleSelectAll = () => {
        setSelectedIds(allSelected ? [] : customers.map((c) => c.id))
    }

    const toggleSelectOne = (id: string) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id])
    }

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case "ADMIN":
                return "bg-red-100 text-red-700"
            default:
                return "bg-gray-100 text-gray-700"
        }
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                    <Input
                        placeholder="Search by name, email, phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-72"
                    />
                    <Button type="submit" variant="outline" size="sm" className="shrink-0">
                        Search
                    </Button>
                </form>

                <Select
                    value={filters.role || "all"}
                    onValueChange={(value) => handleFilterChange("role", value)}
                >
                    <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="CUSTOMER">Customer</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={(filters.limit || pagination.limit).toString()} onValueChange={handleLimitChange}>
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
                    <Button variant="outline" size="sm" onClick={() => handleBulkRole("CUSTOMER")} disabled={isPending}>
                        Set Customer
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleBulkRole("ADMIN")} disabled={isPending}>
                        Set Admin
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isPending}>
                        Delete Selected
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-card overflow-x-auto">
                <table className="w-full min-w-225">
                    <thead className="border-b bg-muted/50">
                        <tr>
                            <th className="p-3 md:p-4 text-left">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={toggleSelectAll}
                                    aria-label="Select all"
                                />
                            </th>
                            <th className="p-3 md:p-4 text-left font-medium text-sm">Customer</th>
                            <th className="p-3 md:p-4 text-center font-medium text-sm">Orders</th>
                            <th className="p-3 md:p-4 text-right font-medium text-sm">Total Spent</th>
                            <th className="p-3 md:p-4 text-center font-medium text-sm">Points</th>
                            <th className="p-3 md:p-4 text-center font-medium text-sm">Role</th>
                            <th className="p-3 md:p-4 text-left font-medium text-sm">Joined</th>
                            <th className="p-3 md:p-4 text-right font-medium text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer) => (
                            <tr key={customer.id} className="border-b last:border-0 hover:bg-muted/50">
                                <td className="p-3 md:p-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(customer.id)}
                                        onChange={() => toggleSelectOne(customer.id)}
                                        aria-label={`Select ${customer.email}`}
                                    />
                                </td>
                                <td className="p-3 md:p-4">
                                    <div className="min-w-0">
                                        <div className="font-medium text-sm md:text-base">
                                            {customer.name || "No name"}
                                        </div>
                                        <div className="text-xs sm:text-sm text-muted-foreground break-all">
                                            {customer.email}
                                        </div>
                                        {customer.phone && (
                                            <div className="text-xs sm:text-sm text-muted-foreground">
                                                {customer.phone}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3 md:p-4 text-center">
                                    <span className="font-medium">{customer.orderCount}</span>
                                    {customer.reviewCount > 0 && (
                                        <div className="text-xs text-muted-foreground">
                                            {customer.reviewCount} reviews
                                        </div>
                                    )}
                                </td>
                                <td className="p-3 md:p-4 text-right font-medium">
                                    ৳{customer.totalSpent.toLocaleString()}
                                </td>
                                <td className="p-3 md:p-4 text-center">
                                    {customer.loyaltyPoints}
                                </td>
                                <td className="p-3 md:p-4 text-center">
                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getRoleBadgeClass(customer.role)}`}>
                                        {customer.role}
                                    </span>
                                </td>
                                <td className="p-3 md:p-4 text-sm text-muted-foreground">
                                    {formatDateDhaka(customer.createdAt, "MMM d, yyyy")}
                                </td>
                                <td className="p-3 md:p-4 text-right">
                                    <div className="flex justify-end gap-1 sm:gap-2">
                                        <Select
                                            value={customer.role}
                                            onValueChange={(value) => handleRoleChange(customer.id, value)}
                                        >
                                            <SelectTrigger className="h-8 w-24 sm:w-28">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CUSTOMER">Customer</SelectItem>
                                                <SelectItem value="ADMIN">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Link href={`/admin/customers/${customer.id}`}>
                                            <Button variant="outline" size="sm">
                                                View
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(customer.id, customer.email)}
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

                {customers.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                        No customers found
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                        Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                        {pagination.total} customers
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
