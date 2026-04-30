"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => setMounted(true), [])

    if (!mounted) return <div className="w-10 h-10" />

    const isDark = resolvedTheme === "dark"

    return (
        <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl 
                       /* Light Mode Styles */
                       bg-white border-zinc-200 shadow-sm
                       /* Dark Mode Styles - The Fix */
                       dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-[0_0_20px_-5px_rgba(0,0,0,0.3)]
                       /* Common Styles */
                       border transition-all duration-300 active:scale-90 overflow-hidden"
            aria-label="Toggle theme"
        >
            {/* 1. Dynamic Background Glow */}
            <div className={`absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100
                ${isDark 
                    ? "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" 
                    : "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent"
                }`} 
            />

            {/* 2. The Sliding Track */}
            <div className="relative h-5 w-5 overflow-hidden">
                <div 
                    className={`flex flex-col items-center transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                        isDark ? "-translate-y-[28px]" : "translate-y-0"
                    }`}
                >
                    {/* Sun Icon */}
                    <Sun className="h-5 w-5 shrink-0 text-zinc-600 transition-all duration-300 group-hover:text-amber-500 group-hover:rotate-12" />
                    
                    {/* Spacer - specific height to align Moon perfectly */}
                    <div className="h-[8px] shrink-0" />

                    {/* Moon Icon */}
                    <Moon className="h-5 w-5 shrink-0 text-zinc-400 transition-all duration-300 group-hover:text-blue-400 group-hover:-rotate-12" />
                </div>
            </div>

            {/* 3. High-End Highlight (The "Glass" effect) */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent dark:via-zinc-700" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-zinc-100 to-transparent dark:via-zinc-800" />
        </button>
    )
}