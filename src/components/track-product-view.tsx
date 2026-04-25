"use client"

import { useEffect } from "react"

export function TrackProductView({ productId }: { productId: string }) {
  useEffect(() => {
    const recentlyViewed = localStorage.getItem("recentlyViewed")
    let viewed: { id: string; timestamp: number }[] = []

    if (recentlyViewed) {
      try {
        viewed = JSON.parse(recentlyViewed)
      } catch {
        viewed = []
      }
    }

    // Remove if already exists
    viewed = viewed.filter((item) => item.id !== productId)

    // Add to beginning
    viewed.unshift({ id: productId, timestamp: Date.now() })

    // Keep only last 20
    viewed = viewed.slice(0, 20)

    localStorage.setItem("recentlyViewed", JSON.stringify(viewed))
  }, [productId])

  return null
}
