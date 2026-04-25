"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { verifyReview, deleteReview } from "@/actions/admin-reviews"
import { Search, Star, Check, X, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { formatDateDhaka } from "@/lib/utils"

type Review = {
    id: string
    rating: number
    title: string | null
    comment: string | null
    isVerified: boolean
    createdAt: Date
    user: {
        id: string
        name: string | null
        email: string
        image: string | null
    }
    product: {
        id: string
        name: string
        slug: string
        images: string[]
    }
}

interface ReviewsTableProps {
    reviews: Review[]
    pagination: {
        page: number
        limit: number
        total: number
        pages: number
    }
    filters: {
        search?: string
        rating?: number
        verified?: string
    }
}

export function ReviewsTable({ reviews, pagination, filters }: ReviewsTableProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [search, setSearch] = useState(filters.search || "")

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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        updateFilters({ search: search || undefined })
    }

    const handleVerify = (id: string, isVerified: boolean) => {
        startTransition(async () => {
            await verifyReview(id, isVerified)
        })
    }

    const handleDelete = (id: string) => {
        startTransition(async () => {
            await deleteReview(id)
        })
    }

    const goToPage = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", page.toString())
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>All Reviews ({pagination.total})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search reviews..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Button type="submit" variant="secondary" size="sm" className="shrink-0">Search</Button>
                    </form>

                    <div className="flex gap-2 sm:gap-4">
                        <Select
                            value={filters.rating?.toString() || "all"}
                            onValueChange={(value) =>
                                updateFilters({ rating: value === "all" ? undefined : value })
                            }
                        >
                            <SelectTrigger className="w-full sm:w-37.5">
                                <SelectValue placeholder="Rating" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Ratings</SelectItem>
                                <SelectItem value="5">5 Stars</SelectItem>
                                <SelectItem value="4">4 Stars</SelectItem>
                                <SelectItem value="3">3 Stars</SelectItem>
                                <SelectItem value="2">2 Stars</SelectItem>
                                <SelectItem value="1">1 Star</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.verified || "all"}
                            onValueChange={(value) =>
                                updateFilters({ verified: value === "all" ? undefined : value })
                            }
                        >
                            <SelectTrigger className="w-full sm:w-37.5">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="verified">Verified</SelectItem>
                                <SelectItem value="unverified">Unverified</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-md border overflow-x-auto">
                    <Table className="min-w-200">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Review</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reviews.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No reviews found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reviews.map((review) => (
                                    <TableRow key={review.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden shrink-0 relative">
                                                    {review.product.images[0] ? (
                                                        <Image
                                                            src={review.product.images[0]}
                                                            alt={review.product.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-200" />
                                                    )}
                                                </div>
                                                <Link
                                                    href={`/products/${review.product.slug}`}
                                                    className="font-medium hover:underline line-clamp-1"
                                                    target="_blank"
                                                >
                                                    {review.product.name}
                                                </Link>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{review.user.name || "Anonymous"}</p>
                                                <p className="text-sm text-muted-foreground">{review.user.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-4 w-4 ${i < review.rating
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "text-gray-300"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xs">
                                            {review.title && (
                                                <p className="font-medium line-clamp-1">{review.title}</p>
                                            )}
                                            {review.comment && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {review.comment}
                                                </p>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {review.isVerified ? (
                                                <Badge variant="success">Verified</Badge>
                                            ) : (
                                                <Badge variant="secondary">Pending</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {formatDateDhaka(review.createdAt, "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {review.isVerified ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleVerify(review.id, false)}
                                                        disabled={isPending}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleVerify(review.id, true)}
                                                        disabled={isPending}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="sm" variant="destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Review</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete this review? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(review.id)}
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">
                            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                            {pagination.total} reviews
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
