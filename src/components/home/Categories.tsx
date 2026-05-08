"use client";
import { useRef, useEffect, type PointerEvent, type DragEvent } from "react";
import Image from "next/image";
import Link from "next/link";

const AUTO_SLIDE_INTERVAL_MS = 4000;
const AUTO_SCROLL_STEP = 312;

export default function FeaturedCategories({ categories }) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);

  // Check initial state on mount and window resize
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const onResize = () => {
      container.scrollTo({ left: container.scrollLeft });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [categories]);

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const id = window.setInterval(() => {
      const container = scrollContainerRef.current;
      if (!container) return;
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const maxScrollLeft = scrollWidth - clientWidth;

      if (maxScrollLeft <= 0) return;

      const atEnd = Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 2;
      if (atEnd) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: AUTO_SCROLL_STEP, behavior: "smooth" });
      }
    }, AUTO_SLIDE_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [categories]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    isDraggingRef.current = true;
    dragStartXRef.current = event.clientX;
    dragStartScrollLeftRef.current = scrollContainerRef.current.scrollLeft;
    scrollContainerRef.current.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    const delta = event.clientX - dragStartXRef.current;
    scrollContainerRef.current.scrollLeft =
      dragStartScrollLeftRef.current - delta;
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    isDraggingRef.current = false;
    scrollContainerRef.current.releasePointerCapture(event.pointerId);
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
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
            className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth py-4 cursor-grab active:cursor-grabbing select-none touch-pan-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onDragStart={handleDragStart}
          >
            {categories.map((category) => (
              <div
                key={category.id}
                className="snap-start shrink-0 first:ml-2 last:mr-2 md:first:ml-0 md:last:mr-0"
              >
                <Link
                  href={`/categories/${category.slug}`}
                  className="flex flex-col items-center group w-30 md:w-35"
                >
                  {/* Image Card */}
                  <div className="w-30 h-30 md:w-35 md:h-35 bg-white rounded-[28px] flex items-center justify-center p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)] group-hover:shadow-[0_4px_15px_rgba(0,0,0,0.08)] transition-all duration-300">
                    {category.image ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-contain transform group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 120px, 140px"
                          draggable={false}
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
                    <p className="text-sm md:text-[15px] font-medium text-[#4A4A4A] group-hover:text-[#FF7A00] transition-colors duration-300 wrap-break-word">
                      {category.name}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
