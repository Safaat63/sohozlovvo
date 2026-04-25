import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getUserProfile } from "@/actions/user"
import AccountClient from "./client"

export default async function AccountPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/auth/login?callbackUrl=/account")
    }

    const user = await getUserProfile()

    if (!user) {
        redirect("/auth/login")
    }

    return <AccountClient user={user} />
}
