"use client"

import { useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { deletePromotionalSection } from "@/actions/admin-promotional-sections"

type PromotionalSection = {
    id: string
    title: string
    subtitle: string | null
    description: string | null
    discount: string | null
    image: string | null
    link: string | null
    buttonText: string | null
    order: number
    isActive: boolean
}

export function PromotionalSectionsTable({ sections }: { sections: PromotionalSection[] }) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return

        startTransition(async () => {
            await deletePromotionalSection(id)
        })
    }

    return (
        <div className="rounded-lg border bg-card">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b bg-muted/50">
                        <tr>
                            <th className="p-3 md:p-4 text-left font-medium">Section</th>
                            <th className="p-3 md:p-4 text-center font-medium">Discount</th>
                            <th className="p-3 md:p-4 text-center font-medium">Order</th>
                            <th className="p-3 md:p-4 text-center font-medium">Status</th>
                            <th className="p-3 md:p-4 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sections.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                    No promotional sections found
                                </td>
                            </tr>
                        ) : (
                            sections.map((section) => (
                                <tr key={section.id} className="border-b last:border-0">
                                    <td className="p-3 md:p-4">
                                        <div className="flex items-center gap-3">
                                            {section.image && (
                                                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded bg-muted">
                                                    <Image
                                                        src={section.image}
                                                        alt={section.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium">{section.title}</div>
                                                {section.subtitle && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {section.subtitle}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 md:p-4 text-center">
                                        {section.discount || "-"}
                                    </td>
                                    <td className="p-3 md:p-4 text-center">{section.order}</td>
                                    <td className="p-3 md:p-4 text-center">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${section.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {section.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="p-3 md:p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/promotional-sections/${section.id}/edit`}>
                                                <Button variant="outline" size="sm">
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(section.id, section.title)}
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
