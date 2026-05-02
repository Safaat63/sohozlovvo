"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface Category {
    id: string
    name: string
    slug: string
    children?: Category[]
}

interface MobileCategoryMenuProps {
    categories: Category[]
    onLinkClick?: () => void
}

export function MobileCategoryMenu({ categories, onLinkClick }: MobileCategoryMenuProps) {
    return (
        <div className="flex flex-col">
            {categories.map((category) => {
                const hasChildren = category.children && category.children.length > 0
                return (
                    <Link
                        key={category.id}
                        href={`/categories/${category.slug}`}
                        onClick={onLinkClick}
                        className="flex items-center justify-between py-3 px-4 text-sm font-medium text-foreground border-b border-border last:border-b-0"
                    >
                        <span>{category.name}</span>
                        {hasChildren ? (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        ) : null}
                    </Link>
                )
            })}
        </div>
    )
}