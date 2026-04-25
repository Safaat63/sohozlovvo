"use client"

import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, ChevronRight, MoreHorizontal, Grid3X3 } from "lucide-react"

interface Category {
    id: string
    name: string
    slug: string
    children?: Category[]
}

interface DesktopCategoryMenuProps {
    categories: Category[]
}

export function DesktopCategoryMenu({ categories }: DesktopCategoryMenuProps) {
    // Show first 3 categories directly, rest go under "More"
    const visibleCategories = categories.slice(0, 3)
    const moreCategories = categories.slice(3)

    const renderCategoryButton = (category: Category) => {
        const hasChildren = category.children && category.children.length > 0

        if (hasChildren) {
            return (
                <DropdownMenu key={category.id}>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 group">
                            {category.name}
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-transform group-data-[state=open]:rotate-180" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 p-2 shadow-xl border-primary/10">
                        <DropdownMenuItem asChild>
                            <Link href={`/categories/${category.slug}`} className="flex items-center gap-2 font-semibold text-primary cursor-pointer rounded-lg">
                                <Grid3X3 className="h-4 w-4" />
                                View All {category.name}
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-2" />
                        {category.children?.map((subcategory) => (
                            <DropdownMenuItem key={subcategory.id} asChild>
                                <Link href={`/categories/${subcategory.slug}`} className="cursor-pointer rounded-lg">
                                    {subcategory.name}
                                </Link>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }

        return (
            <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200"
            >
                {category.name}
            </Link>
        )
    }

    return (
        <div className="flex items-center gap-1">
            {visibleCategories.map(renderCategoryButton)}

            {/* More categories dropdown */}
            {moreCategories.length > 0 && (
                <>
                    <span className="w-px h-4 bg-primary/20 mx-1" />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 group">
                                <MoreHorizontal className="h-4 w-4" />
                                More
                                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-transform group-data-[state=open]:rotate-180" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-64 p-2 shadow-xl border-primary/10 max-h-[70vh] overflow-y-auto">
                            {moreCategories.map((category) => {
                                const hasChildren = category.children && category.children.length > 0

                                if (hasChildren) {
                                    return (
                                        <DropdownMenuSub key={category.id}>
                                            <DropdownMenuSubTrigger className="cursor-pointer rounded-lg">
                                                <span>{category.name}</span>
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent className="w-56 p-2 shadow-xl border-primary/10">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/categories/${category.slug}`} className="flex items-center gap-2 font-semibold text-primary cursor-pointer rounded-lg">
                                                        <Grid3X3 className="h-4 w-4" />
                                                        View All {category.name}
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="my-2" />
                                                {category.children?.map((subcategory) => (
                                                    <DropdownMenuItem key={subcategory.id} asChild>
                                                        <Link href={`/categories/${subcategory.slug}`} className="cursor-pointer rounded-lg">
                                                            {subcategory.name}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                    )
                                }

                                return (
                                    <DropdownMenuItem key={category.id} asChild>
                                        <Link href={`/categories/${category.slug}`} className="cursor-pointer rounded-lg">
                                            {category.name}
                                        </Link>
                                    </DropdownMenuItem>
                                )
                            })}
                            <DropdownMenuSeparator className="my-2" />
                            <DropdownMenuItem asChild>
                                <Link href="/categories" className="flex items-center gap-2 font-semibold text-primary cursor-pointer rounded-lg">
                                    <Grid3X3 className="h-4 w-4" />
                                    View All Categories
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            )}
        </div>
    )
}
