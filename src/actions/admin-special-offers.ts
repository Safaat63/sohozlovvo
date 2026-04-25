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

const specialOfferSchema = z.object({
    title: z.string().min(1, "Title is required"),
    productId: z.string().optional(),
    productLink: z.string().optional(),
    endDate: z.string().min(1, "End date is required"),
    order: z.number().int().default(0),
    isActive: z.boolean().default(true),
})

export async function getAdminSpecialOffers(search?: string) {
    await checkAdminAccess()

    const where = search ? {
        title: { contains: search, mode: 'insensitive' as const },
    } : {}

    const offers = await prisma.specialOffer.findMany({
        where,
        orderBy: { order: "asc" },
    })

    return offers
}

export async function getSpecialOffer(id: string) {
    await checkAdminAccess()

    return prisma.specialOffer.findUnique({
        where: { id },
    })
}

export async function createSpecialOffer(data: FormData) {
    await checkAdminAccess()

    const validatedData = specialOfferSchema.parse({
        title: data.get("title"),
        productId: data.get("productId") || undefined,
        productLink: data.get("productLink") || undefined,
        endDate: data.get("endDate"),
        order: parseInt(data.get("order") as string) || 0,
        isActive: data.get("isActive") === "true",
    })

    await prisma.specialOffer.create({
        data: {
            ...validatedData,
            endDate: new Date(validatedData.endDate),
        },
    })

    revalidatePath("/admin/special-offers")
    redirect("/admin/special-offers")
}

export async function updateSpecialOffer(id: string, data: FormData) {
    await checkAdminAccess()

    const validatedData = specialOfferSchema.parse({
        title: data.get("title"),
        productId: data.get("productId") || undefined,
        productLink: data.get("productLink") || undefined,
        endDate: data.get("endDate"),
        order: parseInt(data.get("order") as string) || 0,
        isActive: data.get("isActive") === "true",
    })

    await prisma.specialOffer.update({
        where: { id },
        data: {
            ...validatedData,
            endDate: new Date(validatedData.endDate),
        },
    })

    revalidatePath("/admin/special-offers")
    redirect("/admin/special-offers")
}

export async function deleteSpecialOffer(id: string) {
    await checkAdminAccess()

    await prisma.specialOffer.delete({
        where: { id },
    })

    revalidatePath("/admin/special-offers")
}
