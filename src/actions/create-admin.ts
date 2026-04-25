"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function createAdminUser(formData: FormData) {
    try {
        const name = formData.get("name") as string
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        // Validate input
        if (!name || !email || !password) {
            return { error: "Name, email, and password are required" }
        }

        if (password.length < 6) {
            return { error: "Password must be at least 6 characters" }
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return { error: "User with this email already exists" }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create admin user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "ADMIN",
                emailVerified: new Date(), // Auto-verify admin email
            },
        })

        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        }
    } catch (error) {
        console.error("Error creating admin user:", error)
        return { error: "Failed to create admin user" }
    }
}
