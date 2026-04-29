"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { login } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginForm() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const result = await login(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            router.push("/")
            router.refresh()
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                <CardTitle className="text-xl md:text-2xl">Login</CardTitle>
                <CardDescription className="text-sm">Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-4">
                    {error && (
                        <div className="bg-destructive/15 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            disabled={loading}
                        />
                        <div className="text-right">
                            <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Signing in..." : "Sign in"}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/register" className="text-primary hover:underline">
                            Register
                        </Link>
                    </p>
                    <Link href="/" className="text-center text-sm text-primary hover:underline">
                        Continue as guest
                    </Link>
                </CardFooter>
            </form>
        </Card>
    )
}
