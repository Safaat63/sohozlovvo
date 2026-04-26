"use client"

import React, { useState, useRef, useEffect } from "react"
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

    useEffect(() => {
        const handleVariantImageChange = (event: CustomEvent<{ image: string | null }>) => {
            const newImage = event.detail.image
            setVariantImage(newImage)
            if (newImage) setSelectedIndex(0)
        }
        window.addEventListener("variation-image-change", handleVariantImageChange as EventListener)
        return () => {
            window.removeEventListener("variation-image-change", handleVariantImageChange as EventListener)
        }
    }, [])

    const displayImages = React.useMemo(() => {
        if (variantImage && variantImage.trim() !== '') {
            const filteredImages = images.filter(img => img !== variantImage)
            return [variantImage, ...filteredImages]
        }
        return images
    }, [variantImage, images])

    if (displayImages.length === 0) {
        return (
            <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-400 rounded-lg">
                No Image Available
            </div>
        )
    }

    const currentImage = variantImage ? variantImage : displayImages[selectedIndex]

    const handlePrevious = () => setSelectedIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
    const handleNext = () => setSelectedIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imageContainerRef.current) return
        const rect = imageContainerRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setZoomPosition({ x, y })
    }

    return (
        <div className="flex flex-col-reverse md:flex-row gap-4 h-auto md:h-[500px]">
            {/* Thumbnails (Vertical on Desktop, Horizontal on Mobile) */}
            {displayImages.length > 1 && (
                <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:w-20 custom-scrollbar pr-1 pb-1">
                    {displayImages.map((image, index) => (
                        <button
                            key={`${image}-${index}`}
                            onClick={() => {
                                if (variantImage && index === 0) {
                                    setSelectedIndex(0)
                                } else {
                                    setVariantImage(null)
                                    setSelectedIndex(variantImage ? index - 1 : index)
                                }
                            }}
                            className={cn(
                                "flex-shrink-0 w-16 h-16 md:w-[72px] md:h-[72px] bg-white border cursor-pointer relative rounded transition-all",
                                (variantImage === null && selectedIndex === index) || (variantImage && index === 0)
                                    ? "border-[#f48721]"
                                    : "border-[#e0e0e0] hover:border-gray-400"
                            )}
                        >
                            <Image src={image} alt={`thumbnail ${index + 1}`} fill className="object-cover rounded p-1" sizes="80px" />
                        </button>
                    ))}
                </div>
            )}

            {/* Main Image */}
            <div
                ref={imageContainerRef}
                className="flex-1 bg-white border border-[#eaeaea] overflow-hidden relative rounded group cursor-zoom-in min-h-[300px]"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
            >
                <Image
                    src={currentImage}
                    alt={`${productName} - Image ${selectedIndex + 1}`}
                    fill
                    priority
                    className={cn(
                        "object-contain transition-transform duration-200 ease-out p-4",
                        isZoomed && "scale-150"
                    )}
                    style={isZoomed ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : undefined}
                    sizes="(max-width: 768px) 100vw, 50vw"
                />

                <div className={cn(
                    "absolute top-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 transition-opacity",
                    isZoomed ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                    <ZoomIn className="h-3 w-3" />
                    <span className="hidden sm:inline">Hover to zoom</span>
                </div>

                {displayImages.length > 1 && (
                    <>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
                            onClick={(e) => {
                                e.stopPropagation(); setVariantImage(null); handlePrevious();
                            }}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
                            onClick={(e) => {
                                e.stopPropagation(); setVariantImage(null); handleNext();
                            }}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    )
}