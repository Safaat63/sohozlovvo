"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

// Custom scale/balance icon for comparison
function ScaleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.97z" />
    </svg>
  )
}

export function ComparisonCounter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const updateCount = () => {
      const comparison = localStorage.getItem("productComparison")
      if (comparison) {
        try {
          const products: string[] = JSON.parse(comparison)
          setCount(products.length)
        } catch {
          setCount(0)
        }
      } else {
        setCount(0)
      }
    }

    updateCount()

    // Listen for comparison updates
    window.addEventListener("comparisonUpdated", updateCount)
    window.addEventListener("storage", updateCount)

    return () => {
      window.removeEventListener("comparisonUpdated", updateCount)
      window.removeEventListener("storage", updateCount)
    }
  }, [])

  return (
    <Link href="/compare" className="p-2.5 text-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-200 relative">
      <ScaleIcon className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-primary rounded-full shadow-lg">
          {count}
        </span>
      )}
    </Link>
  )
}
