"use client";

import React, { useState, useEffect, useMemo, useRef, createContext, useContext } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  ShoppingBag,
  Phone,
  ZoomIn,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/actions/cart";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Currency } from "@/components/providers/currency-provider";
import { trackAddToCart } from "@/lib/ga4";
import Link from "next/link";

interface ProductTabsContextType {
  activeSection: string;
}

export const ProductTabsContext = createContext<ProductTabsContextType>({
  activeSection: "description",
});

export const useProductTabs = () => useContext(ProductTabsContext);

// --- STRICT TYPES ---
interface VariationOption {
  id: string;
  optionName: string;
  isActive: boolean;
  variationId: string;
  image?: string | null;
  hexCode?: string | null;
}

interface Variation {
  id: string;
  variationName: string;
  options: VariationOption[];
}

interface CombinationOption {
  id: string;
  optionId: string;
  option: {
    id: string;
    optionName: string;
    variation: {
      id: string;
      variationName: string;
    };
  };
}

interface Combination {
  id: string;
  sku: string | null;
  stock: number;
  price: number | string | null;
  originalPrice?: number | null;
  isActive: boolean;
  options: CombinationOption[];
}

interface ProductPurchaseProps {
  productId: string;
  productName: string;
  baseStock: number;
  basePrice: number;
  variations: Variation[];
  combinations: Combination[];
  whatsappLink?: string | null;
  callNumber?: string | null;
  productBrand?: string | null;
  productCategory?: string | null;
}

// --- 1. PRODUCT PRICE DISPLAY ---
export function ProductPriceDisplay({
  basePrice,
  compareAtPrice,
  hasDiscount = false,
  discountPercentage,
}: {
  basePrice: number;
  compareAtPrice: number | null;
  hasDiscount?: boolean;
  discountPercentage?: number;
}) {
  const [currentPrice, setCurrentPrice] = useState(basePrice);
  const [variationOriginalPrice, setVariationOriginalPrice] = useState<
    number | null
  >(null);

  useEffect(() => {
    const handleVariationChange = (e: Event) => {
      const customEvent = e as CustomEvent<{
        price: number;
        originalPrice?: number | null;
      }>;
      setCurrentPrice(customEvent.detail.price);
      setVariationOriginalPrice(customEvent.detail.originalPrice ?? null);
    };
    window.addEventListener("variation-price-change", handleVariationChange);
    return () =>
      window.removeEventListener(
        "variation-price-change",
        handleVariationChange,
      );
  }, []);

  const effectiveComparePrice =
    variationOriginalPrice ||
    compareAtPrice ||
    (hasDiscount && discountPercentage
      ? currentPrice / (1 - discountPercentage / 100)
      : null);

  return (
    <div className="flex items-center flex-wrap gap-3 font-mono">
      <span className="text-primary text-[18px] md:text-[24px] font-semibold tracking-tight">
        <Currency value={currentPrice} />
      </span>
      {effectiveComparePrice && currentPrice < effectiveComparePrice && (
        <>
          <span className="text-muted-foreground text-[18px] md:text-[24px] line-through">
            <Currency value={effectiveComparePrice} />
          </span>
          <span className="bg-[#34BE82] text-primary-foreground text-[11px] md:text-xs font-semibold px-2 py-0.5 rounded tracking-wide">
            Save{" "}
            {Math.round(
              ((effectiveComparePrice - currentPrice) / effectiveComparePrice) *
                100,
            )}
            %
          </span>
        </>
      )}
    </div>
  );
}

