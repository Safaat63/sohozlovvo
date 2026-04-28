"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const BRANDS = [
  { href: "https://ghorerbazar.com/brand/ghorerbazar", img: "https://backoffice.ghorerbazar.com/brand_images/7hNKq1768887947.png" },
  { href: "https://ghorerbazar.com/brand/glarvest", img: "https://backoffice.ghorerbazar.com/brand_images/RNTIU1763611802.png" },
  { href: "https://ghorerbazar.com/brand/khejuri", img: "https://backoffice.ghorerbazar.com/brand_images/8Gpl21757919440.png" },
  { href: "https://ghorerbazar.com/brand/Shosti food", img: "https://backoffice.ghorerbazar.com/brand_images/8matO1757919401.png" },
  { href: "https://ghorerbazar.com/brand/Honeyraj", img: "https://backoffice.ghorerbazar.com/brand_images/lCfRt1759553456.png" },
  // add more items to test pagination
  { href: "#6", img: "https://backoffice.ghorerbazar.com/brand_images/7hNKq1768887947.png" },
  { href: "#7", img: "https://backoffice.ghorerbazar.com/brand_images/RNTIU1763611802.png" },
  { href: "#8", img: "https://backoffice.ghorerbazar.com/brand_images/8Gpl21757919440.png" },
  { href: "#9", img: "https://backoffice.ghorerbazar.com/brand_images/8matO1757919401.png" },
  { href: "#10", img: "https://backoffice.ghorerbazar.com/brand_images/lCfRt1759553456.png" },
];

export default function BrandSection() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const [cardWidth, setCardWidth] = useState(0);
  const [gap, setGap] = useState(16); // Tailwind gap-4 default
  const [visibleCount, setVisibleCount] = useState(1);
  const [pages, setPages] = useState(1);
  const [activePage, setActivePage] = useState(0);

  // Measure card width and gap and container width to compute visibleCount
  useEffect(() => {
    const measure = () => {
      const list = listRef.current;
      const container = scrollRef.current;
      if (!list || !container) return;

      const firstCard = list.querySelector<HTMLElement>("a");
      if (!firstCard) return;

      const cardRect = firstCard.getBoundingClientRect();
      setCardWidth(cardRect.width);

      const cs = getComputedStyle(list);
      const gapValue = cs.gap || cs.columnGap || cs.rowGap || "";
      const parsedGap = parseFloat(gapValue || "");
      setGap(Number.isFinite(parsedGap) ? parsedGap : 16);

      const containerRect = container.getBoundingClientRect();
      const step = cardRect.width + (Number.isFinite(parsedGap) ? parsedGap : 16);
      const visible = Math.max(1, Math.floor(containerRect.width / step));
      setVisibleCount(visible);

      const totalPages = Math.max(1, Math.ceil(BRANDS.length / visible));
      setPages(totalPages);

      // clamp active page if needed
      setActivePage((p) => Math.max(0, Math.min(totalPages - 1, p)));
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

  // Update active page on scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    let raf = 0;

    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (cardWidth <= 0) return;
        const step = cardWidth + gap;
        const left = container.scrollLeft;
        const pageStep = step * visibleCount;
        const idx = Math.round(left / pageStep);
        const bounded = Math.max(0, Math.min(pages - 1, idx));
        setActivePage(bounded);
      });
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [cardWidth, gap, visibleCount, pages]);

  // Scroll to page when dot clicked
  const scrollToPage = (pageIndex: number) => {
    const container = scrollRef.current;
    if (!container || cardWidth <= 0) return;
    const step = cardWidth + gap;
    const left = pageIndex * visibleCount * step;
    container.scrollTo({ left, behavior: "smooth" });
    setActivePage(pageIndex);
  };

  return (
    <section>
      <div className="mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-black text-[22px] font-bold leading-tight">Our Brands</h3>
            <div className="mt-3">
              <span className="block w-[120px] h-[6px] bg-[#FF7A00] rounded-full" />
            </div>
          </div>

          <div className="text-left sm:text-right">
            <a href="https://ghorerbazar.com/all-brands" className="text-[#FF7A00] font-semibold flex items-center gap-2 uppercase text-sm">
              <span className="underline">See all</span>
              <ArrowRight size={16} className="text-[#FF7A00]" />
            </a>

            <div className="mt-3 flex sm:justify-end">
              <span className="block w-[64px] h-[6px] bg-[#FF7A00] rounded-full" />
            </div>
          </div>
        </div>

        {/* Scrollable list */}
        <div ref={scrollRef} className="overflow-x-auto scrollbar-hide scroll-smooth" aria-label="Brand list">
          <div ref={listRef} className="flex gap-4" style={{ paddingBottom: 8 }}>
            {BRANDS.map((b, idx) => (
              <a
                key={idx}
                href={b.href}
                className="min-w-[180px] bg-white rounded-xl p-4 shadow-sm border border-[#f1f1f1] flex items-center justify-center"
                aria-label={`Brand ${idx + 1}`}
              >
                <div className="relative w-full h-[60px] flex items-center justify-center">
                  <Image src={b.img} alt={`brand-${idx}`} fill className="object-contain" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Pagination dots (pages) */}
        <div className="flex justify-center mt-5 gap-2" role="tablist" aria-label="Brand pagination">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToPage(i)}
              aria-label={`Go to page ${i + 1}`}
              aria-current={activePage === i ? "true" : "false"}
              className={`w-3 h-3 rounded-full transition-transform focus:outline-none ${
                activePage === i ? "bg-[#FF7A00] scale-110" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
