"use client";

import {
  useEffect,
  useMemo,
  useRef,
  type PointerEvent,
  type DragEvent,
} from "react";
import { ProductCardBestSeller } from "@/components/product/product-card-best-seller";

const SLIDE_INTERVAL_MS = 4000;
const ITEMS_PER_SLIDE = 2;

type FlashSaleInput = {
  id: string;
  salePrice: number;
  startDate: string | Date | null;
  endDate: string | Date | null;
  isActive: boolean;
};

type FlashSaleNormalized = {
  id: string;
  salePrice: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
};

type ProductInput = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  stock: number;
  brand?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  description?: string | null;
  lowStockAlert?: number | null;
  discountType?: string | null;
  discountValue?: number | null;
  discountStartDate?: string | Date | null;
  discountEndDate?: string | Date | null;
  flashSales?: FlashSaleInput[];
};

type ProductNormalized = Omit<
  ProductInput,
  "discountStartDate" | "discountEndDate" | "flashSales"
> & {
  discountStartDate?: Date | null;
  discountEndDate?: Date | null;
  flashSales?: FlashSaleNormalized[];
};

interface FeaturedProductsSliderProps {
  products: ProductInput[];
}

export function FeaturedProductsSlider({
  products,
}: FeaturedProductsSliderProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);

  const slides = useMemo(() => {
    const normalized: ProductNormalized[] = products.map((product) => ({
      ...product,
      discountStartDate: product.discountStartDate
        ? new Date(product.discountStartDate)
        : null,
      discountEndDate: product.discountEndDate
        ? new Date(product.discountEndDate)
        : null,
      flashSales: product.flashSales
        ?.filter((sale) => sale.startDate && sale.endDate)
        .map((sale) => ({
          ...sale,
          startDate: new Date(sale.startDate as string | Date),
          endDate: new Date(sale.endDate as string | Date),
        })),
    }));

    const groups: ProductNormalized[][] = [];
    for (let i = 0; i < normalized.length; i += ITEMS_PER_SLIDE) {
      groups.push(normalized.slice(i, i + ITEMS_PER_SLIDE));
    }
    return groups;
  }, [products]);

  const totalSlides = slides.length;

  useEffect(() => {
    if (totalSlides <= 1) return;
    const id = window.setInterval(() => {
      const container = scrollRef.current;
      if (container) {
        const { scrollLeft, scrollWidth, clientWidth } = container;
        const atEnd = Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 2;
        if (atEnd) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollBy({ left: clientWidth, behavior: "smooth" });
        }
      }
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [totalSlides]);

  if (totalSlides === 0) return null;

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    isDraggingRef.current = true;
    dragStartXRef.current = event.clientX;
    dragStartScrollLeftRef.current = scrollRef.current.scrollLeft;
    scrollRef.current.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    const delta = event.clientX - dragStartXRef.current;
    scrollRef.current.scrollLeft = dragStartScrollLeftRef.current - delta;
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    isDraggingRef.current = false;
    scrollRef.current.releasePointerCapture(event.pointerId);
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="overflow-x-auto snap-x snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing select-none touch-pan-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onDragStart={handleDragStart}
      >
        <div className="flex">
          {slides.map((slide, slideIndex) => (
            <div key={slideIndex} className="w-full shrink-0 snap-start">
              <div className="grid grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
                {slide.map((product) => (
                  <ProductCardBestSeller key={product.id} product={product} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
