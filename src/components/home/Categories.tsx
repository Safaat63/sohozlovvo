"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function FeaturedCategories({ categories }) {
  const scrollContainerRef = useRef(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  // Update button visibility based on scroll position
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    
    setIsAtStart(scrollLeft <= 0);
    // Adding a 2px buffer for decimal pixel rendering issues on some screens
    setIsAtEnd(Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 2);
  };

  // Check initial state on mount and window resize
  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, [categories]);

  // Handle arrow button clicks
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      // Scroll by roughly 2 cards at a time (card width + gap = ~156px * 2 = 312px)
      const scrollAmount = direction === "left" ? -312 : 312;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="w-full">
      <div className="mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h3 className="text-[#333333] text-[24px] md:text-[28px] font-semibold">
            Featured Categories
          </h3>
        </div>

        {/* Carousel Wrapper */}
        <div className="relative group/slider">
          
          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="snap-start shrink-0 first:ml-2 last:mr-2 md:first:ml-0 md:last:mr-0"
              >
                <Link
                  href={`/categories/${category.slug}`}
                  className="flex flex-col items-center group w-[120px] md:w-[140px]"
                >
                  {/* Image Card */}
                  <div className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] bg-white rounded-[28px] flex items-center justify-center p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)] group-hover:shadow-[0_4px_15px_rgba(0,0,0,0.08)] transition-all duration-300">
                    {category.image ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-contain transform group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 120px, 140px"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300 font-bold">
                        {category.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  {/* Category Name */}
                  <div className="mt-4 text-center w-full">
                    <p className="text-sm md:text-[15px] font-medium text-[#4A4A4A] group-hover:text-[#FF7A00] transition-colors duration-300 break-words">
                      {category.name}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Custom Navigation Buttons */}
          <button
            onClick={() => scroll("left")}
            disabled={isAtStart}
            className="absolute left-0 top-[60px] md:top-[70px] -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 bg-[#FF9A42] hover:bg-[#FF7A00] text-white rounded-full flex items-center justify-center shadow-md transition-all duration-300 disabled:opacity-0 disabled:scale-90 disabled:pointer-events-none"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} className="mr-0.5" />
          </button>
          
          <button
            onClick={() => scroll("right")}
            disabled={isAtEnd}
            className="absolute right-0 top-[60px] md:top-[70px] -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 bg-[#FFD7BA] hover:bg-[#FF7A00] hover:text-white text-white rounded-full flex items-center justify-center shadow-md transition-all duration-300 disabled:opacity-0 disabled:scale-90 disabled:pointer-events-none"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} className="ml-0.5" />
          </button>
        </div>

      </div>
    </section>
  );
}