import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { RegisterForm } from "@/components/auth/register-form"

export default async function RegisterPage() {
    const session = await auth()

    if (session?.user) {
        redirect("/")
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-zinc-950">
            <RegisterForm />
        </div>
    )
}
