"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getUserAddresses() {
    const session = await auth()

    if (!session?.user?.id) {
        return []
    }

    const addresses = await prisma.address.findMany({
        where: { userId: session.user.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    })

    return addresses
}

export async function deleteAddress(formData: FormData) {
    const session = await auth()

    if (!session?.user?.id) {
        return
    }

    try {
        const addressId = formData.get("addressId") as string

        // Check if address belongs to user
        const address = await prisma.address.findUnique({
            where: { id: addressId },
        })

        if (!address || address.userId !== session.user.id) {
            return
        }

        await prisma.address.delete({
            where: { id: addressId },
        })

        revalidatePath("/addresses")
    } catch (error) {
        console.error("Error deleting address:", error)
    }
}

export async function createAddress(formData: FormData) {
    const session = await auth()

    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    try {
        const name = formData.get("name") as string
        const phone = formData.get("phone") as string
        const street = formData.get("street") as string
        const city = formData.get("city") as string
        const thana = formData.get("thana") as string
        const country = (formData.get("country") as string) || "Bangladesh"
        const isDefault = formData.get("isDefault") === "on"

        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId: session.user.id, isDefault: true },
                data: { isDefault: false },
            })
        }

        await prisma.address.create({
            data: {
                name,
                phone,
                street,
                city,
                thana,
                country,
                isDefault,
                userId: session.user.id,
            },
        })

        revalidatePath("/addresses")
        return { success: true }
    } catch (error) {
        console.error("Error creating address:", error)
        return { error: "Failed to create address" }
    }
}

export async function updateAddress(addressId: string, formData: FormData) {
    const session = await auth()

    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    try {
        // Check if address belongs to user
        const address = await prisma.address.findUnique({
            where: { id: addressId },
        })

        if (!address || address.userId !== session.user.id) {
            return { error: "Address not found" }
        }

        const name = formData.get("name") as string
        const phone = formData.get("phone") as string
        const street = formData.get("street") as string
        const city = formData.get("city") as string
        const thana = formData.get("thana") as string
        const country = (formData.get("country") as string) || "Bangladesh"
        const isDefault = formData.get("isDefault") === "on"

        // If setting as default, unset other defaults
        if (isDefault && !address.isDefault) {
            await prisma.address.updateMany({
                where: { userId: session.user.id, isDefault: true },
                data: { isDefault: false },
            })
        }

        await prisma.address.update({
            where: { id: addressId },
            data: {
                name,
                phone,
                street,
                city,
                thana,
                country,
                isDefault,
            },
        })

        revalidatePath("/addresses")
        return { success: true }
    } catch (error) {
        console.error("Error updating address:", error)
        return { error: "Failed to update address" }
    }
}
