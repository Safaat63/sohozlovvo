"use client"

import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Grid3X3 } from "lucide-react"

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
    const renderCategoryButton = (category: Category) => {
        const hasChildren = category.children && category.children.length > 0

        if (hasChildren) {
            return (
                <DropdownMenu key={category.id}>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-secondary-foreground hover:text-primary rounded-lg transition-all duration-200 group">
                            {category.name}
                            <ChevronDown className="h-3.5 w-3.5 text-secondary-foreground/70 group-hover:text-primary transition-transform group-data-[state=open]:rotate-180" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 p-2 shadow-xl border-border bg-popover text-popover-foreground">
                        <DropdownMenuItem asChild>
                            <Link href={`/categories/${category.slug}`} className="flex items-center gap-2 font-semibold text-primary cursor-pointer rounded-lg">
                                <Grid3X3 className="h-4 w-4" />
                                View All {category.name}
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-2 border-border" />
                        {category.children?.map((subcategory) => (
                            <DropdownMenuItem key={subcategory.id} asChild>
                                <Link href={`/categories/${subcategory.slug}`} className="cursor-pointer rounded-lg text-foreground hover:bg-muted">
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
                className="px-3 py-2 text-sm font-medium text-secondary-foreground hover:text-primary rounded-lg transition-all duration-200"
            >
                {category.name}
            </Link>
        )
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {categories.map(renderCategoryButton)}
        </div>
    )
}