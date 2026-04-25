"use server"

import { prisma } from "@/lib/prisma"

export async function getActiveHeroBanners() {
    return prisma.heroBanner.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
    })
}

export async function getActiveTestimonials() {
    return prisma.testimonial.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
    })
}

export async function getActiveSpecialOffers() {
    const now = new Date()
    return prisma.specialOffer.findMany({
        where: {
            isActive: true,
            endDate: { gt: now },
        },
        orderBy: { order: "asc" },
    })
}

export async function getActivePromotionalSections() {
    return prisma.promotionalSection.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
    })
}
