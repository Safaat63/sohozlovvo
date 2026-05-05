import { isInWishlist } from "@/actions/wishlist";
import { ProductCard } from "./product-card-original";

interface ProductCardServerProps {
  product: any;
  whatsappNumber?: string;
  priority?: boolean;
}

export async function ProductCardServer({
  product,
  whatsappNumber,
  priority = false,
}: ProductCardServerProps) {
  const variations = Array.isArray(product.variations)
    ? product.variations.map((variation: any) => ({
        id: variation.id,
        variationName: variation.variationName,
        options: Array.isArray(variation.options)
          ? variation.options.map((option: any) => ({
              id: option.id,
              optionName: option.optionName,
              price:
                typeof option.price === "object" &&
                option.price !== null &&
                "toNumber" in option.price
                  ? option.price.toNumber()
                  : Number(option.price),
              stock: option.stock ?? 0,
              isActive: option.isActive ?? false,
            }))
          : [],
      }))
    : [];

  const flashSales = Array.isArray(product.flashSales)
    ? product.flashSales.map((fs: any) => ({
        id: fs.id,
        salePrice:
          typeof fs.salePrice === "object" &&
          fs.salePrice !== null &&
          "toNumber" in fs.salePrice
            ? fs.salePrice.toNumber()
            : Number(fs.salePrice),
        startDate: fs.startDate,
        endDate: fs.endDate,
        isActive: fs.isActive ?? false,
      }))
    : [];

  const safeProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price:
      typeof product.price === "object" &&
      product.price !== null &&
      "toNumber" in product.price
        ? product.price.toNumber()
        : Number(product.price),
    compareAtPrice:
      product.compareAtPrice !== null && product.compareAtPrice !== undefined
        ? typeof product.compareAtPrice === "object" &&
          "toNumber" in product.compareAtPrice
          ? product.compareAtPrice.toNumber()
          : Number(product.compareAtPrice)
        : null,
    images: Array.isArray(product.images) ? product.images : [],
    stock: product.stock ?? 0,
    brand: product.brand ?? null,
    rating:
      product.rating !== null && product.rating !== undefined
        ? typeof product.rating === "object" && "toNumber" in product.rating
          ? product.rating.toNumber()
          : Number(product.rating)
        : null,
    reviewCount: product.reviewCount ?? 0,
    description: product.description ?? null,
    lowStockAlert: product.lowStockAlert ?? null,
    variations,
    discountType: product.discountType ?? null,
    discountValue:
      product.discountValue !== null && product.discountValue !== undefined
        ? typeof product.discountValue === "object" &&
          "toNumber" in product.discountValue
          ? product.discountValue.toNumber()
          : Number(product.discountValue)
        : null,
    discountStartDate: product.discountStartDate ?? null,
    discountEndDate: product.discountEndDate ?? null,
    flashSales,
  };

  const inWishlist = await isInWishlist(product.id);

  const cleanWhatsapp = whatsappNumber?.replace(/[^0-9]/g, "") || "";

  return (
    <ProductCard
      product={safeProduct}
      initialInWishlist={inWishlist}
      whatsappNumber={cleanWhatsapp}
      priority={priority}
    />
  );
}
