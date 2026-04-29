"use client"

import { useState, useActionState } from "react"
import { updateUserProfile, changePassword } from "@/actions/user"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { SingleImageUpload } from "@/components/ui/single-image-upload"
import { formatDateDhaka } from "@/lib/utils"
import {
    User,
    Lock,
    ShoppingBag,
    MapPin,
    Heart,
    Settings,
    LogOut,
    Award,
    ChevronRight,
    Package,
    Star,
    CreditCard
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

type UserType = {
    id: string
    name: string | null
    email: string
    phone: string | null
    role: string
    image: string | null
    createdAt: Date
    _count: {
        orders: number
        addresses: number
        reviews: number
    }
    loyaltyPoints: {
        points: number
    } | null
    recentOrders?: Array<{
        id: string
        orderNumber: string
        createdAt: Date
        status: string
        total: number
        items: Array<{
            id: string
            product: {
                name: string
                images: string[]
            }
        }>
    }>
    wishlistCount?: number
}

type ActionState = { success?: boolean; error?: string } | null

export default function AccountPage({ user }: { user: UserType }) {
    const [activeSection, setActiveSection] = useState<"overview" | "profile" | "password">("overview")
    const [profileImage, setProfileImage] = useState(user.image || "")

    const [profileState, profileFormAction, isProfilePending] = useActionState<ActionState, FormData>(
        async (_prev: ActionState, formData: FormData) => {
            return await updateUserProfile(formData)
        },
        null
    )

    const [passwordState, passwordFormAction, isPasswordPending] = useActionState<ActionState, FormData>(
        async (_prev: ActionState, formData: FormData) => {
            return await changePassword(formData)
        },
        null
    )

    const navItems = [
        { id: "overview", label: "Overview", icon: User },
        { id: "profile", label: "Edit Profile", icon: Settings },
        { id: "password", label: "Security", icon: Lock },
    ] as const

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "delivered":
                return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            case "processing":
            case "confirmed":
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            case "shipped":
                return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
            case "cancelled":
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
        }
    }

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Breadcrumb */}
            <div className="bg-card border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                            Home
                        </Link>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground font-medium">My Account</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-[280px_1fr] gap-8">
                    {/* Sidebar */}
                    <aside className="lg:sticky lg:top-24 lg:self-start">
                        <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
                            {/* User Profile Brief */}
                            <div className="p-6 border-b border-border bg-linear-to-br from-primary/5 to-transparent">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full bg-muted overflow-hidden ring-4 ring-primary/20">
                                            {user.image ? (
                                                <Image
                                                    src={user.image}
                                                    alt={user.name || "Profile"}
                                                    width={64}
                                                    height={64}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <User className="w-8 h-8 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-card" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="font-bold text-foreground truncate">
                                            {user.name || "User"}
                                        </h2>
                                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                        {(user.loyaltyPoints?.points || 0) >= 1000 && (
                                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
                                                <Award className="h-3 w-3" />
                                                Gold Member
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Navigation */}
                            <nav className="p-3">
                                {navItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveSection(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeSection === item.id
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            }`}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.label}
                                    </button>
                                ))}

                                <div className="my-2 border-t border-border" />

                                <Link
                                    href="/orders"
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                                >
                                    <ShoppingBag className="h-5 w-5" />
                                    My Orders
                                    <ChevronRight className="h-4 w-4 ml-auto" />
                                </Link>

                                <Link
                                    href="/wishlist"
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                                >
                                    <Heart className="h-5 w-5" />
                                    Wishlist
                                    <ChevronRight className="h-4 w-4 ml-auto" />
                                </Link>

                                <Link
                                    href="/addresses"
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                                >
                                    <MapPin className="h-5 w-5" />
                                    Address Book
                                    <ChevronRight className="h-4 w-4 ml-auto" />
                                </Link>

                                <div className="my-2 border-t border-border" />

                                <form action="/api/auth/signout" method="POST">
                                    <button
                                        type="submit"
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        Log Out
                                    </button>
                                </form>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="space-y-6">
                        {/* Overview Section */}
                        {activeSection === "overview" && (
                            <>
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Link href="/orders" className="group">
                                        <div className="bg-card rounded-2xl border border-border p-6 shadow-soft hover:shadow-hover transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                                    <Package className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Total Orders</p>
                                                    <p className="text-2xl font-bold text-foreground">
                                                        {user._count?.orders || 0}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>

                                    <Link href="/wishlist" className="group">
                                        <div className="bg-card rounded-2xl border border-border p-6 shadow-soft hover:shadow-hover transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                                    <Heart className="h-6 w-6 text-red-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Wishlist Items</p>
                                                    <p className="text-2xl font-bold text-foreground">
                                                        {user.wishlistCount || 0}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>

                                    <div className="bg-linear-to-br from-primary to-primary/80 rounded-2xl p-6 shadow-soft text-white">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                                <Award className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-white/80">Loyalty Points</p>
                                                <p className="text-2xl font-bold">
                                                    {(user.loyaltyPoints?.points || 0).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Orders */}
                                <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
                                    <div className="p-6 border-b border-border flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-foreground">Recent Orders</h3>
                                        <Link
                                            href="/orders"
                                            className="text-sm text-primary font-medium hover:underline"
                                        >
                                            View All
                                        </Link>
                                    </div>

                                    <div className="divide-y divide-border">
                                        {user.recentOrders && user.recentOrders.length > 0 ? (
                                            user.recentOrders.slice(0, 3).map((order) => (
                                                <Link
                                                    key={order.id}
                                                    href={`/orders/${order.id}`}
                                                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                                                >
                                                    <div className="flex -space-x-2">
                                                        {order.items.slice(0, 2).map((item, idx) => (
                                                            <div
                                                                key={item.id}
                                                                className="w-12 h-12 rounded-lg border-2 border-card bg-muted overflow-hidden"
                                                                style={{ zIndex: 2 - idx }}
                                                            >
                                                                {item.product.images?.[0] ? (
                                                                    <Image
                                                                        src={item.product.images[0]}
                                                                        alt={item.product.name}
                                                                        width={48}
                                                                        height={48}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <Package className="h-5 w-5 text-muted-foreground" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {order.items.length > 2 && (
                                                            <div className="w-12 h-12 rounded-lg border-2 border-card bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                                                                +{order.items.length - 2}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-foreground">
                                                            Order #{order.orderNumber}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatDateDhaka(order.createdAt, "MMM d, yyyy")}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span
                                                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                                order.status
                                                            )}`}
                                                        >
                                                            {order.status}
                                                        </span>
                                                        <p className="text-sm font-medium text-foreground mt-1">
                                                            ৳{order.total.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center">
                                                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                                <p className="text-muted-foreground">No orders yet</p>
                                                <Link
                                                    href="/products"
                                                    className="inline-block mt-3 text-sm text-primary font-medium hover:underline"
                                                >
                                                    Start Shopping
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Link href="/addresses" className="group">
                                        <div className="bg-card rounded-2xl border border-border p-6 shadow-soft hover:shadow-hover transition-all h-full">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-foreground mb-1">
                                                        Manage Addresses
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {user._count?.addresses || 0} saved addresses
                                                    </p>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </Link>

                                    <div className="bg-linear-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 shadow-soft text-white">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                                <CreditCard className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold mb-1">Redeem Points</h4>
                                                <p className="text-sm text-gray-400">
                                                    Use your {(user.loyaltyPoints?.points || 0).toLocaleString()} points at checkout
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Member Since */}
                                <div className="bg-card rounded-2xl border border-border p-4 shadow-soft">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Star className="h-4 w-4" />
                                            Member since
                                        </div>
                                        <span className="font-medium text-foreground">
                                            {formatDateDhaka(user.createdAt, "MMMM d, yyyy")}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Profile Edit Section */}
                        {activeSection === "profile" && (
                            <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
                                <div className="p-6 border-b border-border">
                                    <h3 className="text-lg font-bold text-foreground">Profile Information</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Update your personal details
                                    </p>
                                </div>
                                <div className="p-6">
                                    <form action={profileFormAction} className="space-y-6">
                                        {profileState?.success && (
                                            <div className="p-4 text-sm bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-xl">
                                                Profile updated successfully!
                                            </div>
                                        )}
                                        {profileState?.error && (
                                            <div className="p-4 text-sm bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl">
                                                {profileState.error}
                                            </div>
                                        )}

                                        <div className="flex flex-col sm:flex-row gap-6">
                                            <div className="shrink-0">
                                                <Label className="text-sm font-medium mb-3 block">
                                                    Profile Photo
                                                </Label>
                                                <SingleImageUpload
                                                    name="image"
                                                    value={profileImage}
                                                    onChange={setProfileImage}
                                                    placeholder="Upload photo"
                                                    previewSize={100}
                                                    isAvatar
                                                    folder="e-commerce/profiles"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Full Name</Label>
                                                    <Input
                                                        id="name"
                                                        name="name"
                                                        type="text"
                                                        defaultValue={user.name || ""}
                                                        required
                                                        className="h-12 rounded-xl"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email Address</Label>
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        defaultValue={user.email || ""}
                                                        disabled
                                                        className="h-12 rounded-xl bg-muted"
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Email cannot be changed
                                                    </p>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="phone">Phone Number</Label>
                                                    <Input
                                                        id="phone"
                                                        name="phone"
                                                        type="tel"
                                                        defaultValue={user.phone || ""}
                                                        placeholder="+880 1234567890"
                                                        className="h-12 rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-border">
                                            <Button
                                                type="submit"
                                                disabled={isProfilePending}
                                                className="h-12 px-8 rounded-xl"
                                            >
                                                {isProfilePending ? "Saving..." : "Save Changes"}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Password Section */}
                        {activeSection === "password" && (
                            <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
                                <div className="p-6 border-b border-border">
                                    <h3 className="text-lg font-bold text-foreground">Security Settings</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Update your password
                                    </p>
                                </div>
                                <div className="p-6">
                                    <form action={passwordFormAction} className="space-y-6 max-w-md">
                                        {passwordState?.success && (
                                            <div className="p-4 text-sm bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-xl">
                                                Password changed successfully!
                                            </div>
                                        )}
                                        {passwordState?.error && (
                                            <div className="p-4 text-sm bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl">
                                                {passwordState.error}
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword">Current Password</Label>
                                            <Input
                                                id="currentPassword"
                                                name="currentPassword"
                                                type="password"
                                                required
                                                className="h-12 rounded-xl"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">New Password</Label>
                                            <Input
                                                id="newPassword"
                                                name="newPassword"
                                                type="password"
                                                required
                                                minLength={6}
                                                className="h-12 rounded-xl"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Must be at least 6 characters
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                            <Input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type="password"
                                                required
                                                className="h-12 rounded-xl"
                                            />
                                        </div>

                                        <div className="pt-4 border-t border-border">
                                            <Button
                                                type="submit"
                                                disabled={isPasswordPending}
                                                className="h-12 px-8 rounded-xl"
                                            >
                                                {isPasswordPending ? "Updating..." : "Update Password"}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}
