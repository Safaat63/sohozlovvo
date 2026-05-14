"use server"

import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import bcrypt from "bcryptjs"

// Generate a 6-digit code
function generateResetCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function requestPasswordReset(email: string, phone: string) {
    try {
        // Find user by email and phone
        const user = await prisma.user.findFirst({
            where: {
                email: email.toLowerCase(),
                phone: phone,
            },
        })

        if (!user) {
            return { error: "No account found with this email and phone number combination" }
        }

        if (!process.env.RESEND_API_KEY) {
            return { error: "Email service not configured" }
        }

        // Generate reset code
        const resetCode = generateResetCode()
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

        // Store reset code in database
        await prisma.passwordReset.create({
            data: {
                email: user.email,
                code: resetCode,
                expiresAt,
            },
        })

        const resend = new Resend(process.env.RESEND_API_KEY)

        // Send email with reset code
        const { error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
            to: user.email,
            subject: "Password Reset Code",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Password Reset Request</h2>
                    <p>Dear Customer,</p>
                    <p>You requested to reset your password. Use the code below to proceed:</p>
                    <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                        ${resetCode}
                    </div>
                    <p>This code will expire in 15 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <p>Best regards,<br>Sohozlovvo</p>
                </div>
            `,
        })

        if (error) {
            console.error("Resend error:", error)
            return { error: "Failed to send reset code. Please try again." }
        }

        return { success: true, message: "Reset code sent to your email" }
    } catch (error) {
        console.error("Password reset request error:", error)
        return { error: "Something went wrong. Please try again later." }
    }
}

export async function verifyResetCode(email: string, code: string) {
    try {
        const resetRequest = await prisma.passwordReset.findFirst({
            where: {
                email: email.toLowerCase(),
                code,
                used: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        if (!resetRequest) {
            return { error: "Invalid or expired reset code" }
        }

        return { success: true, resetId: resetRequest.id }
    } catch (error) {
        console.error("Verify reset code error:", error)
        return { error: "Something went wrong. Please try again." }
    }
}

export async function resetPassword(email: string, code: string, newPassword: string) {
    try {
        // Verify the code again
        const resetRequest = await prisma.passwordReset.findFirst({
            where: {
                email: email.toLowerCase(),
                code,
                used: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        if (!resetRequest) {
            return { error: "Invalid or expired reset code" }
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Update user password
        await prisma.user.update({
            where: { email: email.toLowerCase() },
            data: { password: hashedPassword },
        })

        // Mark reset code as used
        await prisma.passwordReset.update({
            where: { id: resetRequest.id },
            data: { used: true },
        })

        return { success: true, message: "Password reset successfully" }
    } catch (error) {
        console.error("Reset password error:", error)
        return { error: "Failed to reset password. Please try again." }
    }
}
