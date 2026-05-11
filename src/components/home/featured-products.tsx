"use client";

import { useMemo } from "react";
import { ProductCardBestSeller } from "@/components/product/product-card-best-seller";

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

interface FeaturedProductsProps {
  products: ProductInput[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const normalizedProducts = useMemo(() => {
    return products.slice(0, 4).map((product) => ({
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
    })) as ProductNormalized[];
  }, [products]);

  if (normalizedProducts.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
      {normalizedProducts.map((product) => (
        <ProductCardBestSeller key={product.id} product={product} />
      ))}
    </div>
  );
}
