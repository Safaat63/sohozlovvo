"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
    <div className="group relative overflow-hidden h-93.5 w-113.75 rounded-2xl">
      {/* Slider Container */}
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {validSections.map((section) => (
          <div key={section.id} className="relative h-full w-full shrink-0">
            {section.link ? (
              <Link
                href={section.link}
                className="relative block h-full w-full"
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
              <div className="relative h-full w-full">
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
            className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-white text-orange-500 shadow-md transition-all opacity-0 pointer-events-none hover:bg-orange-500 hover:text-white group-hover:opacity-100 group-hover:pointer-events-auto"
            aria-label="Previous slide"
          >
            <ArrowLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-white text-orange-500 shadow-md transition-all opacity-0 pointer-events-none hover:bg-orange-500 hover:text-white group-hover:opacity-100 group-hover:pointer-events-auto"
            aria-label="Next slide"
          >
            <ArrowRight size={24} />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {validSections.length > 1 && (
        <div className="absolute bottom-4 left-6 flex gap-2">
          {validSections.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                currentIndex === index ? "bg-orange-500 w-4" : "bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
