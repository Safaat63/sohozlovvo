"use client"

import { useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { deleteHeroBanner } from "@/actions/admin-hero-banners"

type HeroBanner = {
    id: string
    title: string
    subtitle: string | null
    image: string
    mobileImage: string | null
    link: string | null
    buttonText: string | null
    order: number
    isActive: boolean
    createdAt: Date
}

export function HeroBannersTable({ banners }: { banners: HeroBanner[] }) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return

        startTransition(async () => {
            await deleteHeroBanner(id)
        })
    }

    return (
        <div className="rounded-lg border bg-card">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b bg-muted/50">
                        <tr>
                            <th className="p-3 md:p-4 text-left font-medium">Banner</th>
                            <th className="p-3 md:p-4 text-center font-medium">Order</th>
                            <th className="p-3 md:p-4 text-center font-medium">Status</th>
                            <th className="p-3 md:p-4 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {banners.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                    No hero banners found
                                </td>
                            </tr>
                        ) : (
                            banners.map((banner) => (
                                <tr key={banner.id} className="border-b last:border-0">
                                    <td className="p-3 md:p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded bg-muted">
                                                <Image
                                                    src={banner.image}
                                                    alt={banner.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-medium">{banner.title}</div>
                                                {banner.subtitle && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {banner.subtitle}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 md:p-4 text-center">{banner.order}</td>
                                    <td className="p-3 md:p-4 text-center">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${banner.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {banner.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="p-3 md:p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/hero-banners/${banner.id}/edit`}>
                                                <Button variant="outline" size="sm">
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(banner.id, banner.title)}
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
