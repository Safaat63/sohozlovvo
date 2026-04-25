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

const categorySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    slug: z.string().min(2, "Slug must be at least 2 characters"),
    description: z.string().optional(),
    image: z.string().optional(),
    parentId: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
    showInMenu: z.boolean().default(true),
})

export async function getAdminCategories(search?: string) {
    await checkAdminAccess()

    const where = search ? {
        OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
        ],
    } : {}

    const categories = await prisma.category.findMany({
        where,
        include: {
            parent: true,
            _count: {
                select: { products: true, children: true },
            },
        },
        orderBy: { name: "asc" },
    })

    return categories
}

export async function getCategory(id: string) {
    await checkAdminAccess()

    return prisma.category.findUnique({
        where: { id },
        include: { parent: true },
    })
}

export async function createCategory(formData: FormData) {
    const session = await checkAdminAccess()

    const parentId = formData.get("parentId") as string
    const data = {
        name: formData.get("name") as string,
        slug: formData.get("slug") as string,
        description: formData.get("description") as string || undefined,
        image: formData.get("image") as string || undefined,
        parentId: parentId && parentId !== "none" ? parentId : null,
        isActive: formData.get("isActive") === "true",
        showInMenu: formData.get("showInMenu") === "true",
    }

    const validated = categorySchema.safeParse(data)
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    try {
        const category = await prisma.category.create({
            data: validated.data,
        })

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "CREATE",
                entity: "Category",
                entityId: category.id,
                changes: JSON.stringify(validated.data),
            },
        })

        revalidatePath("/admin/categories")
        revalidatePath("/products")
        return { success: true, category }
    } catch (error: unknown) {
        if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
            return { error: "A category with this name or slug already exists" }
        }
        return { error: "Failed to create category" }
    }
}

export async function updateCategory(id: string, formData: FormData) {
    const session = await checkAdminAccess()

    const parentId = formData.get("parentId") as string
    const data = {
        name: formData.get("name") as string,
        slug: formData.get("slug") as string,
        description: formData.get("description") as string || undefined,
        image: formData.get("image") as string || undefined,
        parentId: parentId && parentId !== "none" ? parentId : null,
        isActive: formData.get("isActive") === "true",
        showInMenu: formData.get("showInMenu") === "true",
    }

    const validated = categorySchema.safeParse(data)
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    // Prevent circular reference
    if (validated.data.parentId === id) {
        return { error: "Category cannot be its own parent" }
    }

    try {
        const category = await prisma.category.update({
            where: { id },
            data: validated.data,
        })

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "UPDATE",
                entity: "Category",
                entityId: category.id,
                changes: JSON.stringify(validated.data),
            },
        })

        revalidatePath("/admin/categories")
        revalidatePath("/products")
        return { success: true, category }
    } catch (error: unknown) {
        if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
            return { error: "A category with this name or slug already exists" }
        }
        return { error: "Failed to update category" }
    }
}

export async function deleteCategory(id: string) {
    const session = await checkAdminAccess()

    // Check if category has products
    const productCount = await prisma.product.count({ where: { categoryId: id } })
    if (productCount > 0) {
        return { error: `Cannot delete category with ${productCount} products` }
    }

    // Check if category has children
    const childCount = await prisma.category.count({ where: { parentId: id } })
    if (childCount > 0) {
        return { error: `Cannot delete category with ${childCount} subcategories` }
    }

    try {
        const category = await prisma.category.delete({ where: { id } })

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "DELETE",
                entity: "Category",
                entityId: id,
                changes: JSON.stringify({ name: category.name }),
            },
        })

        revalidatePath("/admin/categories")
        revalidatePath("/products")
        return { success: true }
    } catch {
        return { error: "Failed to delete category" }
    }
}

export async function bulkUpdateCategories(
    updates: Record<string, { isActive?: boolean; showInMenu?: boolean }>
) {
    const session = await checkAdminAccess()

    try {
        const updatePromises = Object.entries(updates).map(([id, data]) =>
            prisma.category.update({
                where: { id },
                data,
            })
        )

        await Promise.all(updatePromises)

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "BULK_UPDATE",
                entity: "Category",
                entityId: "bulk",
                changes: JSON.stringify({ count: Object.keys(updates).length, updates }),
            },
        })

        revalidatePath("/admin/categories")
        revalidatePath("/products")
        return { success: true }
    } catch (error) {
        console.error("Bulk update error:", error)
        return { error: "Failed to update categories" }
    }
}
