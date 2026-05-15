"use client"

import { useActionState } from "react"
import { createAdminUser } from "@/actions/create-admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type FormState = {
    success?: boolean
    error?: string
    user?: {
        id: string
        name: string
        email: string
        role: string
    }
} | null

export default function CreateAdminPage() {
    const [state, formAction, isPending] = useActionState<FormState, FormData>(
        async (prevState, formData) => {
            const result = await createAdminUser(formData)
            return result
        },
        null
    )

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Create Admin User</CardTitle>
                    <CardDescription>
                        Create an admin account to access the admin panel. Remove this page after setup.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="admin@example.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        {state?.error && (
                            <div className="p-3 rounded-md text-sm bg-red-50 text-red-800 border border-red-200">
                                {state.error}
                            </div>
                        )}

                        {state?.success && (
                            <div className="p-3 rounded-md text-sm bg-green-50 text-green-800 border border-green-200">
                                Admin user created successfully! You can now login.
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? "Creating..." : "Create Admin User"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
