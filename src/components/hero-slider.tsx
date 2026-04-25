"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

type HeroBanner = {
    id: string
    title: string
    subtitle: string | null
    image: string
    mobileImage: string | null
    link: string | null
    buttonText: string | null
}

export function HeroSlider({ banners }: { banners: HeroBanner[] }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    useEffect(() => {
        if (!isAutoPlaying || banners.length <= 1) return

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [isAutoPlaying, banners.length])

    if (banners.length === 0) {
        return null
    }

    const goToPrevious = () => {
        setIsAutoPlaying(false)
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
    }

    const goToNext = () => {
        setIsAutoPlaying(false)
        setCurrentIndex((prev) => (prev + 1) % banners.length)
    }

    const currentBanner = banners[currentIndex]

    return (
        <div className="relative w-full overflow-hidden bg-muted">
            {/* Desktop/Tablet Image */}
            <div className="relative aspect-video md:aspect-21/9 lg:aspect-5/2 hidden sm:block">
                <Image
                    src={currentBanner.image}
                    alt={currentBanner.title}
                    fill
                    priority
                    className="object-cover"
                />
            </div>

            {/* Mobile Image */}
            <div className="relative aspect-4/3 sm:hidden">
                <Image
                    src={currentBanner.mobileImage || currentBanner.image}
                    alt={currentBanner.title}
                    fill
                    priority
                    className="object-cover"
                />
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="container mx-auto px-4 text-center text-white">
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-2 md:mb-4 drop-shadow-lg">
                        {currentBanner.title}
                    </h2>
                    {currentBanner.subtitle && (
                        <p className="text-lg md:text-2xl mb-4 md:mb-6 drop-shadow-lg">
                            {currentBanner.subtitle}
                        </p>
                    )}
                    {currentBanner.link && currentBanner.buttonText && (
                        <Link href={currentBanner.link}>
                            <Button size="lg" className="shadow-lg">
                                {currentBanner.buttonText}
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Navigation Arrows */}
            {banners.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-full p-2 shadow-lg transition-colors"
                        aria-label="Previous banner"
                    >
                        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-full p-2 shadow-lg transition-colors"
                        aria-label="Next banner"
                    >
                        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {banners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setIsAutoPlaying(false)
                                setCurrentIndex(index)
                            }}
                            className={`h-2 rounded-full transition-all ${index === currentIndex
                                ? "w-8 bg-white dark:bg-gray-200"
                                : "w-2 bg-white/50 dark:bg-gray-400/50 hover:bg-white/75 dark:hover:bg-gray-300/75"
                                }`}
                            aria-label={`Go to banner ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
