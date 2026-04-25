import { Suspense } from "react"
import ComparisonContent from "./comparison-content"

export default function ComparePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Product Comparison</h1>
      <Suspense fallback={<div>Loading comparison...</div>}>
        <ComparisonContent />
      </Suspense>
    </div>
  )
}
