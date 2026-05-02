"use client"

import Image from "next/image"
import { Play } from "lucide-react"
import { useState } from "react"

interface LandingPageHeroProps {
  title: string
  description: string | null
  heroImage: string | null
  heroVideo: string | null
}

export function LandingPageHero({ title, description, heroImage, heroVideo }: LandingPageHeroProps) {
  const [showVideo, setShowVideo] = useState(false)

  const getYouTubeEmbedUrl = (url: string): string => {
    const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`
    }
    return url
  }

  return (
    <section className="relative overflow-hidden h-96" style={{
      backgroundImage: heroImage ? `url('${heroImage}')` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: heroImage ? undefined : '#10b981'
    }}>
      {heroVideo && !showVideo && (
        <button
          onClick={() => setShowVideo(true)}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
        >
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Play className="w-10 h-10 text-green-600 ml-1" />
          </div>
        </button>
      )}
      
      {showVideo && (
        <div className="absolute inset-0 z-20">
          <iframe
            src={getYouTubeEmbedUrl(heroVideo!)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white drop-shadow-lg">
            {title}
          </h1>
          
          {description && (
            <p className="text-xl md:text-2xl lg:text-3xl mb-8 text-white opacity-90 drop-shadow-md">
              {description.length > 150 ? description.substring(0, 150) + '...' : description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#checkout"
              className="inline-flex items-center justify-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 text-lg shadow-lg"
            >
              এখনই অর্ডার করুন
            </a>
            <a
              href="#products"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/90 hover:bg-white text-green-700 font-semibold rounded-lg transition-all duration-200 text-lg shadow-lg"
            >
              পণ্য দেখুন
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
