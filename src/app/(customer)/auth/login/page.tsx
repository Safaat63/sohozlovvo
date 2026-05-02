import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { LoginForm } from "@/components/auth/login-form"

export default async function LoginPage() {
    const session = await auth()

    // Redirect to homepage if already logged in
    if (session?.user) {
        redirect("/")
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <LoginForm />
        </div>
    )
}
