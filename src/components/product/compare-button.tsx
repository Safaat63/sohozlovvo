"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { GitCompare } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export function CompareButton({ productId }: { productId: string }) {
  const [isAdded, setIsAdded] = useState(() => {
    if (typeof window === "undefined") return false
    const comparison = window.localStorage.getItem("productComparison")
    if (!comparison) return false
    try {
      const products: string[] = JSON.parse(comparison)
      return products.includes(productId)
    } catch {
      window.localStorage.removeItem("productComparison")
      return false
    }
  })
  const [count, setCount] = useState(() => {
    if (typeof window === "undefined") return 0
    const comparison = window.localStorage.getItem("productComparison")
    if (!comparison) return 0
    try {
      const products: string[] = JSON.parse(comparison)
      return products.length
    } catch {
      window.localStorage.removeItem("productComparison")
      return 0
    }
  })

  const toggleCompare = () => {
    const comparison = localStorage.getItem("productComparison")
    let products: string[] = []

    if (comparison) {
      try {
        products = JSON.parse(comparison)
      } catch {
        products = []
      }
    }

    if (products.includes(productId)) {
      products = products.filter((id) => id !== productId)
      setIsAdded(false)
      toast.success("Removed from comparison", { duration: 1500 })
    } else {
      if (products.length >= 4) {
        toast.error("You can compare up to 4 products at a time")
        return
      }
      products.push(productId)
      setIsAdded(true)
      toast.success("Added to comparison", { duration: 1500 })
    }

    setCount(products.length)
    localStorage.setItem("productComparison", JSON.stringify(products))

    // Dispatch event for other components
    window.dispatchEvent(new Event("comparisonUpdated"))
  }

  return (
    <div className="flex gap-2">
      <Button
        variant={isAdded ? "default" : "outline"}
        size="sm"
        onClick={toggleCompare}
        className="flex-1"
      >
        <GitCompare className="h-4 w-4 mr-2" />
        {isAdded ? "Added to Compare" : "Compare"}
      </Button>
      {count > 0 && (
        <Button variant="secondary" size="sm" asChild>
          <Link href="/compare">
            View ({count})
          </Link>
        </Button>
      )}
    </div>
  )
}
