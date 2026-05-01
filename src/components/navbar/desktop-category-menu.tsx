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
                        <button className="text-white flex items-center gap-1.5 text-[15px] hover:text-primary transition-colors duration-200 group outline-none bg-transparent">
                            {category.name}
                            <ChevronDown className="h-4 w-4 opacity-90 group-data-[state=open]:rotate-180 transition-transform duration-200" />
                        </button>
                    </DropdownMenuTrigger>
                    {/* Updated dropdown to pure black with neutral borders */}
                    <DropdownMenuContent align="start" className="bg-black w-56 p-2 shadow-xl border-neutral-800 text-white">
                        <DropdownMenuItem asChild className="focus:bg-neutral-900 focus:text-white cursor-pointer rounded-md">
                            <Link href={`/categories/${category.slug}`} className="flex items-center gap-2 font-medium">
                                <Grid3X3 className="h-4 w-4 opacity-80" />
                                View All {category.name}
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-2 border-neutral-800" />
                        {category.children?.map((subcategory) => (
                            <DropdownMenuItem key={subcategory.id} asChild className="focus:bg-neutral-900 focus:text-white cursor-pointer rounded-md">
                                <Link href={`/categories/${subcategory.slug}`}>
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
                className="text-white text-[15px] hover:text-primary transition-colors duration-200"
            >
                {category.name}
            </Link>
        )
    }

    // Changed background to pure black
    return (
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 bg-black py-1 px-6 w-full">
            {categories.map(renderCategoryButton)}
        </div>
    )
}