"use client";

import Image from "next/image";
import { Star } from "lucide-react";

type Testimonial = {
  id: string;
  name: string | null;
  image: string | null;
  review: string | null;
  rating: number | null;
  layout: "IMAGE_ONLY" | "NAME_AND_REVIEW";
};

export function TestimonialsSection({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  if (testimonials.length === 0) {
    return null;
  }

  const imageOnlyTestimonials = testimonials.filter(
    (t) => t.layout === "IMAGE_ONLY",
  );
  const nameAndReviewTestimonials = testimonials.filter(
    (t) => t.layout === "NAME_AND_REVIEW",
  );

  return (
    <section className="py-4 md:py-16 bg-gray-50 dark:bg-gray-900/50">
      <div className="container max-w-360 mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground">
            Hear from our satisfied customers
          </p>
        </div>

        {/* Image Only Layout */}
        {imageOnlyTestimonials.length > 0 && (
          <div className="mb-8 md:mb-12">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {imageOnlyTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="relative aspect-square overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  {testimonial.image && (
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name || "Customer"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 160px"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Name and Review Layout */}
        {nameAndReviewTestimonials.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {nameAndReviewTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="rounded-lg border bg-card p-6 shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  {testimonial.image && (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name || "Customer"}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">
                      {testimonial.name || "Anonymous"}
                    </h3>
                    {testimonial.rating && (
                      <div className="flex gap-0.5 mt-1">
                        {Array.from({ length: testimonial.rating }).map(
                          (_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 fill-yellow-400 text-yellow-400"
                            />
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {testimonial.review && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {testimonial.review}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
