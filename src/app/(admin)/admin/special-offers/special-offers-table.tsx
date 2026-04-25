"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { deleteSpecialOffer } from "@/actions/admin-special-offers"
import { format } from "date-fns"

type SpecialOffer = {
    id: string
    title: string
    productId: string | null
    productLink: string | null
    endDate: Date
    order: number
    isActive: boolean
}

export function SpecialOffersTable({ offers }: { offers: SpecialOffer[] }) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return

        startTransition(async () => {
            await deleteSpecialOffer(id)
        })
    }

    return (
        <div className="rounded-lg border bg-card">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b bg-muted/50">
                        <tr>
                            <th className="p-3 md:p-4 text-left font-medium">Title</th>
                            <th className="p-3 md:p-4 text-center font-medium">End Date</th>
                            <th className="p-3 md:p-4 text-center font-medium">Order</th>
                            <th className="p-3 md:p-4 text-center font-medium">Status</th>
                            <th className="p-3 md:p-4 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {offers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                    No special offers found
                                </td>
                            </tr>
                        ) : (
                            offers.map((offer) => (
                                <tr key={offer.id} className="border-b last:border-0">
                                    <td className="p-3 md:p-4">
                                        <div className="font-medium">{offer.title}</div>
                                        {offer.productLink && (
                                            <div className="text-sm text-muted-foreground">
                                                {offer.productLink}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-3 md:p-4 text-center">
                                        {format(new Date(offer.endDate), "MMM dd, yyyy HH:mm")}
                                    </td>
                                    <td className="p-3 md:p-4 text-center">{offer.order}</td>
                                    <td className="p-3 md:p-4 text-center">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${offer.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {offer.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="p-3 md:p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/special-offers/${offer.id}/edit`}>
                                                <Button variant="outline" size="sm">
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(offer.id, offer.title)}
                                                disabled={isPending}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
