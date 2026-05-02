"use client"

import { useState } from "react"
import { X } from "lucide-react"
import Image from "next/image"

interface ImageReview {
  imageUrl: string
  caption: string | null
}

interface LandingPageImageGalleryProps {
  images: ImageReview[]
}

export function LandingPageImageGallery({ images }: LandingPageImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Customer Photos
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            Real results from real customers
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 hover:shadow-lg transition-shadow"
            >
              <Image
                src={image.imageUrl}
                alt={image.caption || "Customer photo"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs truncate">{image.caption}</p>
                </div>
              )}
            </button>
          ))}
        </div>

        {selectedImage !== null && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="relative max-w-4xl max-h-[80vh] w-full">
              <Image
                src={images[selectedImage].imageUrl}
                alt={images[selectedImage].caption || "Customer photo"}
                width={1200}
                height={800}
                className="object-contain w-full h-full"
              />
              {images[selectedImage].caption && (
                <p className="text-white text-center mt-4 text-base">
                  {images[selectedImage].caption}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
