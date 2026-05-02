"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Lock, Mail, Phone, UserRound } from "lucide-react"
import { register } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function RegisterForm() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const result = await register(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            router.push("/auth/login?registered=true")
        }
    }

    return (
        <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] dark:bg-zinc-900 dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)] md:p-8">
            <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-sm">
                    <UserRound className="size-7" />
                </div>
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Create account</h1>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">Enter your information to get started</p>
                </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50/80 p-4 dark:bg-zinc-800/80 md:p-6">
                <h2 className="text-base font-semibold text-slate-800 dark:text-zinc-200">Register With Details</h2>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {error && (
                        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name" className="sr-only">
                            Full Name
                        </Label>
                        <div className="relative">
                            <UserRound className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-orange-400" />
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Full Name"
                                required
                                disabled={loading}
                                className="h-12 rounded-2xl border-transparent bg-white pl-12 pr-4 text-sm shadow-sm focus-visible:ring-orange-200 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="sr-only">
                            Email
                        </Label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-orange-400" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Email"
                                required
                                disabled={loading}
                                className="h-12 rounded-2xl border-transparent bg-white pl-12 pr-4 text-sm shadow-sm focus-visible:ring-orange-200 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone" className="sr-only">
                            Phone
                        </Label>
                        <div className="relative">
                            <Phone className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-orange-400" />
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="Phone"
                                required
                                disabled={loading}
                                className="h-12 rounded-2xl border-transparent bg-white pl-12 pr-4 text-sm shadow-sm focus-visible:ring-orange-200 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="sr-only">
                            Password
                        </Label>
                        <div className="relative">
                            <Lock className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-orange-400" />
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                required
                                disabled={loading}
                                className="h-12 rounded-2xl border-transparent bg-white pl-12 pr-12 text-sm shadow-sm focus-visible:ring-orange-200 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-400 transition hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="h-12 w-full rounded-2xl bg-orange-500 text-white hover:bg-orange-500/90"
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Create account"}
                    </Button>
                </form>
            </div>

            <p className="mt-6 text-center text-sm text-slate-600 dark:text-zinc-400">
                Already have an account?{" "}
                <Link href="/auth/login" className="font-medium text-orange-500 hover:underline dark:text-orange-400">
                    Sign in
                </Link>
            </p>
        </div>
    )
}
