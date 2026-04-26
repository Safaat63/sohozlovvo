import { notFound } from "next/navigation"
import { getCategories, getProducts } from "@/actions/products"
import { getPublicSettings } from "@/actions/settings"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductCardServer } from "@/components/product/product-card-server"

interface PageProps {
    params: Promise<{ slug: string }>
    searchParams: Promise<{
        page?: string
        sortBy?: "price_asc" | "price_desc" | "rating" | "newest"
        minPrice?: string
        maxPrice?: string
        brand?: string
        rating?: string
        inStock?: string
    }>
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
    const { slug } = await params
    const searchParamsResolved = await searchParams

    // Get all categories to find the current one
    const categories = await getCategories()
    const currentCategory = categories.find(cat => cat.slug === slug)

    if (!currentCategory) {
        notFound()
    }

    // Get products for this category
    const [productResult, settings] = await Promise.all([
        getProducts({
            categorySlug: slug,
            minPrice: searchParamsResolved.minPrice ? parseFloat(searchParamsResolved.minPrice) : undefined,
            maxPrice: searchParamsResolved.maxPrice ? parseFloat(searchParamsResolved.maxPrice) : undefined,
            brand: searchParamsResolved.brand,
            rating: searchParamsResolved.rating ? parseFloat(searchParamsResolved.rating) : undefined,
            inStock: searchParamsResolved.inStock === "true",
            page: searchParamsResolved.page ? parseInt(searchParamsResolved.page) : 1,
            sortBy: searchParamsResolved.sortBy,
        }),
        getPublicSettings(),
    ])

    const { products, pagination } = productResult
    type Product = (typeof products)[number]
    const whatsappNumber = settings.whatsapp_number

    return (
        <main className="min-h-screen">
            <div className="container mx-auto px-4 py-6 md:py-8">
                {/* Breadcrumb */}
                <div className="text-sm text-muted-foreground mb-4">
                    <Link href="/" className="hover:text-foreground">Home</Link>
                    {" > "}
                    <Link href="/categories" className="hover:text-foreground">Categories</Link>
                    {" > "}
                    <span className="text-foreground">{currentCategory.name}</span>
                </div>

                {/* Category Header */}
                <div className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-4xl font-bold mb-2">{currentCategory.name}</h1>
                    {currentCategory.description && (
                        <p className="text-sm md:text-base text-muted-foreground">
                            {currentCategory.description}
                        </p>
                    )}
                </div>

                {/* Filters and Sort */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 md:mb-6">
                    <p className="text-sm text-muted-foreground">
                        {pagination.total} products
                    </p>

                    {/* Sort Options */}
                    <div className="flex flex-wrap gap-1 md:gap-2">
                        <Link href={`/categories/${slug}?sortBy=newest`}>
                            <Button
                                variant={searchParamsResolved.sortBy === "newest" || !searchParamsResolved.sortBy ? "default" : "outline"}
                                size="sm"
                                className="text-xs md:text-sm"
                            >
                                Newest
                            </Button>
                        </Link>
                        <Link href={`/categories/${slug}?sortBy=price_asc`}>
                            <Button
                                variant={searchParamsResolved.sortBy === "price_asc" ? "default" : "outline"}
                                size="sm"
                                className="text-xs md:text-sm"
                            >
                                <span className="hidden sm:inline">Price: </span>Low
                            </Button>
                        </Link>
                        <Link href={`/categories/${slug}?sortBy=price_desc`}>
                            <Button
                                variant={searchParamsResolved.sortBy === "price_desc" ? "default" : "outline"}
                                size="sm"
                                className="text-xs md:text-sm"
                            >
                                <span className="hidden sm:inline">Price: </span>High
                            </Button>
                        </Link>
                        <Link href={`/categories/${slug}?sortBy=rating`} className="hidden sm:inline">
                            <Button
                                variant={searchParamsResolved.sortBy === "rating" ? "default" : "outline"}
                                size="sm"
                            >
                                Rating
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Products Grid */}
                {products.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                            {products.map((product: Product) => (
                                <ProductCardServer
                                    key={product.id}
                                    product={product}
                                    whatsappNumber={whatsappNumber}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center gap-1 md:gap-2 mt-6 md:mt-8 flex-wrap">
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                                    <Link
                                        key={page}
                                        href={`/categories/${slug}?page=${page}${searchParamsResolved.sortBy ? `&sortBy=${searchParamsResolved.sortBy}` : ''}`}
                                    >
                                        <Button
                                            variant={pagination.currentPage === page ? "default" : "outline"}
                                            size="sm"
                                            className="min-w-8 md:min-w-10"
                                        >
                                            {page}
                                        </Button>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-16 md:py-20">
                        <p className="text-muted-foreground text-base md:text-lg mb-4">
                            No products found in this category yet.
                        </p>
                        <Button variant="outline" asChild>
                            <Link href="/products">Browse All Products</Link>
                        </Button>
                    </div>
                )}
            </div>
        </main>
    )
}