// --- 2. PRODUCT IMAGE GALLERY ---
export function ProductImageGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [variantImage, setVariantImage] = useState<string | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleVariantImageChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ image: string | null }>;
      setVariantImage(customEvent.detail.image);
      if (customEvent.detail.image) setSelectedIndex(0);
    };
    window.addEventListener("variation-image-change", handleVariantImageChange);
    return () =>
      window.removeEventListener(
        "variation-image-change",
        handleVariantImageChange,
      );
  }, []);

  const displayImages = useMemo(() => {
    if (variantImage && variantImage.trim() !== "") {
      return [variantImage, ...images.filter((img) => img !== variantImage)];
    }
    return images;
  }, [variantImage, images]);

  if (displayImages.length === 0)
    return (
      <div className="aspect-square bg-muted flex items-center justify-center text-muted-foreground rounded">
        No Image
      </div>
    );

  const currentImage = variantImage
    ? variantImage
    : displayImages[selectedIndex];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    setZoomPosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div className="flex flex-row gap-3 md:gap-4 h-auto md:h-135">
      {displayImages.length > 1 && (
        <div className="flex flex-col gap-2 overflow-y-auto w-20 md:w-21 custom-scrollbar pr-1 pt-1">
          {displayImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              onClick={() => {
                setVariantImage(null);
                setSelectedIndex(
                  variantImage ? (index === 0 ? 0 : index - 1) : index,
                );
              }}
              className={cn(
                "shrink-0 w-15 h-15 md:w-21 md:h-21 bg-card border cursor-pointer relative rounded transition-all",
                (variantImage === null && selectedIndex === index) ||
                  (variantImage && index === 0)
                  ? "border-primary"
                  : "border-border hover:border-primary/50",
              )}
            >
              <Image
                src={image}
                alt={`thumb ${index}`}
                fill
                className="object-contain p-1"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
      <div
        ref={imageContainerRef}
        className="flex-1 bg-card border border-border overflow-hidden relative rounded group cursor-zoom-in min-h-75"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <Image
          src={currentImage}
          alt={productName}
          fill
          priority
          className={cn(
            "object-contain transition-transform duration-200 ease-out p-4",
            isZoomed && "scale-150",
          )}
          style={
            isZoomed
              ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }
              : undefined
          }
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div
          className={cn(
            "absolute top-4 left-4 bg-foreground/80 text-background text-xs px-2 py-1 rounded-full flex items-center gap-1 transition-opacity",
            isZoomed ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          <ZoomIn className="h-3 w-3" />
          <span className="hidden sm:inline">Hover to zoom</span>
        </div>
      </div>
    </div>
  );
}

// --- 3. PRODUCT PURCHASE & COMBINATIONS ---
export function ProductPurchaseWithCombinations({
  productId,
  productName,
  baseStock,
  basePrice,
  variations,
  combinations,
  whatsappLink,
  callNumber,
  productBrand,
  productCategory,
}: ProductPurchaseProps) {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [prevEffectiveStock, setPrevEffectiveStock] = useState<number | null>(
    null,
  );
  const [adding, setAdding] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [activeButton, setActiveButton] = useState<null | 'plus' | 'minus'>(null);
  const quantityContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quantityContainerRef.current && !quantityContainerRef.current.contains(event.target as Node)) {
        setActiveButton(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasVariations = variations.length > 0 && combinations.length > 0;

  const selectedCombination = useMemo(() => {
    if (!hasVariations) return null;
    const selectedOptionIds = Object.values(selectedOptions);
    if (selectedOptionIds.length !== variations.length) return null;
    return (
      combinations.find((combo) => {
        const comboOptionIds = combo.options.map((o) => o.optionId);
        return (
          selectedOptionIds.every((id) => comboOptionIds.includes(id)) &&
          comboOptionIds.length === selectedOptionIds.length
        );
      }) || null
    );
  }, [selectedOptions, combinations, variations.length, hasVariations]);

  const selectedVariantLabel = useMemo(() => {
    if (!selectedCombination) return undefined;
    const labels = selectedCombination.options.map((option) => {
      return `${option.option.variation.variationName}: ${option.option.optionName}`;
    });
    return labels.join(" / ");
  }, [selectedCombination]);

  const effectivePrice =
    selectedCombination && selectedCombination.price !== null
      ? Number(selectedCombination.price)
      : basePrice;
  const effectiveStock = selectedCombination
    ? selectedCombination.stock
    : !hasVariations
      ? baseStock
      : combinations
          .filter((c) => c.isActive)
          .reduce((sum, c) => sum + c.stock, 0);

  if (effectiveStock !== prevEffectiveStock) {
    setPrevEffectiveStock(effectiveStock);
    if (quantity > effectiveStock && effectiveStock > 0)
      setQuantity(effectiveStock);
  }

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("variation-price-change", {
        detail: {
          price: effectivePrice,
          originalPrice: selectedCombination?.originalPrice ?? null,
        },
      }),
    );
  }, [effectivePrice, selectedCombination]);

  const isOptionAvailable = (variationId: string, optionId: string) => {
    return combinations.some((combo) => {
      if (!combo.options.some((o) => o.optionId === optionId)) return false;
      const otherSelections = Object.entries(selectedOptions).filter(
        ([vId]) => vId !== variationId,
      );
      return (
        otherSelections.every(([, selId]) =>
          combo.options.some((o) => o.optionId === selId),
        ) && combo.stock > 0
      );
    });
  };

  const handleAddToCart = async (redirectToCheckout = false) => {
    if (hasVariations && !selectedCombination)
      return toast.error("Please select all options");
    if (effectiveStock < quantity) return toast.error("Not enough stock");
    const setLoading = redirectToCheckout ? setOrdering : setAdding;
    setLoading(true);
    const result = await addToCart(
      productId,
      quantity,
      selectedCombination?.id,
    );
    setLoading(false);
    if (result?.error) return toast.error(result.error);
    toast.success(
      redirectToCheckout ? "Proceeding to checkout" : "Added to cart",
    );
    trackAddToCart({
      item_id: productId,
      item_name: productName,
      price: effectivePrice,
      quantity,
      item_variant: selectedVariantLabel,
      item_brand: productBrand || undefined,
      item_category: productCategory || undefined,
    });
    if (redirectToCheckout) router.push("/checkout");
    else router.refresh();
  };

  const allSelected =
    !hasVariations || Object.keys(selectedOptions).length === variations.length;

  // Unconditional Fallbacks for exact 4-button match
  const safeWhatsappLink = whatsappLink || "https://wa.me/8801321208940";
  const safeCallNumber = callNumber ? `tel:${callNumber}` : "tel:09642922922";

  return (
    <div className="space-y-5">
      {variations.map((variation) => (
        <div key={variation.id} className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {variation.options
              .filter((o) => o.isActive)
              .map((option) => {
                const isSelected = selectedOptions[variation.id] === option.id;
                const isAvailable = isOptionAvailable(variation.id, option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() =>
                      setSelectedOptions((prev) => ({
                        ...prev,
                        [variation.id]: option.id,
                      }))
                    }
                    disabled={!isAvailable}
                    className={cn(
                      "px-4 py-1.5 text-sm rounded border transition-all bg-card",
                      isSelected
                        ? "border-primary text-primary font-bold"
                        : "border-border text-foreground hover:border-primary",
                      !isAvailable &&
                        "opacity-40 cursor-not-allowed line-through",
                    )}
                  >
                    {option.optionName}
                  </button>
                );
              })}
          </div>
        </div>
      ))}

      {effectiveStock > 0 && (
        <div className="space-y-4">
          {allSelected && (
            <div className="flex items-center gap-4">
              <span className="font-medium text-sm text-foreground">
                Quantity:
              </span>
              <div ref={quantityContainerRef} className="flex items-center border border-border rounded-full bg-gray-100 w-fit h-9">
                <button
                  type="button"
                  className={cn("w-9 h-full flex items-center justify-center rounded-l-full transition-colors", activeButton === 'minus' ? "bg-accent" : "hover:bg-gray-200")}
                  onClick={() => {
                    setActiveButton('minus');
                    setQuantity(Math.max(1, quantity - 1));
                  }}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-3 w-3 p-0" />
                </button>
                <input
                  className="w-12 h-full text-center text-sm font-bold text-foreground focus:outline-none bg-transparent"
                  value={quantity}
                  readOnly
                />
                <button
                  type="button"
                  className={cn("w-9 h-full flex items-center justify-center rounded-r-full transition-colors", activeButton === 'plus' ? "bg-accent" : "hover:bg-gray-200")}
                  onClick={() => {
                    setActiveButton('plus');
                    setQuantity(Math.min(effectiveStock, quantity + 1));
                  }}
                  disabled={quantity >= effectiveStock}
                >
                  <Plus className="h-3 w-3 p-0" />
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button
              type="button"
              className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-sm shadow-none uppercase tracking-wide text-[12px] md:text-[14px]"
              onClick={() => handleAddToCart(false)}
              disabled={!allSelected || adding}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />{" "}
              {adding ? "Adding..." : "ADD TO CART"}
            </Button>
            <Button
              type="button"
              className="w-full h-10 bg-foreground hover:bg-foreground/90 text-background font-semibold rounded-sm shadow-none uppercase tracking-wide text-[12px] md:text-[14px]"
              onClick={() => handleAddToCart(true)}
              disabled={!allSelected || ordering}
            >
              {ordering ? "Processing..." : "BUY NOW"}
            </Button>

            <Link
              href={safeWhatsappLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-full h-10 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 text-white font-semibold rounded-sm transition-colors text-[12px] md:text-[14px]"
            >
              <MessageCircle className="h-4 w-4 mr-2" /> Order On WhatsApp
            </Link>
            <Link
              href={safeCallNumber}
              className="flex items-center justify-center w-full h-10 bg-[#1e3a8a] hover:bg-blue-900 dark:bg-blue-500 text-white font-semibold rounded-sm transition-colors text-[12px] md:text-[14px]"
            >
              <Phone className="h-4 w-4 mr-2" /> Call For Order
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// --- 4. PRODUCT JUMP LINKS (TABS) ---
export function ProductJumpLinks({
  hasVideo,
  reviewCount,
}: {
  hasVideo: boolean;
  reviewCount: number;
}) {
  const [activeSection, setActiveSection] = useState("description");

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offsetPosition =
        element.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const handleTabClick = (id: string) => {
    setActiveSection(id);
    window.dispatchEvent(new CustomEvent("product-tab-change", { detail: { section: id } }));
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 },
    );

    const sectionIds = ["description", "video", "reviews"];
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    elements.forEach((s) => observer.observe(s));
    return () => elements.forEach((s) => observer.unobserve(s));
  }, []);

  return (
    <ProductTabsContext.Provider value={{ activeSection }}>
      {/* Mobile Tabs */}
      <div className="flex md:hidden flex-wrap items-center bg-card border-b border-border p-4 gap-2 rounded-t-xl shadow-sm">
        <button
          onClick={() => handleTabClick("description")}
          className={cn(
            "px-5 py-2.5 rounded text-[12px] transition-all",
            activeSection === "description"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground hover:bg-accent",
          )}
        >
          Description
        </button>
        {hasVideo && (
          <button
            onClick={() => handleTabClick("video")}
            className={cn(
              "px-5 py-2.5 rounded text-[12px] transition-all",
              activeSection === "video"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-accent",
            )}
          >
            Product Video
          </button>
        )}
        <button
          onClick={() => handleTabClick("reviews")}
          className={cn(
            "px-5 py-2.5 rounded text-[12px] transition-all",
            activeSection === "reviews"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground hover:bg-accent",
          )}
        >
          Reviews ({reviewCount})
        </button>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex flex-wrap items-center bg-card border-b border-border p-4 gap-2 rounded-t-xl shadow-sm">
        <Link
          href="#description"
          onClick={(e) => scrollToSection(e, "description")}
          className={cn(
            "px-5 py-2.5 rounded text-[14px] transition-all",
            activeSection === "description"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground hover:bg-accent",
          )}
        >
          Description
        </Link>
        {hasVideo && (
          <Link
            href="#video"
            onClick={(e) => scrollToSection(e, "video")}
            className={cn(
              "px-5 py-2.5 rounded text-[14px] transition-all",
              activeSection === "video"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-accent",
            )}
          >
            Product Video
          </Link>
        )}
        <Link
          href="#reviews"
          onClick={(e) => scrollToSection(e, "reviews")}
          className={cn(
            "px-5 py-2.5 rounded text-[14px] transition-all",
            activeSection === "reviews"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground hover:bg-accent",
          )}
        >
          Reviews ({reviewCount})
        </Link>
      </div>
    </ProductTabsContext.Provider>
  );
}
