"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useDebouncedCallback } from "use-debounce"

export function SearchBar({ placeholder }: { placeholder: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set("search", term)
        } else {
            params.delete("search")
        }
        router.replace(`?${params.toString()}`)
    }, 300)

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder={placeholder}
                className="pl-10"
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get("search") || ""}
            />
        </div>
    )
}
