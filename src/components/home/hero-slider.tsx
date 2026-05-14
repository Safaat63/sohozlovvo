"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
    <Link
      href={currentBanner.link}
      className="group relative w-full h-61 md:h-93 overflow-hidden rounded-2xl bg-muted lg:flex-1 lg:min-w-0"
    >
      {/* Mobile Image */}
      <Image
        src={currentBanner.mobileImage ?? currentBanner.image}
        alt={currentBanner.title}
        fill
        priority
        className="object-cover md:hidden"
        sizes="(max-width: 768px) 100vw, 0px"
      />
      {/* Desktop/Tablet Image */}
      <Image
        src={currentBanner.image}
        alt={currentBanner.title}
        fill
        priority
        className="hidden object-cover md:block"
        sizes="(max-width: 768px) 0px, (max-width: 1024px) 100vw, (max-width: 1536px) 60vw, 900px"
      />

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white text-orange-500 shadow-md transition-all opacity-0 pointer-events-none hover:bg-orange-500 hover:text-white group-hover:opacity-100 group-hover:pointer-events-auto md:h-10 md:w-10"
            aria-label="Previous banner"
          >
            <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white text-orange-500 shadow-md transition-all opacity-0 pointer-events-none hover:bg-orange-500 hover:text-white group-hover:opacity-100 group-hover:pointer-events-auto md:h-10 md:w-10"
            aria-label="Next banner"
          >
            <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
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
    </Link>
  );
}
