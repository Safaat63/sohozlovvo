"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface FilterOptions {
  brands: string[]
  minPrice: number
  maxPrice: number
}

interface ProductFiltersProps {
  options: FilterOptions
  onFilterChange: (filters: {
    brands: string[]
    priceRange: [number, number]
    minRating: number
    inStockOnly: boolean
  }) => void
}

export function ProductFilters({ options, onFilterChange }: ProductFiltersProps) {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([
    options.minPrice,
    options.maxPrice,
  ])
  const [minRating, setMinRating] = useState(0)
  const [inStockOnly, setInStockOnly] = useState(false)

  useEffect(() => {
    onFilterChange({
      brands: selectedBrands,
      priceRange,
      minRating,
      inStockOnly,
    })
  }, [selectedBrands, priceRange, minRating, inStockOnly, onFilterChange])

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    )
  }

  const clearFilters = () => {
    setSelectedBrands([])
    setPriceRange([options.minPrice, options.maxPrice])
    setMinRating(0)
    setInStockOnly(false)
  }

  const hasActiveFilters =
    selectedBrands.length > 0 ||
    priceRange[0] !== options.minPrice ||
    priceRange[1] !== options.maxPrice ||
    minRating > 0 ||
    inStockOnly

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold dark:text-white">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        )}
      </div>

      <Accordion type="multiple" defaultValue={["price", "brands", "rating", "stock"]} className="w-full">
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                min={options.minPrice}
                max={options.maxPrice}
                step={10}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>৳{priceRange[0]}</span>
                <span>৳{priceRange[1]}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {options.brands.length > 0 && (
          <AccordionItem value="brands">
            <AccordionTrigger>Brands</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {options.brands.map((brand) => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand}`}
                      checked={selectedBrands.includes(brand)}
                      onCheckedChange={() => handleBrandToggle(brand)}
                    />
                    <Label
                      htmlFor={`brand-${brand}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {brand}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="rating">
          <AccordionTrigger>Minimum Rating</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rating-${rating}`}
                    checked={minRating === rating}
                    onCheckedChange={() => setMinRating(minRating === rating ? 0 : rating)}
                  />
                  <Label
                    htmlFor={`rating-${rating}`}
                    className="text-sm font-normal cursor-pointer flex items-center"
                  >
                    {rating}+ ⭐
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="stock">
          <AccordionTrigger>Availability</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="in-stock"
                checked={inStockOnly}
                onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
              />
              <Label htmlFor="in-stock" className="text-sm font-normal cursor-pointer">
                In Stock Only
              </Label>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
