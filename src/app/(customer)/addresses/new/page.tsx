import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { AddressForm } from "./address-form"

export default async function NewAddressPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/auth/login?callbackUrl=/addresses/new")
    }

    return (
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
            <div className="mb-6 md:mb-8">
                <Link
                    href="/addresses"
                    className="text-sm text-muted-foreground hover:text-foreground"
                >
                    ← Back to Addresses
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold mt-2">Add New Address</h1>
                <p className="text-muted-foreground">
                    Add a new shipping address
                </p>
            </div>

            <AddressForm />
        </div>
    )
}
