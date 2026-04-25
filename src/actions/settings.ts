"use server"

import { prisma } from "@/lib/prisma"

// Public function to get settings (no auth required)
export async function getPublicSettings() {
    const settings = await prisma.setting.findMany({
        select: {
            key: true,
            value: true,
        },
    })

    // Convert to key-value object
    const settingsMap: Record<string, string> = {}
    for (const setting of settings) {
        settingsMap[setting.key] = setting.value
    }

    // Return with defaults
    return {
        store_name: settingsMap.store_name || "Sohozlovvo",
        store_email: settingsMap.store_email || "",
        store_phone: settingsMap.store_phone || "",
        store_address: settingsMap.store_address || "",
        currency_symbol: settingsMap.currency_symbol || "৳",
        facebook_url: settingsMap.facebook_url || "",
        instagram_url: settingsMap.instagram_url || "",
        twitter_url: settingsMap.twitter_url || "",
        whatsapp_number: settingsMap.whatsapp_number || "",
        meta_title: settingsMap.meta_title || "Sohozlovvo",
        meta_description: settingsMap.meta_description || "Modern e-commerce platform with lightning-fast delivery and secure payments",
        logo_url: settingsMap.logo_url || "",
        shipping_cost: settingsMap.shipping_cost || "0",
        free_shipping_threshold: settingsMap.free_shipping_threshold || "0",
        tax_rate: settingsMap.tax_rate || "0",
    }
}
