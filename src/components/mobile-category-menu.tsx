"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react"

interface Category {
    id: string
    name: string
    slug: string
    children?: Category[]
}

interface MobileCategoryMenuProps {
    categories: Category[]
}

export function MobileCategoryMenu({ categories }: MobileCategoryMenuProps) {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

    const toggleCategory = (categoryId: string) => {
        const newExpanded = new Set(expandedCategories)
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId)
        } else {
            newExpanded.add(categoryId)
        }
        setExpandedCategories(newExpanded)
    }

    return (
        <div className="flex flex-col divide-y divide-primary/5">
            {categories.map((category) => {
                const hasChildren = category.children && category.children.length > 0
                const isExpanded = expandedCategories.has(category.id)

                if (hasChildren) {
                    return (
                        <div key={category.id} className="overflow-hidden">
                            <button
                                onClick={() => toggleCategory(category.id)}
                                className={`flex items-center justify-between w-full py-3 px-4 text-sm font-medium transition-all duration-200 ${isExpanded
                                        ? 'text-primary bg-primary/5'
                                        : 'text-foreground hover:text-primary hover:bg-primary/5'
                                    }`}
                            >
                                <span className="flex items-center gap-3">
                                    {isExpanded ? (
                                        <FolderOpen className="h-4 w-4 text-primary" />
                                    ) : (
                                        <Folder className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    {category.name}
                                </span>
                                <div className={`p-1 rounded-full transition-all duration-200 ${isExpanded ? 'bg-primary/10 rotate-180' : ''}`}>
                                    <ChevronDown className="h-4 w-4" />
                                </div>
                            </button>

                            <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                } overflow-hidden`}>
                                <div className="bg-linear-to-b from-primary/5 to-transparent pl-6 pr-3 py-2 space-y-1">
                                    <Link
                                        href={`/categories/${category.slug}`}
                                        className="flex items-center gap-2 py-2.5 px-3 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-all duration-200"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        View All {category.name}
                                    </Link>
                                    {category.children?.map((subcategory) => (
                                        <Link
                                            key={subcategory.id}
                                            href={`/categories/${subcategory.slug}`}
                                            className="flex items-center gap-2 py-2.5 px-3 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200"
                                        >
                                            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                            {subcategory.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                }

                return (
                    <Link
                        key={category.id}
                        href={`/categories/${category.slug}`}
                        className="flex items-center justify-between py-3 px-4 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
                    >
                        <span className="flex items-center gap-3">
                            <Folder className="h-4 w-4 text-muted-foreground" />
                            {category.name}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                )
            })}
        </div>
    )
}
