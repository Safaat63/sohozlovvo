"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AutoHideHeaderProps {
    children: ReactNode
    className?: string
}

export function AutoHideHeader({ children, className }: AutoHideHeaderProps) {
    const [hidden, setHidden] = useState(false)
    const lastScrollY = useRef(0)
    const ticking = useRef(false)

    useEffect(() => {
        lastScrollY.current = window.scrollY

        const onScroll = () => {
            if (ticking.current) return
            ticking.current = true

            window.requestAnimationFrame(() => {
                const currentY = window.scrollY
                const delta = currentY - lastScrollY.current

                if (currentY > 120 && delta > 8) {
                    setHidden(true)
                } else if (delta < -8) {
                    setHidden(false)
                }

                lastScrollY.current = currentY
                ticking.current = false
            })
        }

        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    return (
        <div className="relative z-50">
            <div
                className={cn(
                    "transition-[height] duration-300",
                    hidden ? "h-0" : "h-14 lg:h-20"
                )}
            />
            <div
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 bg-background transition-transform duration-300",
                    hidden ? "-translate-y-full pointer-events-none" : "translate-y-0",
                    className
                )}
            >
                {children}
            </div>
        </div>
    )
}