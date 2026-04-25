import Link from "next/link"
import { auth } from "@/lib/auth"
import { getCart } from "@/actions/cart"
import { getWishlistCount } from "@/actions/wishlist"
import { getCategories } from "@/actions/products"
import { getUserAffiliate } from "@/actions/affiliates"
import { Package, DollarSign } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { SearchBar } from "@/components/search-bar"
import { SideCart } from "@/components/side-cart"
import { ThemeToggle } from "@/components/theme-toggle"
import { ComparisonCounter } from "@/components/comparison-counter"
import { LogoutButton } from "@/components/logout-button"
import { MobileLogoutButton } from "./mobile-logout-button"
import { MobileCategoryMenu } from "./mobile-category-menu"
import { DesktopCategoryMenu } from "./desktop-category-menu"
import { NotificationSubscriptionDialog } from "./notification-subscription-dialog"
import Image from "next/image"

// Custom icon components for a cohesive look
function UserIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
    )
}

function HeartIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
    )
}

function SearchIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    )
}

function MenuIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
    )
}

interface NavbarProps {
    storeName?: string
}

export async function Navbar({ storeName = "LuxeStore" }: NavbarProps) {
    const session = await auth()

    const [cart, wishlistCount, categories, userAffiliate] = await Promise.all([
        getCart(),
        getWishlistCount(),
        getCategories(),
        session?.user ? getUserAffiliate(session.user.id) : Promise.resolve(null),
    ])

    const itemCount =
        (cart?.items ?? []).reduce(
            (sum: number, item: { quantity: number }) => sum + item.quantity,
            0
        )

    // Filter categories for menu (only show those with showInMenu=true)
    const menuCategories = categories.filter(cat => cat.showInMenu !== false)

    // Serialize categories for client components
    const serializedCategories = menuCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        children: cat.children?.filter(child => child.showInMenu !== false).map(child => ({
            id: child.id,
            name: child.name,
            slug: child.slug,
        })) || [],
    }))

    // Serialize cart for client component (updated for combination system)
    const serializedCart = cart ? {
        id: cart.id,
        items: cart.items.map((item) => {
            // Get combination details if exists
            const combination = item.combination
            const combinationLabel = combination?.options
                ?.map(o => `${o.option.variation.variationName}: ${o.option.optionName}`)
                .join(", ") || null

            // Calculate price with discount
            let basePrice = combination?.price
                ? Number(combination.price)
                : Number(item.product.price)

            // Apply product discount if applicable
            const product = item.product
            if (product.discountType && product.discountValue && Number(product.discountValue) > 0) {
                const now = new Date()
                let isDiscountValid = true

                if (product.discountStartDate && now < new Date(product.discountStartDate)) {
                    isDiscountValid = false
                }
                if (product.discountEndDate && now > new Date(product.discountEndDate)) {
                    isDiscountValid = false
                }

                if (isDiscountValid) {
                    if (product.discountType === "PERCENTAGE") {
                        const discount = (basePrice * Number(product.discountValue)) / 100
                        basePrice = basePrice - discount
                    } else if (product.discountType === "FIXED_AMOUNT") {
                        basePrice = basePrice - Number(product.discountValue)
                    }
                    basePrice = Math.max(0, basePrice)
                }
            }

            // Use combination stock if exists
            const itemStock = combination?.stock ?? item.product.stock

            return {
                id: item.id,
                quantity: item.quantity,
                combinationId: item.combinationId ?? null,
                combinationLabel,
                itemPrice: basePrice.toString(),
                itemStock,
                product: {
                    id: item.product.id,
                    name: item.product.name,
                    slug: item.product.slug,
                    price: item.product.price.toString(),
                    images: item.product.images,
                    stock: item.product.stock,
                },
            }
        }),
    } : null

    return (
        <header className="sticky top-0 z-50 w-full">
            {/* Top Bar - Promotional Banner */}
            {/* <div className="bg-linear-to-r from-primary via-primary/90 to-accent text-primary-foreground text-center py-2 px-4 text-sm font-medium">
                <span className="animate-pulse">✨</span> Free Shipping on Orders Over ৳2000 <span className="animate-pulse">✨</span>
            </div> */}

            {/* Main Navbar */}
            <div className="bg-background/98 backdrop-blur-xl border-b-2 border-primary/10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-4">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group shrink-0">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg group-hover:bg-primary/30 transition-all duration-300" />
                                <Image src="/icon0.svg" alt="Logo" width={52} height={52} className="relative w-12 h-12 md:w-13 md:h-13 transition-transform group-hover:scale-110" />
                            </div>
                            <span className="hidden sm:block text-xl md:text-2xl font-bold">
                                {storeName}
                            </span>
                        </Link>

                        {/* Center Search Bar */}
                        <div className="hidden md:flex flex-1 max-w-xl mx-8">
                            <SearchBar />
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-1 sm:gap-2">
                            {/* Mobile Search */}
                            <Sheet>
                                <SheetTrigger asChild className="md:hidden">
                                    <button className="p-2.5 text-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-200">
                                        <SearchIcon className="h-5 w-5" />
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="top" className="h-auto border-none bg-background/95 backdrop-blur-xl">
                                    <div className="pt-12 pb-6 px-4">
                                        <SearchBar isMobile={true} />
                                    </div>
                                </SheetContent>
                            </Sheet>

                            {/* Wishlist */}
                            <Link href="/wishlist" className="p-2.5 text-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-200 relative">
                                <HeartIcon className="h-5 w-5" />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-accent rounded-full shadow-lg">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>

                            {/* Comparison Counter */}
                            <ComparisonCounter />

                            {/* User Menu */}
                            {session?.user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="p-2.5 text-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-200">
                                            <UserIcon className="h-5 w-5" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 mt-2 shadow-xl border-primary/10">
                                        <DropdownMenuLabel className="bg-linear-to-r from-primary/5 to-accent/5 -m-1 mb-1 p-3 rounded-t-lg">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-semibold">{session.user.name}</p>
                                                <p className="text-xs text-muted-foreground">{session.user.email}</p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href="/account" className="cursor-pointer">My Account</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/orders" className="cursor-pointer">Orders</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/wishlist" className="cursor-pointer">Wishlist</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/addresses" className="cursor-pointer">Addresses</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild className="cursor-pointer p-0">
                                            <NotificationSubscriptionDialog userId={session?.user?.id} />
                                        </DropdownMenuItem>
                                        {userAffiliate && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link href="/affiliate" className="text-green-600 dark:text-green-400 cursor-pointer">
                                                        <DollarSign className="h-4 w-4 mr-2" />
                                                        Affiliate Dashboard
                                                    </Link>
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        {session.user.role === "ADMIN" && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link href="/admin" className="cursor-pointer">Admin Dashboard</Link>
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        <DropdownMenuSeparator />
                                        <LogoutButton />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Link href="/auth/login" className="p-2.5 text-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-200">
                                    <UserIcon className="h-5 w-5" />
                                </Link>
                            )}

                            {/* Theme Toggle */}
                            <ThemeToggle />

                            {/* Cart */}
                            <SideCart cart={serializedCart} itemCount={itemCount} />

                            {/* Mobile Menu Button */}
                            <Sheet>
                                <SheetTrigger asChild className="lg:hidden">
                                    <button className="p-2.5 ml-1 text-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-200">
                                        <MenuIcon className="h-5 w-5" />
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-full max-w-sm p-0 flex flex-col bg-linear-to-b from-background to-secondary/30">
                                    <SheetHeader className="p-6 pb-4 bg-linear-to-r from-primary/10 to-accent/10 border-b border-primary/10">
                                        <SheetTitle className="text-left flex items-center gap-3">
                                            <Image src="/icon0.svg" alt="Logo" width={32} height={32} className="w-8 h-8" />
                                            <span className="text-lg font-bold">
                                                {storeName}
                                            </span>
                                        </SheetTitle>
                                    </SheetHeader>
                                    <div className="flex-1 overflow-y-auto p-4">
                                        <nav className="flex flex-col space-y-1">
                                            {/* Quick Links */}
                                            <div className="grid grid-cols-2 gap-2 mb-4">
                                                <Link href="/" className="flex flex-col items-center gap-2 p-4 bg-card hover:bg-primary/10 rounded-xl border border-primary/10 transition-all duration-200 group">
                                                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-xs font-medium">Home</span>
                                                </Link>
                                                <Link href="/products" className="flex flex-col items-center gap-2 p-4 bg-card hover:bg-primary/10 rounded-xl border border-primary/10 transition-all duration-200 group">
                                                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                                        <Package className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <span className="text-xs font-medium">Products</span>
                                                </Link>
                                                <Link href="/products?sortBy=newest" className="flex flex-col items-center gap-2 p-4 bg-card hover:bg-primary/10 rounded-xl border border-primary/10 transition-all duration-200 group">
                                                    <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                                                        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-xs font-medium">New Arrivals</span>
                                                </Link>
                                                <Link href="/products?hasDiscount=true" className="flex flex-col items-center gap-2 p-4 bg-linear-to-br from-accent/20 to-primary/20 hover:from-accent/30 hover:to-primary/30 rounded-xl border border-accent/20 transition-all duration-200 group">
                                                    <div className="p-2 bg-accent/20 rounded-lg">
                                                        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-xs font-bold text-accent">Sale</span>
                                                </Link>
                                            </div>

                                            {/* Categories Section */}
                                            <div className="pt-2 pb-3">
                                                <p className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                                                    Categories
                                                </p>
                                                <div className="bg-card rounded-xl border border-primary/10 overflow-hidden">
                                                    <MobileCategoryMenu categories={serializedCategories} />
                                                </div>
                                            </div>

                                            <Link href="/categories" className="flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-all duration-200">
                                                View All Categories
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>

                                            {/* User Actions */}
                                            {session?.user && (
                                                <div className="pt-4 mt-2 border-t border-primary/10">
                                                    {userAffiliate && (
                                                        <Link href="/affiliate" className="flex items-center gap-3 py-3 px-4 mb-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-500/10 hover:bg-green-500/20 rounded-xl transition-all duration-200">
                                                            <DollarSign className="h-5 w-5" />
                                                            Affiliate Dashboard
                                                        </Link>
                                                    )}
                                                    {session.user.role === "ADMIN" && (
                                                        <Link href="/admin" className="flex items-center gap-3 py-3 px-4 mb-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl transition-all duration-200">
                                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            Admin Dashboard
                                                        </Link>
                                                    )}
                                                    <MobileLogoutButton />
                                                </div>
                                            )}
                                            {!session?.user && (
                                                <div className="pt-4 mt-2 border-t border-primary/10 space-y-2">
                                                    <Link href="/auth/login" className="flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-primary-foreground bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl transition-all duration-200 shadow-lg shadow-primary/20">
                                                        Sign In
                                                    </Link>
                                                    <Link href="/auth/register" className="flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium text-primary bg-transparent border-2 border-primary/30 hover:border-primary hover:bg-primary/10 rounded-xl transition-all duration-200">
                                                        Create Account
                                                    </Link>
                                                </div>
                                            )}

                                            {/* Notification */}
                                            <div className="pt-4 mt-2 border-t border-primary/10">
                                                <div className="px-4 py-2">
                                                    <NotificationSubscriptionDialog userId={session?.user?.id} />
                                                </div>
                                            </div>
                                        </nav>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>

                {/* Desktop Category Navigation Bar */}
                <div className="hidden lg:block border-t border-primary/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <nav className="flex items-center justify-center gap-1 py-2">
                            <Link href="/products?sortBy=newest" className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200">
                                New Arrivals
                            </Link>
                            <span className="w-px h-4 bg-primary/20" />
                            <DesktopCategoryMenu categories={serializedCategories} />
                            <span className="w-px h-4 bg-primary/20" />
                            <Link href="/products" className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200">
                                All Products
                            </Link>
                            <span className="w-px h-4 bg-primary/20" />
                            <Link href="/products?hasDiscount=true" className="px-4 py-2 text-sm font-bold text-accent hover:bg-accent/10 rounded-lg transition-all duration-200 flex items-center gap-1">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                                </span>
                                Sale
                            </Link>
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    )
}
