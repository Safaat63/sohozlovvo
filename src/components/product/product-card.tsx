"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  formatCurrency,
  useCurrencySymbol,
} from "@/components/providers/currency-provider";
import { calculateDiscountedPrice } from "@/lib/utils";
import { addToCart } from "@/actions/cart";
import { ProductPurchaseWithCombinations } from "@/components/product/product-purchase-with-combinations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trackAddToCart } from "@/lib/ga4";

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
    } | null;
  } | null;
}

interface Combination {
  id: string;
  sku: string | null;
  stock: number;
  price: number | string | null;
  isActive: boolean;
  options: CombinationOption[];
}

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
    variations?: Variation[];
    combinations?: Combination[];
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

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const currency = useCurrencySymbol();

  // States for interactions
  const [isCartPending, setIsCartPending] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const hasVariations =
    Array.isArray(product.variations) &&
    product.variations.length > 0 &&
    Array.isArray(product.combinations) &&
    product.combinations.length > 0;

  // 1. Check for active flash sale
  const now = new Date();
  const activeFlashSale = product.flashSales?.find(
    (fs) =>
      fs.isActive &&
      new Date(fs.startDate) <= now &&
      new Date(fs.endDate) >= now,
  );

  // 2. Calculate discounted price
  const {
    finalPrice,
    hasDiscount,
    discountPercentage: flashOrDirectDiscountPercentage,
  } = activeFlashSale
    ? {
        finalPrice: activeFlashSale.salePrice,
        hasDiscount: true,
        discountPercentage: Math.round(
          ((product.price - activeFlashSale.salePrice) / product.price) * 100,
        ),
      }
    : calculateDiscountedPrice(
        product.price,
        product.discountType,
        product.discountValue ? Number(product.discountValue) : null,
        product.discountStartDate,
        product.discountEndDate,
      );

  // 3. Set final display prices
  const displayPrice = hasDiscount ? finalPrice : product.price;
  const displayComparePrice = hasDiscount
    ? product.price
    : product.compareAtPrice;

  // 4. Calculate final badge percentage
  let finalBadgePercentage = null;
  if (hasDiscount && flashOrDirectDiscountPercentage) {
    finalBadgePercentage = flashOrDirectDiscountPercentage;
  } else if (
    !hasDiscount &&
    product.compareAtPrice &&
    product.compareAtPrice > product.price
  ) {
    finalBadgePercentage = Math.round(
      ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
    );
  }

  // 5. Handle Add to Cart Click
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasVariations) {
      // For variable products, open the dialog to select options via your ProductPurchaseSection
      setShowQuickView(true);
      return;
    }

    setIsCartPending(true);
    const result = await addToCart(product.id, 1); // Simple product, add 1 quantity
    setIsCartPending(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Added to cart", { duration: 1000 });
      trackAddToCart({
        item_id: product.id,
        item_name: product.name,
        price: displayPrice,
        quantity: 1,
        item_brand: product.brand || undefined,
      });
      router.refresh();
    }
  };

  return (
    <>
      <div className="relative w-full bg-card border border-border rounded-xs p-2 flex flex-col group transition-shadow hover:shadow-md h-full font-mono">
        {/* Top Right Badge Container */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          {finalBadgePercentage && finalBadgePercentage > 0 && (
            <div className="bg-[#34BE82] text-primary-foreground text-[12px] font-medium px-2 py-0.5 rounded flex items-center justify-center tracking-wide shadow-sm">
              Save {finalBadgePercentage}%
            </div>
          )}
        </div>

        {/* Product Image with Hover Effect */}
        <Link
          href={`/products/${product.slug}`}
          className="block relative w-full aspect-square mb-3 overflow-hidden rounded-md bg-muted"
        >
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              className="object-contain p-2 transition-transform duration-500 ease-in-out group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              No Image
            </div>
          )}
        </Link>

        {/* Product Details */}
        <div className="flex flex-col flex-1 px-1">
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-[16px] font-medium text-card-foreground leading-[1.3] mb-1.5 hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>

          {/* Price Row */}
          <div className="flex items-center gap-2.5 mb-3 mt-auto">
            <span className="text-[18px] font-bold text-primary">
              {formatCurrency(displayPrice, currency)}
            </span>
            {displayComparePrice !== null &&
              displayComparePrice !== undefined &&
              displayComparePrice > displayPrice && (
                <span className="text-[15px] text-muted-foreground line-through font-medium decoration-1">
                  {formatCurrency(displayComparePrice, currency)}
                </span>
              )}
          </div>

          {/* Add To Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isCartPending}
            className="w-full flex items-center justify-center gap-2 border-[1px] border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground transition-colors duration-300 py-1.5 rounded text-[15px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCartPending ? (
              <Loader2 className="w-[16px] h-[16px] animate-spin" />
            ) : (
              <ShoppingCart className="w-[16px] h-[16px] stroke-[2]" />
            )}
            {isCartPending
              ? "Adding..."
              : hasVariations
                ? "Choose Options"
                : "Add To Cart"}
          </button>
        </div>
      </div>

      {/* Quick View Dialog for Variations */}
      {hasVariations && (
        <Dialog open={showQuickView} onOpenChange={setShowQuickView}>
          <DialogContent className="max-w-md w-full">
            <DialogHeader>
              <DialogTitle className="text-lg">Select Variation</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              {/* Mini product header inside dialog */}
              <div className="flex gap-3 pb-4 border-b">
                <div className="h-16 w-16 relative rounded-md overflow-hidden bg-muted">
                  {product.images[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold leading-tight line-clamp-2">
                    {product.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {product.stock} in stock
                  </p>
                </div>
              </div>

              {/* Render your provided purchase section */}
              <ProductPurchaseWithCombinations
                productId={product.id}
                productName={product.name}
                baseStock={product.stock}
                basePrice={displayPrice}
                variations={product.variations || []}
                combinations={product.combinations || []}
                productBrand={product.brand}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
