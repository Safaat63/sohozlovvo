"use client";

import { useEffect, useRef, type PointerEvent, type DragEvent } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const AUTO_SLIDE_INTERVAL_MS = 4000;

const BRANDS = [
  {
    href: "https://ghorerbazar.com/brand/ghorerbazar",
    img: "https://backoffice.ghorerbazar.com/brand_images/7hNKq1768887947.png",
  },
  {
    href: "https://ghorerbazar.com/brand/glarvest",
    img: "https://backoffice.ghorerbazar.com/brand_images/RNTIU1763611802.png",
  },
  {
    href: "https://ghorerbazar.com/brand/khejuri",
    img: "https://backoffice.ghorerbazar.com/brand_images/8Gpl21757919440.png",
  },
  {
    href: "https://ghorerbazar.com/brand/Shosti food",
    img: "https://backoffice.ghorerbazar.com/brand_images/8matO1757919401.png",
  },
  {
    href: "https://ghorerbazar.com/brand/Honeyraj",
    img: "https://backoffice.ghorerbazar.com/brand_images/lCfRt1759553456.png",
  },
  {
    href: "#6",
    img: "https://backoffice.ghorerbazar.com/brand_images/7hNKq1768887947.png",
  },
  {
    href: "#7",
    img: "https://backoffice.ghorerbazar.com/brand_images/RNTIU1763611802.png",
  },
  {
    href: "#8",
    img: "https://backoffice.ghorerbazar.com/brand_images/8Gpl21757919440.png",
  },
  {
    href: "#9",
    img: "https://backoffice.ghorerbazar.com/brand_images/8matO1757919401.png",
  },
  {
    href: "#10",
    img: "https://backoffice.ghorerbazar.com/brand_images/lCfRt1759553456.png",
  },
];

export default function BrandSection() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const cardWidthRef = useRef(0);
  const gapRef = useRef(16); // Tailwind gap-4 default
  const visibleCountRef = useRef(1);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);

  // Measure card width and gap and container width to compute visibleCount
  useEffect(() => {
    const measure = () => {
      const list = listRef.current;
      const container = scrollRef.current;
      if (!list || !container) return;

      const firstCard = list.querySelector<HTMLElement>("a");
      if (!firstCard) return;

      const cardRect = firstCard.getBoundingClientRect();
      cardWidthRef.current = cardRect.width;

      const cs = getComputedStyle(list);
      const gapValue = cs.gap || cs.columnGap || cs.rowGap || "";
      const parsedGap = parseFloat(gapValue || "");
      gapRef.current = Number.isFinite(parsedGap) ? parsedGap : 16;

      const containerRect = container.getBoundingClientRect();
      const step =
        cardRect.width + (Number.isFinite(parsedGap) ? parsedGap : 16);
      const visible = Math.max(1, Math.floor(containerRect.width / step));
      visibleCountRef.current = visible;
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (listRef.current) ro.observe(listRef.current);
    if (scrollRef.current) ro.observe(scrollRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const id = window.setInterval(() => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const maxScrollLeft = scrollWidth - clientWidth;
      if (maxScrollLeft <= 0) return;

      const atEnd = Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 2;
      if (atEnd) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const step = cardWidthRef.current + gapRef.current;
        const visible = visibleCountRef.current;
        const scrollByAmount = step * visible;
        container.scrollBy({ left: scrollByAmount, behavior: "smooth" });
      }
    }, AUTO_SLIDE_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, []);

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
    <section>
      <div className="mx-auto">
        {/* Header - Fixed to be row layout on all screen sizes */}
        <div className="flex flex-row justify-between items-center gap-2 mb-6">
          <div>
            <h3 className="text-foreground text-[18px] sm:text-[22px] font-bold leading-tight">
              Our Brands
            </h3>
            <div className="mt-2 sm:mt-3">
              <span className="block w-20 sm:w-30 h-1 sm:h-1.5 bg-primary rounded-full" />
            </div>
          </div>

          <div className="text-right">
            <a
              href="https://ghorerbazar.com/all-brands"
              className="text-primary font-semibold flex items-center gap-1 sm:gap-2 uppercase text-[11px] sm:text-sm group"
            >
              <span className="underline group-hover:no-underline transition-all">
                See all
              </span>
              <ArrowRight className="text-primary group-hover:translate-x-1 transition-transform w-[14px] h-[14px] sm:w-[16px] sm:h-[16px]" />
            </a>

            <div className="mt-2 sm:mt-3 flex justify-end">
              <span className="block w-[40px] sm:w-[64px] h-[4px] sm:h-[6px] bg-primary rounded-full" />
            </div>
          </div>
        </div>

        {/* Scrollable list */}
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide scroll-smooth cursor-grab active:cursor-grabbing select-none touch-pan-x"
          aria-label="Brand list"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onDragStart={handleDragStart}
        >
          <div
            ref={listRef}
            className="flex gap-3 sm:gap-4"
            style={{ paddingBottom: 8 }}
          >
            {BRANDS.map((b, idx) => (
              <a
                key={idx}
                href={b.href}
                className="min-w-[140px] sm:min-w-[160px] md:min-w-[180px] bg-card rounded-xl p-4 shadow-sm border border-border flex items-center justify-center transition-all hover:shadow-md hover:border-primary/50"
                aria-label={`Brand ${idx + 1}`}
              >
                <div className="relative w-full h-[50px] sm:h-[60px] flex items-center justify-center">
                  <Image
                    src={b.img}
                    alt={`brand-${idx}`}
                    fill
                    className="object-contain"
                    draggable={false}
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
