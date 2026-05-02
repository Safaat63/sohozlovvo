"use client"

import { useState } from "react"
import { Play } from "lucide-react"

interface VideoReview {
  videoUrl: string
  title: string | null
  thumbnail: string | null
}

interface LandingPageVideoReviewsProps {
  videos: VideoReview[]
}

function getYouTubeEmbedUrl(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}?rel=0`
  }
  return url
}

function getYouTubeThumbnail(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)
  if (match) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
  }
  return ""
}

export function LandingPageVideoReviews({ videos }: LandingPageVideoReviewsProps) {
  const [activeVideo, setActiveVideo] = useState<number | null>(null)

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Video Reviews
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            See what our customers have to say
          </p>
        </div>

        {activeVideo !== null ? (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
              <iframe
                src={getYouTubeEmbedUrl(videos[activeVideo].videoUrl)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {videos[activeVideo].title && (
              <p className="text-center mt-3 text-gray-700 font-medium">
                {videos[activeVideo].title}
              </p>
            )}
            <button
              onClick={() => setActiveVideo(null)}
              className="mx-auto mt-4 block text-sm text-orange-500 hover:text-orange-600"
            >
              Back to all videos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, index) => {
              const thumbnail = video.thumbnail || getYouTubeThumbnail(video.videoUrl)
              return (
                <button
                  key={index}
                  onClick={() => setActiveVideo(index)}
                  className="group relative aspect-video rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                >
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={video.title || "Video review"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 text-orange-500 ml-0.5" />
                    </div>
                  </div>
                  {video.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                      <p className="text-white text-sm font-medium truncate">
                        {video.title}
                      </p>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
