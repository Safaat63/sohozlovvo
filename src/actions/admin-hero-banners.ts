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

const heroBannerSchema = z.object({
    title: z.string().min(1, "Title is required"),
    subtitle: z.string().optional(),
    image: z.string().min(1, "Image is required"),
    mobileImage: z.string().optional(),
    link: z.string().optional(),
    buttonText: z.string().optional(),
    order: z.number().int().default(0),
    isActive: z.boolean().default(true),
})

export async function getAdminHeroBanners(search?: string) {
    await checkAdminAccess()

    const where = search ? {
        OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { subtitle: { contains: search, mode: 'insensitive' as const } },
        ],
    } : {}

    const banners = await prisma.heroBanner.findMany({
        where,
        orderBy: { order: "asc" },
    })

    return banners
}

export async function getHeroBanner(id: string) {
    await checkAdminAccess()

    return prisma.heroBanner.findUnique({
        where: { id },
    })
}

export async function createHeroBanner(data: FormData) {
    await checkAdminAccess()

    const validatedData = heroBannerSchema.parse({
        title: data.get("title"),
        subtitle: data.get("subtitle") || undefined,
        image: data.get("image"),
        mobileImage: data.get("mobileImage") || undefined,
        link: data.get("link") || undefined,
        buttonText: data.get("buttonText") || undefined,
        order: parseInt(data.get("order") as string) || 0,
        isActive: data.get("isActive") === "true",
    })

    await prisma.heroBanner.create({
        data: validatedData,
    })

    revalidatePath("/admin/hero-banners")
    redirect("/admin/hero-banners")
}

export async function updateHeroBanner(id: string, data: FormData) {
    await checkAdminAccess()

    const validatedData = heroBannerSchema.parse({
        title: data.get("title"),
        subtitle: data.get("subtitle") || undefined,
        image: data.get("image"),
        mobileImage: data.get("mobileImage") || undefined,
        link: data.get("link") || undefined,
        buttonText: data.get("buttonText") || undefined,
        order: parseInt(data.get("order") as string) || 0,
        isActive: data.get("isActive") === "true",
    })

    await prisma.heroBanner.update({
        where: { id },
        data: validatedData,
    })

    revalidatePath("/admin/hero-banners")
    redirect("/admin/hero-banners")
}

export async function deleteHeroBanner(id: string) {
    await checkAdminAccess()

    await prisma.heroBanner.delete({
        where: { id },
    })

    revalidatePath("/admin/hero-banners")
}
