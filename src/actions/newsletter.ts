"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Resend } from "resend"
import { getEmailBranding } from "@/lib/email"
import { revalidatePath } from "next/cache"

const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function subscribeToNewsletter(email: string) {
  try {
    const validated = newsletterSchema.parse({ email })

    const existing = await prisma.newsletter.findUnique({
      where: { email: validated.email },
    })

    if (existing) {
      if (existing.isActive) {
        return { success: false, message: "You are already subscribed!" }
      }
      // Reactivate subscription
      await prisma.newsletter.update({
        where: { email: validated.email },
        data: { isActive: true },
      })
      return { success: true, message: "Welcome back! You've been resubscribed." }
    }

    await prisma.newsletter.create({
      data: {
        email: validated.email,
      },
    })

    return { success: true, message: "Successfully subscribed to newsletter!" }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0]
      return { success: false, message: firstIssue?.message || "Invalid email address" }
    }
    return { success: false, message: "Failed to subscribe. Please try again." }
  }
}

export async function unsubscribeFromNewsletter(email: string) {
  try {
    await prisma.newsletter.update({
      where: { email },
      data: { isActive: false },
    })
    return { success: true, message: "Successfully unsubscribed." }
  } catch {
    return { success: false, message: "Failed to unsubscribe." }
  }
}

async function checkAdminAccess() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }
  return session
}

export async function addNewsletterSubscriber(formData: FormData) {
  await checkAdminAccess()

  const email = formData.get("email") as string

  try {
    const validated = newsletterSchema.parse({ email })

    const existing = await prisma.newsletter.findUnique({
      where: { email: validated.email },
    })

    if (existing) {
      if (existing.isActive) {
        return { error: "Email is already subscribed" }
      }
      await prisma.newsletter.update({
        where: { email: validated.email },
        data: { isActive: true },
      })
      return { success: true, message: "Subscriber reactivated successfully" }
    }

    await prisma.newsletter.create({
      data: { email: validated.email },
    })

    return { success: true, message: "Subscriber added successfully" }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message || "Invalid email" }
    }
    return { error: "Failed to add subscriber" }
  }
}

export async function removeNewsletterSubscriber(email: string) {
  await checkAdminAccess()

  try {
    await prisma.newsletter.delete({
      where: { email },
    })
    revalidatePath("/admin/newsletter")
    return { success: true, message: "Subscriber removed successfully" }
  } catch {
    return { error: "Failed to remove subscriber" }
  }
}

export async function sendBulkNewsletter(formData: FormData) {
  await checkAdminAccess()

  if (!process.env.RESEND_API_KEY) {
    return { error: "Email service not configured" }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const subject = formData.get("subject") as string
  const htmlContent = formData.get("htmlContent") as string

  if (!subject || !htmlContent) {
    return { error: "Subject and content are required" }
  }

  try {
    const branding = await getEmailBranding()
    const activeSubscribers = await prisma.newsletter.findMany({
      where: { isActive: true },
      select: { email: true },
    })

    if (activeSubscribers.length === 0) {
      return { error: "No active subscribers found" }
    }

    // Send emails in batches to avoid rate limits
    const batchSize = 50
    let sentCount = 0
    let failedCount = 0

    for (let i = 0; i < activeSubscribers.length; i += batchSize) {
      const batch = activeSubscribers.slice(i, i + batchSize)

      const promises = batch.map(async (subscriber) => {
        try {
          await resend.emails.send({
            from: branding.from,
            to: subscriber.email,
            subject,
            html: htmlContent,
          })
          sentCount++
        } catch (error) {
          console.error(`Failed to send to ${subscriber.email}:`, error)
          failedCount++
        }
      })

      await Promise.allSettled(promises)

      // Small delay between batches
      if (i + batchSize < activeSubscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return {
      success: true,
      message: `Newsletter sent successfully. Sent: ${sentCount}, Failed: ${failedCount}`,
      stats: { sent: sentCount, failed: failedCount, total: activeSubscribers.length }
    }
  } catch (error) {
    console.error("Bulk newsletter error:", error)
    return { error: "Failed to send newsletter campaign" }
  }
}
