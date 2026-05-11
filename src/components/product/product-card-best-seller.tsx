"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Flame, Plus, Minus } from "lucide-react";
import { addToCart } from "@/actions/cart";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  formatCurrency,
  useCurrencySymbol,
} from "@/components/providers/currency-provider";
import { calculateDiscountedPrice } from "@/lib/utils";
import { trackAddToCart } from "@/lib/ga4";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number | null;
    images: string[];
    stock: number;
    brand?: string | null;
    rating?: number | null;
    reviewCount?: number;
    description?: string | null;
    lowStockAlert?: number | null;
    discountType?: string | null;
    discountValue?: number | null;
    discountStartDate?: Date | null;
    discountEndDate?: Date | null;
    flashSales?: {
      id: string;
      salePrice: number;
      startDate: Date;
      endDate: Date;
      isActive: boolean;
    }[];
  };
}

export function ProductCardBestSeller({ product }: ProductCardProps) {
  const [isCartPending, setIsCartPending] = useState(false);
  const [isOrderPending, setIsOrderPending] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [showQuantityBox, setShowQuantityBox] = useState(false);
  const router = useRouter();
  const currency = useCurrencySymbol();

  const now = new Date();
  const activeFlashSale = product.flashSales?.find(
    (fs) =>
      fs.isActive &&
      new Date(fs.startDate) <= now &&
      new Date(fs.endDate) >= now,
  );

  const { finalPrice, hasDiscount } = activeFlashSale
    ? {
        finalPrice: activeFlashSale.salePrice,
        hasDiscount: true,
      }
    : calculateDiscountedPrice(
        product.price,
        product.discountType,
        product.discountValue ? Number(product.discountValue) : null,
        product.discountStartDate,
        product.discountEndDate,
      );

  const displayPrice = hasDiscount ? finalPrice : product.price;
  const displayComparePrice = hasDiscount
    ? product.price
    : product.compareAtPrice;
  const savings = displayComparePrice ? displayComparePrice - displayPrice : 0;

  const handleOpenQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuantityBox(true);
    handleUpdateQuantity(1);
  };

  const handleUpdateQuantity = async (delta: number) => {
    const newQty = Math.max(0, quantity + delta);
    setQuantity(newQty);
    
    if (newQty === 0) {
      setShowQuantityBox(false);
      return;
    }

    setIsCartPending(true);
    const result = await addToCart(product.id, delta);
    setIsCartPending(false);

    if (result?.error) {
      toast.error(result.error);
      setQuantity(quantity);
    } else {
      if (delta > 0) {
        toast.success("Added to cart", { duration: 1000 });
        trackAddToCart({
          item_id: product.id,
          item_name: product.name,
          price: displayPrice,
          quantity: delta,
          item_brand: product.brand || undefined,
        });
      }
      router.refresh();
    }
  };

  const handleOrderNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOrderPending(true);
    const result = await addToCart(product.id, 1);
    setIsOrderPending(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      trackAddToCart({
        item_id: product.id,
        item_name: product.name,
        price: displayPrice,
        quantity: 1,
        item_brand: product.brand || undefined,
      });
      router.push("/checkout");
    }
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-100/50 hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row h-full md:h-[300px] md:w-full max-w-[650px] mx-auto overflow-hidden relative p-3 md:p-5">
      {/* Badge */}
      {(activeFlashSale || hasDiscount) && (
        <div className="absolute top-0 right-0 z-10 flex items-center gap-1 bg-[#FF4D4D] px-2 py-1 md:px-3 md:py-1.5 rounded-bl-xl text-[10px] md:text-xs font-bold text-white shadow-sm">
          <Flame size={12} fill="white" />
          <span>Best Selling</span>
        </div>
      )}

      {/* Image Area */}
      <Link
        href={`/products/${product.slug}/`}
        className="block relative w-full md:w-[40%] aspect-square md:aspect-auto overflow-hidden rounded-lg mb-3 md:mb-0"
      >
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
            No Image
          </div>
        )}
      </Link>

      {/* Content Area */}
      <div className="flex flex-col flex-1 md:pl-6 justify-around">
        <Link
          href={`/products/${product.slug}/`}
          className="text-sm md:text-xl font-bold text-[#1a1d23] hover:text-[#F28C28] transition-colors line-clamp-2 mb-2 leading-tight"
        >
          {product.name}
        </Link>

        {/* Price Area */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm md:text-xl font-bold text-[#F28C28]">
              {formatCurrency(displayPrice, currency)}
            </span>
            {displayComparePrice && displayComparePrice > displayPrice && (
              <span className="text-xs md:text-base text-gray-400 line-through">
                {formatCurrency(displayComparePrice, currency)}
              </span>
            )}
          </div>
          {savings > 0 && (
            <div className="flex">
              <span className="text-[10px] md:text-xs font-bold text-[#1a1d23] bg-[#A3E635] px-2 py-1 rounded-md">
                Save {formatCurrency(savings, currency)}
              </span>
            </div>
          )}
        </div>

        {/* Action Area */}
        <div className="flex items-center gap-3 mt-auto">
          <div className="relative flex-1 md:flex-initial">
            {!showQuantityBox ? (
              <button
                onClick={handleOpenQuantity}
                disabled={product.stock === 0 || isCartPending}
                className="w-full md:w-auto h-8 md:h-10 px-2 md:px-4 flex items-center justify-center gap-1 md:gap-2 rounded-md border border-[#F28C28] text-[10px] md:text-sm font-bold text-[#F28C28] hover:bg-[#F28C28] hover:text-white transition-all duration-300 disabled:opacity-50"
              >
                <ShoppingCart size={14} className="md:w-4 md:h-4" />
                Add To Cart
              </button>
            ) : (
              <div className="flex items-center justify-between w-full md:w-32 h-8 md:h-10 bg-[#F28C28] rounded-md text-white px-1">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleUpdateQuantity(-1);
                  }}
                  className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="text-xs md:text-sm font-bold">{quantity}</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleUpdateQuantity(1);
                  }}
                  className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleOrderNow}
            disabled={product.stock === 0 || isOrderPending}
            className="hidden md:flex flex-1 md:flex-initial h-10 px-4 items-center justify-center gap-2 rounded-md bg-[#F28C28] text-sm font-bold text-white hover:bg-[#d97d24] transition-all"
          >
            Buy now
          </button>
        </div>
      </div>
    </div>
  );
}
