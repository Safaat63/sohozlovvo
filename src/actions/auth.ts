"use server"

import { signIn } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { AuthError } from "next-auth"

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().optional(),
})

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password is required"),
})

export async function register(formData: FormData) {
    try {
        const data = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            phone: formData.get("phone") as string,
        }

        const validatedFields = registerSchema.safeParse(data)

        if (!validatedFields.success) {
            return {
                error: validatedFields.error.issues[0].message,
            }
        }

        const { name, email, password, phone } = validatedFields.data

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return {
                error: "User with this email already exists",
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
            },
        })

        return {
            success: true,
            message: "Account created successfully",
        }
    } catch (error) {
        console.error("Registration error:", error)
        return {
            error: "Something went wrong. Please try again.",
        }
    }
}

export async function login(formData: FormData) {
    try {
        const data = {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
        }

        const validatedFields = loginSchema.safeParse(data)

        if (!validatedFields.success) {
            return {
                error: validatedFields.error.issues[0].message,
            }
        }

        await signIn("credentials", {
            email: validatedFields.data.email,
            password: validatedFields.data.password,
            redirect: false,
        })

        return {
            success: true,
        }
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid email or password" }
                default:
                    return { error: "Something went wrong" }
            }
        }
        throw error
    }
}
