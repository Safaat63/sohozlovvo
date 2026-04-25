"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProductImageGalleryProps {
    images: string[]
    productName: string
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [isZoomed, setIsZoomed] = useState(false)
    const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
    const [variantImage, setVariantImage] = useState<string | null>(null)
    const imageContainerRef = useRef<HTMLDivElement>(null)

    // Listen for variant image changes
    useEffect(() => {
        const handleVariantImageChange = (event: CustomEvent<{ image: string | null }>) => {
            const newImage = event.detail.image
            setVariantImage(newImage)

            // If we have a variant image, reset to show it immediately
            if (newImage) {
                setSelectedIndex(0)
            }
        }

        window.addEventListener("variation-image-change", handleVariantImageChange as EventListener)
        return () => {
            window.removeEventListener("variation-image-change", handleVariantImageChange as EventListener)
        }
    }, [])

    // Combine variant image with product images for display
    const displayImages = React.useMemo(() => {
        if (variantImage && variantImage.trim() !== '') {
            // Show variant image first, then other product images (excluding duplicate)
            const filteredImages = images.filter(img => img !== variantImage)
            return [variantImage, ...filteredImages]
        }
        return images
    }, [variantImage, images])

    if (displayImages.length === 0) {
        return (
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 rounded-lg">
                No Image Available
            </div>
        )
    }

    // Reset to first image when variant image changes
    const currentImage = variantImage ? variantImage : displayImages[selectedIndex]

    const handlePrevious = () => {
        setSelectedIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
    }

    const handleNext = () => {
        setSelectedIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imageContainerRef.current) return

        const rect = imageContainerRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setZoomPosition({ x, y })
    }

    const handleMouseEnter = () => {
        setIsZoomed(true)
    }

    const handleMouseLeave = () => {
        setIsZoomed(false)
    }

    return (
        <div className="space-y-3 md:space-y-4">
            {/* Main Image with Zoom */}
            <div
                ref={imageContainerRef}
                className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden relative rounded-lg group cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <Image
                    src={currentImage}
                    alt={`${productName} - Image ${selectedIndex + 1}`}
                    fill
                    priority
                    className={cn(
                        "object-cover transition-transform duration-200 ease-out",
                        isZoomed && "scale-150"
                    )}
                    style={isZoomed ? {
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                    } : undefined}
                    sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* Variant Image Indicator */}
                {variantImage && (
                    <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-full z-10">
                        Variant Image
                    </div>
                )}

                {/* Zoom indicator */}
                <div className={cn(
                    "absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 transition-opacity",
                    isZoomed ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                    <ZoomIn className="h-3 w-3" />
                    <span className="hidden sm:inline">Hover to zoom</span>
                </div>

                {/* Navigation Arrows - Show on hover and always on mobile */}
                {displayImages.length > 1 && (
                    <>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
                            onClick={(e) => {
                                e.stopPropagation()
                                if (variantImage) {
                                    setVariantImage(null)
                                }
                                handlePrevious()
                            }}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
                            onClick={(e) => {
                                e.stopPropagation()
                                if (variantImage) {
                                    setVariantImage(null)
                                }
                                handleNext()
                            }}
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </>
                )}

                {/* Image Counter */}
                {displayImages.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10">
                        {variantImage ? "Variant" : `${selectedIndex + 1} / ${displayImages.length}`}
                    </div>
                )}
            </div>

            {/* Thumbnail Grid */}
            {displayImages.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 gap-2">
                    {displayImages.map((image, index) => (
                        <button
                            key={`${image}-${index}`}
                            onClick={() => {
                                if (variantImage && index === 0) {
                                    // If clicking on variant image, keep it selected
                                    setSelectedIndex(0)
                                } else {
                                    // Reset variant image and select clicked image
                                    setVariantImage(null)
                                    setSelectedIndex(variantImage ? index - 1 : index)
                                }
                            }}
                            className={cn(
                                "aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden cursor-pointer relative rounded-md transition-all",
                                (variantImage === null && selectedIndex === index) || (variantImage && index === 0)
                                    ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900"
                                    : "hover:opacity-75"
                            )}
                        >
                            <Image
                                src={image}
                                alt={`${productName} thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 25vw, 12vw"
                            />
                            {variantImage && index === 0 && (
                                <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-primary-foreground text-[10px] px-1 py-0.5 text-center">
                                    Variant
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
