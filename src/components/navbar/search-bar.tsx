"use client"

import { useState, useEffect, useRef, useTransition, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { searchProducts, getSearchSuggestions } from "@/actions/search"
import { formatCurrency, useCurrencySymbol } from "@/components/providers/currency-provider"

type SearchResult = {
    id: string
    name: string
    slug: string
    price: { toString: () => string }
    images: string[]
    category: { name: string } | null
}

type Suggestions = {
    products: { id: string; name: string; slug: string }[]
    categories: { id: string; name: string; slug: string }[]
    brands: string[]
}

interface SearchBarProps {
    isMobile?: boolean
}

export function SearchBar({ isMobile = false }: SearchBarProps) {
    const router = useRouter()
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [suggestions, setSuggestions] = useState<Suggestions | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const currency = useCurrencySymbol()

    const performSearch = useCallback((searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults([])
            setSuggestions(null)
            return
        }

        startTransition(async () => {
            const [searchResults, searchSuggestions] = await Promise.all([
                searchProducts(searchQuery, 5),
                getSearchSuggestions(searchQuery),
            ])
            setResults(searchResults as SearchResult[])
            setSuggestions(searchSuggestions)
        })
    }, [])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            performSearch(query)
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [query, performSearch])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            router.push(`/products?search=${encodeURIComponent(query.trim())}`)
            setIsOpen(false)
            setQuery("")
        }
    }

    const handleSelect = (slug: string) => {
        router.push(`/products/${slug}`)
        setIsOpen(false)
        setQuery("")
    }

    const hasResults =
        results.length > 0 ||
        (suggestions &&
            (suggestions.products.length > 0 ||
                suggestions.categories.length > 0 ||
                suggestions.brands.length > 0))

    return (
        <div className="relative w-full max-w-md">
            <form onSubmit={handleSubmit} className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <Input
                    ref={inputRef}
                    type="search"
                    placeholder="Search products..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setIsOpen(true)
                    }}
                    onFocus={() => setIsOpen(true)}
                    className={isMobile
                        ? "w-full h-14 pl-12 pr-4 text-base rounded-full bg-gray-100 dark:bg-muted border-0 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-primary/50"
                        : "w-full h-11 pl-10 pr-3 rounded-full bg-gray-100 dark:bg-muted border-0 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-primary/50"
                    }
                />
            </form>

            {isOpen && query.length >= 2 && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-auto"
                >
                    {isPending ? (
                        <div className="p-4 text-center text-muted-foreground">
                            Searching...
                        </div>
                    ) : hasResults ? (
                        <div className="p-2">
                            {/* Product Results */}
                            {results.length > 0 && (
                                <div className="mb-2">
                                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground dark:text-gray-400 uppercase">
                                        Products
                                    </div>
                                    {results.map((product) => (
                                        <button
                                            key={product.id}
                                            onClick={() => handleSelect(product.slug)}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                                        >
                                            {product.images[0] && (
                                                <Image
                                                    src={product.images[0]}
                                                    alt=""
                                                    width={40}
                                                    height={40}
                                                    className="w-10 h-10 object-cover rounded"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">
                                                    {product.name}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {formatCurrency(parseFloat(product.price.toString()), currency)}
                                                    {product.category && (
                                                        <span> • {product.category.name}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Category Suggestions */}
                            {suggestions?.categories && suggestions.categories.length > 0 && (
                                <div className="mb-2">
                                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground dark:text-gray-400 uppercase">
                                        Categories
                                    </div>
                                    {suggestions.categories.map((cat) => (
                                        <Link
                                            key={cat.id}
                                            href={`/products?category=${cat.slug}`}
                                            onClick={() => {
                                                setIsOpen(false)
                                                setQuery("")
                                            }}
                                            className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Brand Suggestions */}
                            {suggestions?.brands && suggestions.brands.length > 0 && (
                                <div className="mb-2">
                                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground dark:text-gray-400 uppercase">
                                        Brands
                                    </div>
                                    {suggestions.brands.map((brand) => (
                                        <Link
                                            key={brand}
                                            href={`/products?brand=${encodeURIComponent(brand || "")}`}
                                            onClick={() => {
                                                setIsOpen(false)
                                                setQuery("")
                                            }}
                                            className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            {brand}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* View All Link */}
                            <div className="border-t dark:border-gray-700 pt-2 mt-2">
                                <button
                                    onClick={handleSubmit}
                                    className="w-full px-3 py-2 text-center text-sm text-primary dark:text-blue-400 hover:underline"
                                >
                                    View all results for &ldquo;{query}&rdquo;
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 text-center text-muted-foreground">
                            No results found for &ldquo;{query}&rdquo;
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
