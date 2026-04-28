import Link from "next/link"
import { getProducts, getCategories, getBrands } from "@/actions/products"
import { getPublicSettings } from "@/actions/settings"
import { Filter, ChevronLeft, ChevronRight, Grid3x3, List, RotateCcw, Star } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ProductCardServer } from "@/components/product/product-card-server"
import { SortSelect } from "@/components/sort-select"

interface SearchParams {
    search?: string
    category?: string
    minPrice?: string
    maxPrice?: string
    brand?: string
    rating?: string
    inStock?: string
    hasDiscount?: string
    page?: string
    sortBy?: "price_asc" | "price_desc" | "rating" | "newest"
}

type Category = Awaited<ReturnType<typeof getCategories>>[number]

interface FilterContentProps {
    params: SearchParams
    categories: Category[]
    brands: string[]
    buildQueryString: (newParams: Record<string, string | undefined>) => string
}

function FilterContent({ params, categories, brands, buildQueryString }: FilterContentProps) {
    return (
        <div className="space-y-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-foreground">Filters</h3>
                <Link href="/products" className="text-xs font-medium text-primary hover:text-primary/80 uppercase tracking-wider">
                    Reset
                </Link>
            </div>

            {/* Categories */}
            <div className="py-4 border-b border-border">
                <h4 className="font-semibold text-sm mb-3 text-foreground uppercase tracking-wide">Category</h4>
                <ul className="space-y-2">
                    <li>
                        <Link
                            href="/products"
                            className={`flex items-center gap-3 group cursor-pointer`}
                        >
                            <span className={`text-sm transition-colors ${!params.category ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-primary"}`}>
                                All Categories
                            </span>
                        </Link>
                    </li>
                    {categories.map((category: Category) => (
                        <li key={category.id}>
                            <Link
                                href={`/products?category=${category.slug}`}
                                className="flex items-center gap-3 group cursor-pointer"
                            >
                                <span className={`text-sm transition-colors ${params.category === category.slug ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-primary"}`}>
                                    {category.name}
                                </span>
                                <span className="ml-auto text-xs text-muted-foreground">{category._count?.products || 0}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Brands */}
            {brands.length > 0 && (
                <div className="py-4 border-b border-border">
                    <h4 className="font-semibold text-sm mb-3 text-foreground uppercase tracking-wide">Brand</h4>
                    <ul className="space-y-2">
                        {brands.map((brand: string) => (
                            <li key={brand}>
                                <Link
                                    href={buildQueryString({ brand: params.brand === brand ? undefined : brand })}
                                    className="flex items-center gap-3 group cursor-pointer"
                                >
                                    <div className={`w-4 h-4 rounded border ${params.brand === brand ? "bg-primary border-primary" : "border-border"} flex items-center justify-center`}>
                                        {params.brand === brand && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className={`text-sm transition-colors ${params.brand === brand ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-primary"}`}>
                                        {brand}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Stock Status */}
            <div className="py-4 border-b border-border">
                <h4 className="font-semibold text-sm mb-3 text-foreground uppercase tracking-wide">Availability</h4>
                <Link
                    href={buildQueryString({ inStock: params.inStock === "true" ? undefined : "true" })}
                    className="flex items-center gap-3 group cursor-pointer"
                >
                    <div className={`w-4 h-4 rounded border ${params.inStock === "true" ? "bg-primary border-primary" : "border-border"} flex items-center justify-center`}>
                        {params.inStock === "true" && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>
                    <span className={`text-sm transition-colors ${params.inStock === "true" ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-primary"}`}>
                        In Stock Only
                    </span>
                </Link>
            </div>

            {/* Rating Filter */}
            <div className="py-4">
                <h4 className="font-semibold text-sm mb-3 text-foreground uppercase tracking-wide">Rating</h4>
                <div className="space-y-2">
                    {[4, 3, 2].map((rating) => (
                        <Link
                            key={rating}
                            href={buildQueryString({ rating: params.rating === String(rating) ? undefined : String(rating) })}
                            className="flex items-center gap-3 cursor-pointer"
                        >
                            <div className={`w-4 h-4 rounded-full border ${params.rating === String(rating) ? "border-primary bg-primary" : "border-border"} flex items-center justify-center`}>
                                {params.rating === String(rating) && <div className="w-2 h-2 rounded-full bg-white"></div>}
                            </div>
                            <div className="flex text-yellow-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-current" : "text-gray-300"}`} />
                                ))}
                            </div>
                            <span className="text-xs text-muted-foreground">& Up</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const params = await searchParams
    const [productResult, categories, brands, settings] = await Promise.all([
        getProducts({
            search: params.search,
            categorySlug: params.category,
            minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
            maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
            brand: params.brand,
            rating: params.rating ? parseFloat(params.rating) : undefined,
            inStock: params.inStock === "true",
            hasDiscount: params.hasDiscount === "true",
            page: params.page ? parseInt(params.page) : 1,
            sortBy: params.sortBy,
        }),
        getCategories(),
        getBrands(),
        getPublicSettings(),
    ])

    const { products, pagination } = productResult
    type Product = (typeof products)[number]
    const whatsappNumber = settings.whatsapp_number

    // Build query string helper
    const buildQueryString = (newParams: Record<string, string | undefined>) => {
        const current = new URLSearchParams()
        if (params.search) current.set("search", params.search)
        if (params.category) current.set("category", params.category)
        if (params.brand) current.set("brand", params.brand)
        if (params.inStock) current.set("inStock", params.inStock)
        if (params.sortBy) current.set("sortBy", params.sortBy)

        Object.entries(newParams).forEach(([key, value]) => {
            if (value) current.set(key, value)
            else current.delete(key)
        })

        return current.toString() ? `?${current.toString()}` : "/products"
    }

    return (
        <main className="flex-1 w-full max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-background-light dark:bg-[#1a1d23] min-h-screen">
            {/* Breadcrumbs */}
            <nav className="flex gap-2 mb-6 text-sm">
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
                <span className="text-muted-foreground">/</span>
                <span className="text-foreground font-medium">Products</span>
            </nav>

            {/* Page Heading & Hero */}
            <div className="mb-10 relative overflow-hidden rounded-2xl bg-card shadow-soft p-8 md:p-12 border border-border">
                <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 bg-linear-to-l from-primary to-transparent"></div>
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground mb-4">
                        {params.search ? `Search: "${params.search}"` : params.category ? categories.find(c => c.slug === params.category)?.name || "Products" : "All Products"}
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                        Explore our curated collection of premium products designed for modern living.
                    </p>
                </div>
            </div>

            {/* Two Column Layout: Sidebar & Grid */}
            <div className="flex flex-col lg:flex-row gap-8 relative">
                {/* Filter Sidebar (Sticky on Desktop) */}
                <aside className="w-full lg:w-72 shrink-0">
                    {/* Mobile Filter Button */}
                    <div className="lg:hidden mb-4">
                        <Sheet>
                            <SheetTrigger asChild>
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-card border border-border rounded-xl text-foreground font-medium hover:border-primary transition-colors">
                                    <Filter className="h-4 w-4" />
                                    Filters
                                </button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-full max-w-xs sm:max-w-sm overflow-y-auto p-6 bg-card">
                                <SheetHeader>
                                    <SheetTitle className="sr-only">Filters</SheetTitle>
                                </SheetHeader>
                                <FilterContent
                                    params={params}
                                    categories={categories}
                                    brands={brands}
                                    buildQueryString={buildQueryString}
                                />
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Desktop Sidebar */}
                    <div className="hidden lg:block lg:sticky lg:top-24 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar rounded-xl bg-card p-6 shadow-soft border border-border">
                        <FilterContent
                            params={params}
                            categories={categories}
                            brands={brands}
                            buildQueryString={buildQueryString}
                        />
                    </div>
                </aside>

                {/* Product Grid Area */}
                <div className="flex-1">
                    {/* Sort & Count Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-card p-4 rounded-xl border border-border shadow-sm">
                        <p className="text-muted-foreground text-sm font-medium">
                            Showing <span className="text-foreground font-bold">{products.length}</span> of <span className="text-foreground font-bold">{pagination.total}</span> products
                        </p>
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-muted-foreground whitespace-nowrap" htmlFor="sort">Sort by:</label>
                            <SortSelect defaultValue={params.sortBy || "newest"} />
                            <div className="flex gap-1 ml-2 border-l border-border pl-3">
                                <button className="p-1.5 rounded hover:bg-muted text-primary transition-colors">
                                    <Grid3x3 className="w-5 h-5" />
                                </button>
                                <button className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors">
                                    <List className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    {products.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {products.map((product: Product) => (
                                <ProductCardServer key={product.id} product={product} whatsappNumber={whatsappNumber} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-card rounded-xl border border-border">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-bold text-foreground mb-2">No products found</h3>
                            <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms</p>
                            <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors">
                                <RotateCcw className="w-4 h-4" />
                                Reset Filters
                            </Link>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="mt-12 flex justify-center">
                            <nav className="flex items-center gap-2">
                                <Link
                                    href={pagination.currentPage > 1 ? buildQueryString({ page: String(pagination.currentPage - 1) }) : "#"}
                                    className={`p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors ${pagination.currentPage <= 1 ? "opacity-50 pointer-events-none" : ""}`}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </Link>

                                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                                    let pageNum: number
                                    if (pagination.pages <= 5) {
                                        pageNum = i + 1
                                    } else if (pagination.currentPage <= 3) {
                                        pageNum = i + 1
                                    } else if (pagination.currentPage >= pagination.pages - 2) {
                                        pageNum = pagination.pages - 4 + i
                                    } else {
                                        pageNum = pagination.currentPage - 2 + i
                                    }
                                    return (
                                        <Link
                                            key={pageNum}
                                            href={buildQueryString({ page: String(pageNum) })}
                                            className={`w-10 h-10 rounded-lg font-medium flex items-center justify-center transition-colors ${pagination.currentPage === pageNum
                                                ? "bg-primary text-white font-bold"
                                                : "text-muted-foreground hover:bg-muted"
                                                }`}
                                        >
                                            {pageNum}
                                        </Link>
                                    )
                                })}

                                {pagination.pages > 5 && pagination.currentPage < pagination.pages - 2 && (
                                    <>
                                        <span className="text-muted-foreground px-2">...</span>
                                        <Link
                                            href={buildQueryString({ page: String(pagination.pages) })}
                                            className="w-10 h-10 rounded-lg text-muted-foreground hover:bg-muted font-medium flex items-center justify-center transition-colors"
                                        >
                                            {pagination.pages}
                                        </Link>
                                    </>
                                )}

                                <Link
                                    href={pagination.currentPage < pagination.pages ? buildQueryString({ page: String(pagination.currentPage + 1) }) : "#"}
                                    className={`p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors ${pagination.currentPage >= pagination.pages ? "opacity-50 pointer-events-none" : ""}`}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                            </nav>
                        </div>
                    )}

                    {/* Load More Button */}
                    {pagination.currentPage < pagination.pages && (
                        <div className="mt-8 text-center">
                            <Link
                                href={buildQueryString({ page: String(pagination.currentPage + 1) })}
                                className="inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold py-3 px-10 rounded-lg transition-all duration-300"
                            >
                                Load More Products
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
