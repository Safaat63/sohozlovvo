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

const promotionalSectionSchema = z.object({
    title: z.string().min(1, "Title is required"),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    discount: z.string().optional(),
    image: z.string().optional(),
    link: z.string().optional(),
    buttonText: z.string().optional(),
    order: z.number().int().default(0),
    isActive: z.boolean().default(true),
})

export async function getAdminPromotionalSections(search?: string) {
    await checkAdminAccess()

    const where = search ? {
        OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { subtitle: { contains: search, mode: 'insensitive' as const } },
        ],
    } : {}

    const sections = await prisma.promotionalSection.findMany({
        where,
        orderBy: { order: "asc" },
    })

    return sections
}

export async function getPromotionalSection(id: string) {
    await checkAdminAccess()

    return prisma.promotionalSection.findUnique({
        where: { id },
    })
}

export async function createPromotionalSection(data: FormData) {
    await checkAdminAccess()

    const validatedData = promotionalSectionSchema.parse({
        title: data.get("title"),
        subtitle: data.get("subtitle") || undefined,
        description: data.get("description") || undefined,
        discount: data.get("discount") || undefined,
        image: data.get("image") || undefined,
        link: data.get("link") || undefined,
        buttonText: data.get("buttonText") || undefined,
        order: parseInt(data.get("order") as string) || 0,
        isActive: data.get("isActive") === "true",
    })

    await prisma.promotionalSection.create({
        data: validatedData,
    })

    revalidatePath("/admin/promotional-sections")
    redirect("/admin/promotional-sections")
}

export async function updatePromotionalSection(id: string, data: FormData) {
    await checkAdminAccess()

    const validatedData = promotionalSectionSchema.parse({
        title: data.get("title"),
        subtitle: data.get("subtitle") || undefined,
        description: data.get("description") || undefined,
        discount: data.get("discount") || undefined,
        image: data.get("image") || undefined,
        link: data.get("link") || undefined,
        buttonText: data.get("buttonText") || undefined,
        order: parseInt(data.get("order") as string) || 0,
        isActive: data.get("isActive") === "true",
    })

    await prisma.promotionalSection.update({
        where: { id },
        data: validatedData,
    })

    revalidatePath("/admin/promotional-sections")
    redirect("/admin/promotional-sections")
}

export async function deletePromotionalSection(id: string) {
    await checkAdminAccess()

    await prisma.promotionalSection.delete({
        where: { id },
    })

    revalidatePath("/admin/promotional-sections")
}
