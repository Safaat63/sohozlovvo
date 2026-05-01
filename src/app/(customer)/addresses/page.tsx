import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { getUserAddresses, deleteAddress } from "@/actions/addresses"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"

export default async function AddressesPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/auth/login?callbackUrl=/addresses")
    }

    const addresses = await getUserAddresses()

    return (
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
            <div className="flex items-center justify-between mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold">My Addresses</h1>
                <Button asChild size="sm" className="md:hidden">
                    <Link href="/addresses/new">
                        <Plus className="h-4 w-4" />
                    </Link>
                </Button>
                <Button asChild className="hidden md:flex">
                    <Link href="/addresses/new">Add New Address</Link>
                </Button>
            </div>

            {addresses.length === 0 ? (
                <Card>
                    <CardContent className="py-12 md:py-16 text-center">
                        <p className="text-muted-foreground mb-4">No saved addresses yet</p>
                        <Button asChild>
                            <Link href="/addresses/new">Add Your First Address</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {addresses.map((address) => (
                        <Card key={address.id}>
                            <CardHeader className="p-4 md:p-6 pb-2 md:pb-3 flex flex-row items-start justify-between space-y-0">
                                <CardTitle className="text-sm md:text-base flex items-center gap-2 flex-wrap">
                                    <span>📍 Address</span>
                                    {address.isDefault && (
                                        <Badge variant="secondary" className="text-xs">
                                            Default
                                        </Badge>
                                    )}
                                </CardTitle>
                                <div className="flex gap-1 md:gap-2">
                                    <Button variant="ghost" size="sm" asChild className="h-8 px-2 md:px-3">
                                        <Link href={`/addresses/${address.id}`}>Edit</Link>
                                    </Button>
                                    <form action={deleteAddress}>
                                        <input type="hidden" name="addressId" value={address.id} />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive h-8 px-2 md:px-3"
                                            type="submit"
                                        >
                                            Delete
                                        </Button>
                                    </form>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                                <div className="space-y-1 text-xs md:text-sm">
                                    <p className="font-medium">{address.name}</p>
                                    <p className="text-muted-foreground">{address.phone}</p>
                                    <p className="text-muted-foreground">
                                        {address.street}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {address.thana}, {address.city}
                                    </p>
                                    <p className="text-muted-foreground">{address.country}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
