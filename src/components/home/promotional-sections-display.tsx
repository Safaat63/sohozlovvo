"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PromotionalSection = {
  id: string;
  image: string | null;
  link: string | null;
};

export function PromotionalSectionsDisplay({
  sections,
}: {
  sections: PromotionalSection[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const validSections = sections.filter((s) => s.image);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === validSections.length - 1 ? 0 : prevIndex + 1,
    );
  }, [validSections.length]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? validSections.length - 1 : prevIndex - 1,
    );
  };

  useEffect(() => {
    if (validSections.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [nextSlide, validSections.length]);

  if (validSections.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-lg group">
      {/* Slider Container */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {validSections.map((section) => (
          <div key={section.id} className="w-full flex-shrink-0">
            {section.link ? (
              <Link
                href={section.link}
                className="block relative aspect-[16/9] md:aspect-[21/9]"
              >
                <Image
                  src={section.image!}
                  alt="Promotional Image"
                  fill
                  className="object-cover"
                  priority
                />
              </Link>
            ) : (
              <div className="relative aspect-[16/9] md:aspect-[21/9]">
                <Image
                  src={section.image!}
                  alt="Promotional Image"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {validSections.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {validSections.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {validSections.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                currentIndex === index ? "bg-white w-4" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
