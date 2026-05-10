"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type HeroBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  mobileImage: string | null;
  link: string | null;
  buttonText: string | null;
};

export function HeroSlider({ banners }: { banners: HeroBanner[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, banners.length]);

  if (banners.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full h-[244px] md:h-[372px] overflow-hidden rounded-2xl bg-muted lg:flex-1 lg:min-w-0">
      {/* Mobile Image */}
      <Image
        src={currentBanner.mobileImage ?? currentBanner.image}
        alt={currentBanner.title}
        fill
        priority
        className="object-cover md:hidden"
      />
      {/* Desktop/Tablet Image */}
      <Image
        src={currentBanner.image}
        alt={currentBanner.title}
        fill
        priority
        className="hidden object-cover md:block"
      />

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white rounded-md h-9 w-9 md:h-10 md:w-10 flex items-center justify-center shadow-md transition-colors"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white rounded-md h-9 w-9 md:h-10 md:w-10 flex items-center justify-center shadow-md transition-colors"
            aria-label="Next banner"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-6 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(index);
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-4 bg-orange-500"
                  : "w-2 bg-white/70 hover:bg-white"
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
