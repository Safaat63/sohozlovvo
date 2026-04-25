import { notFound } from "next/navigation"
import Link from "next/link"
import { formatDateDhaka } from "@/lib/utils"
import { getCustomer } from "@/actions/admin-customers"
import { Button } from "@/components/ui/button"
import { LoyaltyPointsManager } from "./loyalty-points-manager"

export default async function CustomerDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const customer = await getCustomer(id)

    if (!customer) {
        notFound()
    }

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case "ADMIN":
                return "bg-red-100 text-red-700"
            default:
                return "bg-gray-100 text-gray-700"
        }
    }

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "DELIVERED":
                return "bg-green-100 text-green-700"
            case "CANCELLED":
                return "bg-red-100 text-red-700"
            case "PROCESSING":
            case "SHIPPED":
                return "bg-blue-100 text-blue-700"
            default:
                return "bg-yellow-100 text-yellow-700"
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">
                        {customer.name || "No name"}
                    </h1>
                    <p className="text-muted-foreground">{customer.email}</p>
                </div>
                <Link href="/admin/customers">
                    <Button variant="outline">Back to Customers</Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border bg-card p-4">
                    <div className="text-sm text-muted-foreground">Total Spent</div>
                    <div className="text-2xl font-bold">৳{customer.totalSpent.toLocaleString()}</div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <div className="text-sm text-muted-foreground">Orders</div>
                    <div className="text-2xl font-bold">{customer.orders.length}</div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-muted-foreground">Loyalty Points</div>
                            <div className="text-2xl font-bold">{customer.loyaltyPoints?.points || 0}</div>
                        </div>
                        <LoyaltyPointsManager
                            userId={customer.id}
                            currentPoints={customer.loyaltyPoints?.points || 0}
                        />
                    </div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <div className="text-sm text-muted-foreground">Role</div>
                    <div className="mt-1">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getRoleBadgeClass(customer.role)}`}>
                            {customer.role}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Customer Info */}
                <div className="rounded-lg border bg-card p-6 space-y-4">
                    <h2 className="text-lg font-semibold">Customer Information</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Email</span>
                            <span>{customer.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Phone</span>
                            <span>{customer.phone || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Member Since</span>
                            <span>{formatDateDhaka(customer.createdAt, "MMMM d, yyyy")}</span>
                        </div>
                    </div>

                    {customer.addresses.length > 0 && (
                        <>
                            <h3 className="font-medium pt-4">Addresses</h3>
                            <div className="space-y-3">
                                {customer.addresses.map((address) => (
                                    <div key={address.id} className="text-sm p-3 bg-muted rounded-lg">
                                        <div className="font-medium">{address.name}</div>
                                        <div>{address.street}</div>
                                        <div>{address.city}, {address.state}</div>
                                        <div>{address.phone}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Recent Reviews */}
                <div className="rounded-lg border bg-card p-6 space-y-4">
                    <h2 className="text-lg font-semibold">Recent Reviews</h2>
                    {customer.reviews.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No reviews yet</p>
                    ) : (
                        <div className="space-y-4">
                            {customer.reviews.map((review) => (
                                <div key={review.id} className="border-b pb-4 last:border-0">
                                    <div className="flex items-center justify-between">
                                        <Link
                                            href={`/products/${review.product.slug}`}
                                            className="font-medium hover:underline"
                                        >
                                            {review.product.name}
                                        </Link>
                                        <div className="flex items-center gap-1 text-yellow-500">
                                            {"★".repeat(review.rating)}
                                            {"☆".repeat(5 - review.rating)}
                                        </div>
                                    </div>
                                    {review.title && (
                                        <div className="font-medium text-sm mt-1">{review.title}</div>
                                    )}
                                    {review.comment && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {review.comment}
                                        </p>
                                    )}
                                    <div className="text-xs text-muted-foreground mt-2">
                                        {formatDateDhaka(review.createdAt, "MMM d, yyyy")}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Orders */}
            <div className="rounded-lg border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">Recent Orders</h2>
                {customer.orders.length === 0 ? (
                    <p className="text-muted-foreground">No orders yet</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b">
                                <tr>
                                    <th className="p-3 text-left font-medium">Order #</th>
                                    <th className="p-3 text-left font-medium">Date</th>
                                    <th className="p-3 text-center font-medium">Items</th>
                                    <th className="p-3 text-right font-medium">Total</th>
                                    <th className="p-3 text-center font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customer.orders.map((order) => (
                                    <tr key={order.id} className="border-b last:border-0">
                                        <td className="p-3">
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                className="font-medium text-primary hover:underline"
                                            >
                                                #{order.orderNumber}
                                            </Link>
                                        </td>
                                        <td className="p-3 text-muted-foreground">
                                            {formatDateDhaka(order.createdAt, "MMM d, yyyy")}
                                        </td>
                                        <td className="p-3 text-center">
                                            {order.items.length}
                                        </td>
                                        <td className="p-3 text-right font-medium">
                                            ৳{parseFloat(order.total.toString()).toLocaleString()}
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
