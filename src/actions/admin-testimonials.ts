"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

async function checkAdminAccess() {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/")
    }
    return session
}

const testimonialSchema = z.object({
    name: z.string().optional(),
    image: z.string().optional(),
    review: z.string().optional(),
    rating: z.number().int().min(1).max(5).optional(),
    layout: z.enum(["IMAGE_ONLY", "NAME_AND_REVIEW"]).default("NAME_AND_REVIEW"),
    order: z.number().int().default(0),
    isActive: z.boolean().default(true),
})

export async function getAdminTestimonials(search?: string) {
    await checkAdminAccess()

    const where = search ? {
        OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { review: { contains: search, mode: 'insensitive' as const } },
        ],
    } : {}

    const testimonials = await prisma.testimonial.findMany({
        where,
        orderBy: { order: "asc" },
    })

    return testimonials
}

export async function getTestimonial(id: string) {
    await checkAdminAccess()

    return prisma.testimonial.findUnique({
        where: { id },
    })
}

export async function createTestimonial(data: FormData) {
    await checkAdminAccess()

    const validatedData = testimonialSchema.parse({
        name: data.get("name") || undefined,
        image: data.get("image") || undefined,
        review: data.get("review") || undefined,
        rating: data.get("rating") ? parseInt(data.get("rating") as string) : undefined,
        layout: data.get("layout") as "IMAGE_ONLY" | "NAME_AND_REVIEW",
        order: parseInt(data.get("order") as string) || 0,
        isActive: data.get("isActive") === "true",
    })

    await prisma.testimonial.create({
        data: validatedData,
    })

    revalidatePath("/admin/testimonials")
    redirect("/admin/testimonials")
}

export async function updateTestimonial(id: string, data: FormData) {
    await checkAdminAccess()

    const validatedData = testimonialSchema.parse({
        name: data.get("name") || undefined,
        image: data.get("image") || undefined,
        review: data.get("review") || undefined,
        rating: data.get("rating") ? parseInt(data.get("rating") as string) : undefined,
        layout: data.get("layout") as "IMAGE_ONLY" | "NAME_AND_REVIEW",
        order: parseInt(data.get("order") as string) || 0,
        isActive: data.get("isActive") === "true",
    })

    await prisma.testimonial.update({
        where: { id },
        data: validatedData,
    })

    revalidatePath("/admin/testimonials")
    redirect("/admin/testimonials")
}

export async function deleteTestimonial(id: string) {
    await checkAdminAccess()

    await prisma.testimonial.delete({
        where: { id },
    })

    revalidatePath("/admin/testimonials")
}
