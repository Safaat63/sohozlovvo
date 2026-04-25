import Link from "next/link"
import { getCategories } from "@/actions/products"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export default async function CategoriesPage() {
    const categories = await getCategories()

    return (
        <main className="min-h-screen">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-4xl font-bold mb-2">Shop by Category</h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Browse our wide selection of products organized by category
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/products?category=${category.slug}`}
                            className="group"
                        >
                            <Card className="h-full hover:shadow-lg transition-all hover:scale-105">
                                <CardContent className="p-4 md:p-6">
                                    <div className="w-14 h-14 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center overflow-hidden">
                                        {category.image ? (
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                                                {category.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-sm md:text-lg text-center mb-1 md:mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {category.name}
                                    </h3>
                                    {category.description && (
                                        <p className="text-xs md:text-sm text-muted-foreground text-center mb-2 md:mb-3 line-clamp-2 hidden md:block">
                                            {category.description}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-center text-xs md:text-sm text-muted-foreground">
                                        <span>{category._count?.products || 0} products</span>
                                        <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {categories.length === 0 && (
                    <div className="text-center py-16 md:py-20">
                        <p className="text-muted-foreground text-base md:text-lg">No categories available yet.</p>
                    </div>
                )}
            </div>
        </main>
    )
}
