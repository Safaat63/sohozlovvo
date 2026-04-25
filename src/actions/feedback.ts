"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function submitFeedback(formData: FormData) {
    const name = formData.get("name") as string | null
    const email = formData.get("email") as string | null
    const subject = formData.get("subject") as string | null
    const phone = formData.get('phone') as string | null
    const message = formData.get("message") as string
    const type = formData.get("type") as string

    if (!message || message.trim().length === 0) {
        throw new Error("Message is required")
    }

    try {
        await prisma.feedback.create({
            data: {
                name: name && name.trim().length > 0 ? name.trim() : null,
                email: email && email.trim().length > 0 ? email.trim() : null,
                phone: phone && phone.trim().length > 0 ? name.trim() : null ,
                subject: subject && subject.trim().length > 0 ? subject.trim() : null,
                message: message.trim(),
                type: type || "general",
            },
        })

        revalidatePath("/feedback")
    } catch (error) {
        console.error("Error submitting feedback:", error)
        throw new Error("Failed to submit feedback. Please try again.")
    }

    redirect("/feedback/success")
}
