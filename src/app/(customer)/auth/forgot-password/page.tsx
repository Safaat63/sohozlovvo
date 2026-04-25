"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { requestPasswordReset, verifyResetCode, resetPassword } from "@/actions/password-reset"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [step, setStep] = useState<"request" | "verify" | "reset">("request")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [code, setCode] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setMessage("")

        if (!email || !phone) {
            setError("Please enter both email and phone number")
            return
        }

        startTransition(async () => {
            const result = await requestPasswordReset(email, phone)
            if (result.error) {
                setError(result.error)
            } else {
                setMessage(result.message || "")
                setStep("verify")
            }
        })
    }

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!code || code.length !== 6) {
            setError("Please enter the 6-digit code")
            return
        }

        startTransition(async () => {
            const result = await verifyResetCode(email, code)
            if (result.error) {
                setError(result.error)
            } else {
                setStep("reset")
            }
        })
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!newPassword || newPassword.length < 8) {
            setError("Password must be at least 8 characters long")
            return
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        startTransition(async () => {
            const result = await resetPassword(email, code, newPassword)
            if (result.error) {
                setError(result.error)
            } else {
                setMessage(result.message || "Password reset successfully")
                setTimeout(() => {
                    router.push("/auth/login")
                }, 2000)
            }
        })
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/auth/login">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back to Login
                            </Button>
                        </Link>
                    </div>
                    <CardTitle>
                        {step === "request" && "Forgot Password"}
                        {step === "verify" && "Enter Reset Code"}
                        {step === "reset" && "Reset Password"}
                    </CardTitle>
                    <CardDescription>
                        {step === "request" && "Enter your email and phone number to receive a reset code"}
                        {step === "verify" && "Check your email for the 6-digit code"}
                        {step === "reset" && "Enter your new password"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="mb-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded text-green-600 dark:text-green-400 text-sm">
                            {message}
                        </div>
                    )}

                    {step === "request" && (
                        <form onSubmit={handleRequestReset} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                    disabled={isPending}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="01XXXXXXXXX"
                                    required
                                    disabled={isPending}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter the phone number associated with your account
                                </p>
                            </div>

                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? "Sending..." : "Send Reset Code"}
                            </Button>
                        </form>
                    )}

                    {step === "verify" && (
                        <form onSubmit={handleVerifyCode} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Reset Code</Label>
                                <Input
                                    id="code"
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                    disabled={isPending}
                                    className="text-center text-2xl tracking-widest font-mono"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter the 6-digit code sent to {email}
                                </p>
                            </div>

                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? "Verifying..." : "Verify Code"}
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full"
                                onClick={() => setStep("request")}
                                disabled={isPending}
                            >
                                Resend Code
                            </Button>
                        </form>
                    )}

                    {step === "reset" && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={isPending}
                                    minLength={8}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Minimum 8 characters
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={isPending}
                                    minLength={8}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? "Resetting..." : "Reset Password"}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
