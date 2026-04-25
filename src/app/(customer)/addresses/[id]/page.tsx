import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AddressForm } from "../new/address-form"

async function getAddress(addressId: string, userId: string) {
    const address = await prisma.address.findUnique({
        where: { id: addressId },
    })

    if (!address || address.userId !== userId) {
        return null
    }

    return address
}

export default async function EditAddressPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await auth()

    if (!session?.user?.id) {
        redirect("/auth/login")
    }

    const { id } = await params
    const address = await getAddress(id, session.user.id)

    if (!address) {
        notFound()
    }

    return (
        <div className="container max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Edit Address</h1>
            <AddressForm address={address} />
        </div>
    )
}
