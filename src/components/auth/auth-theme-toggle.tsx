"use client"

import { ThemeToggle } from "@/components/providers/theme-toggle"

export function AuthThemeToggle() {
    return (
        <div className="absolute right-4 top-4">
            <ThemeToggle />
        </div>
    )
}
