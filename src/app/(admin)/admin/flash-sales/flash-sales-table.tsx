"use client"

import { useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
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
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { deleteFlashSale, toggleFlashSale } from "@/actions/admin-flash-sales"
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { formatDateDhaka } from "@/lib/utils"

type FlashSale = {
    id: string
    salePrice: string
    startDate: Date
    endDate: Date
    isActive: boolean
    stockLimit: number | null
    soldCount: number
    product: {
        id: string
        name: string
        slug: string
        price: string
        images: string[]
        stock: number
    }
}

interface FlashSalesTableProps {
    flashSales: FlashSale[]
    pagination: {
        page: number
        limit: number
        total: number
        pages: number
    }
    filters: {
        status?: string
    }
}

export function FlashSalesTable({ flashSales, pagination, filters }: FlashSalesTableProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const updateFilters = (updates: Record<string, string | undefined>) => {
        const params = new URLSearchParams(searchParams.toString())
        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                params.set(key, value)
            } else {
                params.delete(key)
            }
        })
        params.delete("page")
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleToggle = (id: string, isActive: boolean) => {
        startTransition(async () => {
            await toggleFlashSale(id, isActive)
        })
    }

    const handleDelete = (id: string) => {
        startTransition(async () => {
            await deleteFlashSale(id)
        })
    }

    const goToPage = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", page.toString())
        router.push(`${pathname}?${params.toString()}`)
    }

    const getStatus = (flashSale: FlashSale) => {
        const now = new Date()
        const start = new Date(flashSale.startDate)
        const end = new Date(flashSale.endDate)

        if (!flashSale.isActive) return { label: "Inactive", variant: "secondary" as const }
        if (now < start) return { label: "Upcoming", variant: "warning" as const }
        if (now > end) return { label: "Ended", variant: "destructive" as const }
        return { label: "Active", variant: "success" as const }
    }

    const getDiscount = (originalPrice: string, salePrice: string) => {
        const original = parseFloat(originalPrice)
        const sale = parseFloat(salePrice)
        return Math.round(((original - sale) / original) * 100)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>All Flash Sales ({pagination.total})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Select
                        value={filters.status || "all"}
                        onValueChange={(value) =>
                            updateFilters({ status: value === "all" ? undefined : value })
                        }
                    >
                        <SelectTrigger className="w-full sm:w-45">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sales</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="ended">Ended</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="rounded-md border overflow-x-auto">
                    <Table className="min-w-225">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Original Price</TableHead>
                                <TableHead>Sale Price</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Active</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {flashSales.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                        No flash sales found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                flashSales.map((flashSale) => {
                                    const status = getStatus(flashSale)
                                    const discount = getDiscount(flashSale.product.price, flashSale.salePrice)
                                    return (
                                        <TableRow key={flashSale.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden shrink-0 relative">
                                                        {flashSale.product.images[0] ? (
                                                            <Image
                                                                src={flashSale.product.images[0]}
                                                                alt={flashSale.product.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-200" />
                                                        )}
                                                    </div>
                                                    <Link
                                                        href={`/products/${flashSale.product.slug}`}
                                                        className="font-medium hover:underline line-clamp-1"
                                                        target="_blank"
                                                    >
                                                        {flashSale.product.name}
                                                    </Link>
                                                </div>
                                            </TableCell>
                                            <TableCell className="line-through text-muted-foreground">
                                                ৳{flashSale.product.price}
                                            </TableCell>
                                            <TableCell className="font-bold text-green-600">
                                                ৳{flashSale.salePrice}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{discount}% OFF</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <p>{formatDateDhaka(flashSale.startDate, "MMM d, HH:mm")}</p>
                                                    <p className="text-muted-foreground">
                                                        to {formatDateDhaka(flashSale.endDate, "MMM d, HH:mm")}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {flashSale.stockLimit ? (
                                                    <span>
                                                        {flashSale.soldCount}/{flashSale.stockLimit}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">Unlimited</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={status.variant}>{status.label}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={flashSale.isActive}
                                                    onCheckedChange={(checked) => handleToggle(flashSale.id, checked)}
                                                    disabled={isPending}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button size="sm" variant="outline" asChild>
                                                        <Link href={`/admin/flash-sales/${flashSale.id}/edit`}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="sm" variant="destructive">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Flash Sale</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this flash sale? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(flashSale.id)}
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">
                            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                            {pagination.total} flash sales
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(pagination.page + 1)}
                                disabled={pagination.page >= pagination.pages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
