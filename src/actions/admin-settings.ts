"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function checkAdminAccess() {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/")
    }
    return session
}

export async function getSettings() {
    await checkAdminAccess()

    const settings = await prisma.setting.findMany({
        orderBy: { key: "asc" },
    })

    // Convert to key-value object
    const settingsMap: Record<string, string> = {}
    for (const setting of settings) {
        settingsMap[setting.key] = setting.value
    }

    return settingsMap
}

export async function updateSettings(formData: FormData) {
    await checkAdminAccess()

    try {
        const settingsToUpdate = [
            { key: "store_name", value: formData.get("store_name") as string || "Sohozlovvo" },
            { key: "store_email", value: formData.get("store_email") as string || "" },
            { key: "store_phone", value: formData.get("store_phone") as string || "" },
            { key: "store_address", value: formData.get("store_address") as string || "" },
            { key: "currency_symbol", value: formData.get("currency_symbol") as string || "৳" },
            { key: "tax_rate", value: formData.get("tax_rate") as string || "0" },
            { key: "shipping_cost", value: formData.get("shipping_cost") as string || "0" },
            { key: "free_shipping_threshold", value: formData.get("free_shipping_threshold") as string || "0" },
            { key: "order_prefix", value: formData.get("order_prefix") as string || "ORD" },
            { key: "meta_title", value: formData.get("meta_title") as string || "" },
            { key: "meta_description", value: formData.get("meta_description") as string || "" },
            { key: "facebook_url", value: formData.get("facebook_url") as string || "" },
            { key: "instagram_url", value: formData.get("instagram_url") as string || "" },
            { key: "twitter_url", value: formData.get("twitter_url") as string || "" },
            { key: "whatsapp_number", value: formData.get("whatsapp_number") as string || "" },
            { key: "logo_url", value: formData.get("logo_url") as string || "" },
        ]

        for (const setting of settingsToUpdate) {
            await prisma.setting.upsert({
                where: { key: setting.key },
                update: { value: setting.value },
                create: { key: setting.key, value: setting.value },
            })
        }

        // Revalidate both admin settings page and root layout to update navbar/footer
        revalidatePath("/admin/settings")
        revalidatePath("/", "layout")
        return { success: true }
    } catch (error) {
        console.error("Error updating settings:", error)
        return { error: "Failed to update settings" }
    }
}
