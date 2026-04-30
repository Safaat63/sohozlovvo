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
    onClose?: () => void 
}

export function SearchBar({ isMobile = false, onClose }: SearchBarProps) {
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
            if (isMobile && onClose) onClose()
        }
    }

    const handleSelect = (slug: string) => {
        router.push(`/products/${slug}`)
        setIsOpen(false)
        setQuery("")
        if (isMobile && onClose) onClose()
    }

    const hasResults =
        results.length > 0 ||
        (suggestions &&
            (suggestions.products.length > 0 ||
                suggestions.categories.length > 0 ||
                suggestions.brands.length > 0))

    return (
        <div className={`relative w-full ${isMobile ? "bg-background" : "max-w-md"}`}>
            <div className={isMobile ? "p-4" : ""}>
                <form onSubmit={handleSubmit} className={isMobile ? "flex w-full" : "relative"}>
                    {!isMobile && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    )}
                    <Input
                        ref={inputRef}
                        type="search"
                        placeholder="Search in..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value)
                            setIsOpen(true)
                        }}
                        onFocus={() => setIsOpen(true)}
                        className={isMobile
                            ? "flex-1 h-11 px-4 text-base rounded-none rounded-l-sm bg-background border border-border border-r-0 placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary focus-visible:outline-none"
                            : "w-full h-11 pl-10 pr-3 rounded-full bg-muted border border-border placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/20"
                        }
                    />
                    {isMobile && (
                        <button
                            type="submit"
                            aria-label="Search"
                            className="h-11 px-5 rounded-none rounded-r-sm bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition-colors border border-primary"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    )}
                </form>

                {isOpen && query.length >= 2 && (
                    <div
                        ref={dropdownRef}
                        className={`absolute left-0 right-0 mt-1 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-auto ${isMobile ? 'mx-4 top-full' : 'top-full'}`}
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
                                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
                                            Products
                                        </div>
                                        {results.map((product) => (
                                            <button
                                                key={product.id}
                                                onClick={() => handleSelect(product.slug)}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-left"
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
                                                    <div className="font-medium truncate text-foreground">
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
                                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
                                            Categories
                                        </div>
                                        {suggestions.categories.map((cat) => (
                                            <Link
                                                key={cat.id}
                                                href={`/products?category=${cat.slug}`}
                                                onClick={() => {
                                                    setIsOpen(false)
                                                    setQuery("")
                                                    if (isMobile && onClose) onClose()
                                                }}
                                                className="block px-3 py-2 rounded-md text-foreground hover:bg-muted"
                                            >
                                                {cat.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {/* Brand Suggestions */}
                                {suggestions?.brands && suggestions.brands.length > 0 && (
                                    <div className="mb-2">
                                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
                                            Brands
                                        </div>
                                        {suggestions.brands.map((brand) => (
                                            <Link
                                                key={brand}
                                                href={`/products?brand=${encodeURIComponent(brand || "")}`}
                                                onClick={() => {
                                                    setIsOpen(false)
                                                    setQuery("")
                                                    if (isMobile && onClose) onClose()
                                                }}
                                                className="block px-3 py-2 rounded-md text-foreground hover:bg-muted"
                                            >
                                                {brand}
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {/* View All Link */}
                                <div className="border-t border-border pt-2 mt-2">
                                    <button
                                        onClick={handleSubmit}
                                        className="w-full px-3 py-2 text-center text-sm text-primary hover:underline"
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
        </div>
    )
}