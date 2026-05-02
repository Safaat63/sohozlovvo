"use client"

import Image from "next/image"
import { Play } from "lucide-react"
import { useState } from "react"

interface LandingPageHeroProps {
  title: string
  heroImage: string | null
  heroVideo: string | null
}

export function LandingPageHero({ title, heroImage, heroVideo }: LandingPageHeroProps) {
  const [showVideo, setShowVideo] = useState(false)

  const getYouTubeEmbedUrl = (url: string): string => {
    const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`
    }
    return url
  }

  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 md:mb-6">
              {title}
            </h1>
            <div className="flex flex-wrap gap-4">
              <a
                href="#products"
                className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors text-base md:text-lg"
              >
                Order Now
              </a>
              <a
                href="#description"
                className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-lg border border-gray-300 transition-colors text-base md:text-lg"
              >
                Learn More
              </a>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            {heroVideo && !showVideo ? (
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
                <button
                  onClick={() => setShowVideo(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Play className="w-8 h-8 md:w-10 md:h-10 text-orange-500 ml-1" />
                  </div>
                </button>
              </div>
            ) : showVideo ? (
              <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
                <iframe
                  src={getYouTubeEmbedUrl(heroVideo!)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : heroImage ? (
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={heroImage}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
