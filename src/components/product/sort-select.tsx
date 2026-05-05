"use client";

import { ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface SortSelectProps {
  defaultValue?: string;
  className?: string;
}

export function SortSelect({
  defaultValue = "newest",
  className,
}: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", e.target.value);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="relative">
      <select
        id="sort"
        className={`appearance-none bg-muted border-none rounded-lg py-2 pl-3 pr-8 text-sm font-semibold text-foreground focus:ring-1 focus:ring-primary cursor-pointer ${className || ""}`}
        defaultValue={defaultValue}
        onChange={handleChange}
      >
        <option value="newest">Newest Arrivals</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="rating">Popularity</option>
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none w-4 h-4" />
    </div>
  );
}
