"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface ProductJumpLinksProps {
    hasVideo: boolean
    reviewCount: number
}

export function ProductJumpLinks({ hasVideo, reviewCount }: ProductJumpLinksProps) {
    const [activeSection, setActiveSection] = useState("description")

    // Smooth scroll function
    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault()
        const element = document.getElementById(id)
        if (element) {
            // Offset accounts for the sticky nav height so content isn't hidden behind it
            const offset = 80 
            const elementPosition = element.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.pageYOffset - offset
            window.scrollTo({ top: offsetPosition, behavior: "smooth" })
        }
    }

    // Automatically update the active tab as the user scrolls
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id)
                    }
                })
            },
            // Triggers when the section hits the top portion of the screen
            { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
        )

        const sections = ['description', 'video', 'reviews']
            .map(id => document.getElementById(id))
            .filter(Boolean)

        sections.forEach(s => observer.observe(s!))

        return () => sections.forEach(s => observer.unobserve(s!))
    }, [])

    return (
        <div className="flex flex-wrap items-center bg-white border-b border-[#eaeaea] px-6 py-4 gap-2 sticky top-0 z-40 rounded-t-xl shadow-sm">
            <a 
                href="#description" 
                onClick={(e) => scrollToSection(e, 'description')}
                className={cn(
                    "px-6 py-2.5 rounded text-sm font-bold transition-all", 
                    activeSection === "description" ? "bg-[#f48721] text-white" : "bg-[#f5f5f5] text-[#252a34] hover:bg-[#e0e0e0]"
                )}
            >
                Description
            </a>
            {hasVideo && (
                <a 
                    href="#video" 
                    onClick={(e) => scrollToSection(e, 'video')}
                    className={cn(
                        "px-6 py-2.5 rounded text-sm font-bold transition-all", 
                        activeSection === "video" ? "bg-[#f48721] text-white" : "bg-[#f5f5f5] text-[#252a34] hover:bg-[#e0e0e0]"
                    )}
                >
                    Product Video
                </a>
            )}
            <a 
                href="#reviews" 
                onClick={(e) => scrollToSection(e, 'reviews')}
                className={cn(
                    "px-6 py-2.5 rounded text-sm font-bold transition-all", 
                    activeSection === "reviews" ? "bg-[#f48721] text-white" : "bg-[#f5f5f5] text-[#252a34] hover:bg-[#e0e0e0]"
                )}
            >
                Customer Reviews ({reviewCount})
            </a>
        </div>
    )
}