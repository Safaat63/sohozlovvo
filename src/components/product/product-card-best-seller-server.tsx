import { ProductCardBestSeller } from "./product-card-best-seller"

interface ProductCardServerProps {
    product: any
}

export async function ProductCardBestSellerServer({ product }: ProductCardServerProps) {

    const safeProduct = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: typeof product.price === "object" && product.price !== null && "toNumber" in product.price
            ? product.price.toNumber()
            : Number(product.price),
        compareAtPrice: product.compareAtPrice !== null && product.compareAtPrice !== undefined
            ? (typeof product.compareAtPrice === "object" && "toNumber" in product.compareAtPrice
                ? product.compareAtPrice.toNumber()
                : Number(product.compareAtPrice))
            : null,
        images: Array.isArray(product.images) ? product.images : [],
        stock: product.stock ?? 0,
        brand: product.brand ?? null,
        rating: product.rating !== null && product.rating !== undefined
            ? (typeof product.rating === "object" && "toNumber" in product.rating
                ? product.rating.toNumber()
                : Number(product.rating))
            : null,
        reviewCount: product.reviewCount ?? 0,
        description: product.description ?? null,
        lowStockAlert: product.lowStockAlert ?? null,
        discountType: product.discountType ?? null,
        discountValue: product.discountValue !== null && product.discountValue !== undefined
            ? (typeof product.discountValue === "object" && "toNumber" in product.discountValue
                ? product.discountValue.toNumber()
                : Number(product.discountValue))
            : null,
        discountStartDate: product.discountStartDate ?? null,
        discountEndDate: product.discountEndDate ?? null
    }


    return (
        <ProductCardBestSeller
            product={safeProduct}
        />
    )
}
