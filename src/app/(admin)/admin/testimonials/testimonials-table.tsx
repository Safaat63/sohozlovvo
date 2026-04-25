"use client"

import { useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { deleteTestimonial } from "@/actions/admin-testimonials"

type Testimonial = {
    id: string
    name: string | null
    image: string | null
    review: string | null
    rating: number | null
    layout: "IMAGE_ONLY" | "NAME_AND_REVIEW"
    order: number
    isActive: boolean
}

export function TestimonialsTable({ testimonials }: { testimonials: Testimonial[] }) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = async (id: string, name: string) => {
        const label = name || "this testimonial"
        if (!confirm(`Are you sure you want to delete "${label}"?`)) return

        startTransition(async () => {
            await deleteTestimonial(id)
        })
    }

    return (
        <div className="rounded-lg border bg-card">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b bg-muted/50">
                        <tr>
                            <th className="p-3 md:p-4 text-left font-medium">Testimonial</th>
                            <th className="p-3 md:p-4 text-center font-medium">Layout</th>
                            <th className="p-3 md:p-4 text-center font-medium">Order</th>
                            <th className="p-3 md:p-4 text-center font-medium">Status</th>
                            <th className="p-3 md:p-4 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {testimonials.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                    No testimonials found
                                </td>
                            </tr>
                        ) : (
                            testimonials.map((testimonial) => (
                                <tr key={testimonial.id} className="border-b last:border-0">
                                    <td className="p-3 md:p-4">
                                        <div className="flex items-center gap-3">
                                            {testimonial.image && (
                                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                                                    <Image
                                                        src={testimonial.image}
                                                        alt={testimonial.name || "Customer"}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium">
                                                    {testimonial.name || "Anonymous"}
                                                </div>
                                                {testimonial.review && (
                                                    <div className="text-sm text-muted-foreground line-clamp-2">
                                                        {testimonial.review}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 md:p-4 text-center">
                                        <span className="text-sm">
                                            {testimonial.layout === "IMAGE_ONLY" ? "Image Only" : "Name & Review"}
                                        </span>
                                    </td>
                                    <td className="p-3 md:p-4 text-center">{testimonial.order}</td>
                                    <td className="p-3 md:p-4 text-center">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${testimonial.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {testimonial.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="p-3 md:p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/testimonials/${testimonial.id}/edit`}>
                                                <Button variant="outline" size="sm">
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(testimonial.id, testimonial.name || "this testimonial")}
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
