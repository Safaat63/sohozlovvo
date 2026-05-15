"use server"

import { auth } from "@/lib/auth"
import cloudinary from "@/lib/cloudinary"
import { redirect } from "next/navigation"

async function checkAdminAccess() {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/")
    }
    return session
}

async function checkUserAccess() {
    const session = await auth()
    if (!session?.user) {
        redirect("/auth/login")
    }
    return session
}

export async function uploadImage(formData: FormData, folder = "e-commerce/products") {
    // Check if user is logged in (allow any authenticated user for profile uploads)
    const session = await auth()
    if (!session?.user) {
        return { error: "Unauthorized" }
    }

    // For non-profile uploads, require admin access
    if (folder !== "e-commerce/profiles" && session.user.role !== "ADMIN") {
        return { error: "Unauthorized" }
    }

    const file = formData.get("file") as File
    if (!file) {
        return { error: "No file provided" }
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
        return { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." }
    }

    // Validate file size (max 8MB to stay under 10MB server action limit)
    const maxSize = 8 * 1024 * 1024
    if (file.size > maxSize) {
        return { error: "File too large. Maximum size is 8MB." }
    }

    try {
        // Convert file to base64
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(base64, {
            folder,
            resource_type: "image",
            transformation: [
                { width: 1200, height: 1200, crop: "limit" },
                { quality: "auto:good" },
                { fetch_format: "auto" },
            ],
        })

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
        }
    } catch (error) {
        console.error("Cloudinary upload error:", error)
        return { error: "Failed to upload image" }
    }
}

export async function deleteImage(publicId: string) {
    await checkAdminAccess()

    try {
        await cloudinary.uploader.destroy(publicId)
        return { success: true }
    } catch (error) {
        console.error("Cloudinary delete error:", error)
        return { error: "Failed to delete image" }
    }
}

export async function uploadMultipleImages(formData: FormData) {
    await checkAdminAccess()

    const files = formData.getAll("files") as File[]
    if (!files.length) {
        return { error: "No files provided" }
    }

    const results: { url: string; publicId: string }[] = []
    const errors: string[] = []

    for (const file of files) {
        const singleFormData = new FormData()
        singleFormData.set("file", file)

        const result = await uploadImage(singleFormData)

        if (result.error) {
            errors.push(`${file.name}: ${result.error}`)
        } else if (result.url && result.publicId) {
            results.push({ url: result.url, publicId: result.publicId })
        }
    }

    return {
        success: results.length > 0,
        images: results,
        errors: errors.length > 0 ? errors : undefined,
    }
}
