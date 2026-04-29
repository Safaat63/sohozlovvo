"use client"

import * as React from "react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { setTheme, resolvedTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const isDark = (resolvedTheme || theme) === "dark"

    const toggle = () => {
        setTheme(isDark ? "light" : "dark")
    }

    // Avoid mismatched icon position during hydration
    if (!mounted) {
        return (
            <button
                aria-label="Toggle theme"
                className="relative p-2 rounded-full bg-primary/10 w-9 h-9"
            />
        )
    }

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            className="relative p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-300 group overflow-hidden"
        >
            {/* Sun Icon */}
            <svg
                className={`h-5 w-5 text-amber-600 dark:text-amber-400 transition-all duration-500 ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
                    }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
            {/* Moon Icon */}
            <svg
                className={`absolute inset-0 m-auto h-5 w-5 text-primary transition-all duration-500 ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
                    }`}
                fill="currentColor"
                viewBox="0 0 24 24"
            >
                <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
        </button>
    )
}
