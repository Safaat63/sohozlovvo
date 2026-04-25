"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { sendStockAlertEmail } from "@/lib/email"

const stockAlertSchema = z.object({
  email: z.string().email("Invalid email address"),
  productId: z.string(),
})

export async function createStockAlert(email: string, productId: string) {
  try {
    const validated = stockAlertSchema.parse({ email, productId })

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true, name: true },
    })

    if (!product) {
      return { success: false, message: "Product not found." }
    }

    if (product.stock > 0) {
      return { success: false, message: "Product is currently in stock!" }
    }

    const existing = await prisma.stockAlert.findUnique({
      where: {
        email_productId: {
          email: validated.email,
          productId: validated.productId,
        },
      },
    })

    if (existing) {
      return { success: false, message: "You're already subscribed to this alert!" }
    }

    await prisma.stockAlert.create({
      data: {
        email: validated.email,
        productId: validated.productId,
      },
    })

    return {
      success: true,
      message: "We'll notify you when this product is back in stock!"
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0]
      return { success: false, message: firstIssue?.message || "Invalid input" }
    }
    return { success: false, message: "Failed to create alert. Please try again." }
  }
}

export async function notifyStockAlerts(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true, slug: true, stock: true },
    })

    if (!product || product.stock <= 0) {
      return { success: false, count: 0, message: "Product not available for notification" }
    }

    const alerts = await prisma.stockAlert.findMany({
      where: {
        productId,
        notified: false,
      },
    })

    if (alerts.length === 0) {
      return { success: true, count: 0, message: "No pending alerts" }
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      "http://localhost:3000"

    const productUrl = `${baseUrl}/products/${product.slug}`

    for (const alert of alerts) {
      await sendStockAlertEmail({
        productName: product.name,
        productUrl,
        recipientEmail: alert.email,
      })
    }

    await prisma.stockAlert.updateMany({
      where: {
        productId,
        notified: false,
      },
      data: {
        notified: true,
      },
    })

    return { success: true, count: alerts.length }
  } catch {
    return { success: false, count: 0 }
  }
}

export async function getStockAlertsAdmin({ page = 1, limit = 20 } = {}) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  const [alerts, total] = await Promise.all([
    prisma.stockAlert.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.stockAlert.count(),
  ])

  const productIds = Array.from(new Set(alerts.map((a) => a.productId)))
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, slug: true, stock: true },
  })
  const productMap = new Map(products.map((p) => [p.id, p]))

  return {
    alerts: alerts.map((alert) => ({
      ...alert,
      product: productMap.get(alert.productId),
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

export async function bulkMarkAlertsNotified(ids: string[]) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }
  if (!ids.length) return { error: "No alerts selected" }

  await prisma.stockAlert.updateMany({ where: { id: { in: ids } }, data: { notified: true } })
  return { success: true }
}

export async function bulkDeleteAlerts(ids: string[]) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }
  if (!ids.length) return { error: "No alerts selected" }

  await prisma.stockAlert.deleteMany({ where: { id: { in: ids } } })
  return { success: true }
}
