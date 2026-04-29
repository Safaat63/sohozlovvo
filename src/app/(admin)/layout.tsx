import Link from "next/link"
import * as LucideIcons from "lucide-react"
import { ThemeToggle } from "@/components/providers/theme-toggle"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminMobileMenu } from "@/components/admin/admin-mobile-menu"

export const dynamic = 'force-dynamic'

const navItems = [
    // Overview
    { href: "/admin", label: "Dashboard", icon: "LayoutDashboard", group: "Overview" },
    { href: "/admin/analytics", label: "Sales Analytics", icon: "BarChart3", group: "Overview" },
    { href: "/admin/analytics/views", label: "Visitor Analytics", icon: "Eye", group: "Overview" },

    // Sales & Orders
    { href: "/admin/orders", label: "Orders", icon: "ShoppingCart", group: "Sales" },
    { href: "/admin/steadfast", label: "Steadfast Courier", icon: "Truck", group: "Sales" },
    { href: "/admin/customers", label: "Customers", icon: "Users", group: "Sales" },
    { href: "/admin/affiliates", label: "Affiliates", icon: "UserCheck", group: "Sales" },
    { href: "/admin/affiliate-coupons", label: "Affiliate Coupons", icon: "Ticket", group: "Sales" },

    // Communication
    { href: "/admin/feedback", label: "Customer Feedback", icon: "MessageCircle", group: "Communication" },

    // Catalog
    { href: "/admin/products", label: "Products", icon: "Package", group: "Catalog" },
    { href: "/admin/categories", label: "Categories", icon: "FolderTree", group: "Catalog" },
    { href: "/admin/reviews", label: "Reviews", icon: "Star", group: "Catalog" },

    // Marketing
    { href: "/admin/hero-banners", label: "Hero Banners", icon: "Image", group: "Marketing" },
    { href: "/admin/testimonials", label: "Testimonials", icon: "MessageSquare", group: "Marketing" },
    { href: "/admin/special-offers", label: "Countdown Offers", icon: "Clock", group: "Marketing" },
    { href: "/admin/promotional-sections", label: "Promotions", icon: "Megaphone", group: "Marketing" },
    { href: "/admin/flash-sales", label: "Flash Sales", icon: "Zap", group: "Marketing" },
    { href: "/admin/discounts", label: "Product Discounts", icon: "Percent", group: "Marketing" },
    { href: "/admin/coupons", label: "Coupons", icon: "Tag", group: "Marketing" },
    { href: "/admin/newsletter", label: "Newsletter", icon: "Mail", group: "Marketing" },
    { href: "/admin/push-notifications", label: "Push Notifications", icon: "Bell", group: "Marketing" },
    { href: "/admin/stock-alerts", label: "Stock Alerts", icon: "BellRing", group: "Marketing" },
    // Other
    { href: "/admin/settings", label: "Settings", icon: "Settings", group: "Other" },
]

const NavContent = () => {
    const groups = navItems.reduce((acc, item) => {
        if (!acc[item.group]) acc[item.group] = []
        acc[item.group].push(item)
        return acc
    }, {} as Record<string, typeof navItems>)

    return (
        <nav className="space-y-4">
            {Object.entries(groups).map(([groupName, items]) => (
                <div key={groupName}>
                    <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {groupName}
                    </h3>
                    <div className="space-y-1">
                        {items.map((item) => {
                            const Icon = (LucideIcons as any)[item.icon]
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-md text-sm"
                                >
                                    {Icon && <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            ))}
        </nav>
    )
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {

    const session = await auth()

    if (session.user.role !== "ADMIN") {
        redirect("/")
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-950">
            {/* Admin Header */}
            <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 md:top-0 z-40">
                <div className="max-w-300 mx-auto px-4">
                    <div className="flex items-center justify-between h-12 md:h-14">
                        <div className="flex items-center gap-2">
                            {/* Mobile Menu Toggle */}
                            <AdminMobileMenu navItems={navItems} />
                            <h2 className="font-semibold text-base md:text-lg">Admin Panel</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <Link href="/" className="text-sm text-blue-600 hover:underline">
                                ← Back to Store
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-300 mx-auto px-4 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-8">
                {/* Sidebar - Desktop */}
                <aside className="hidden lg:block lg:col-span-1">
                    <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-4 sticky top-24 rounded-lg">
                        <NavContent />
                    </div>
                </aside>

                {/* Main Content */}
                <main className="lg:col-span-4">
                    <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-4 md:p-6 rounded-lg">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
