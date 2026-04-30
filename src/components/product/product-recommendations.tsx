import { prisma } from "@/lib/prisma"
import { ProductCard } from "./product-card"

interface RelatedProductsProps {
  productId: string
  categoryId?: string | null
  limit?: number
}

export async function RelatedProducts({ productId, categoryId, limit = 6 }: RelatedProductsProps) {
  // Get related products from same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      AND: [
        { id: { not: productId } },
        { isActive: true },
        { stock: { gt: 0 } },
        ...(categoryId ? [{ categoryId }] : []),
      ],
    },
    include: {
      flashSales: {
        where: {
          isActive: true,
        },
      },
      variations: {
        include: {
          options: {
            select: {
              id: true,
              optionName: true,
              isActive: true,
              variationId: true,
              image: true,
              hexCode: true,
            },
          },
        },
      },
      combinations: {
        include: {
          options: {
            select: {
              id: true,
              optionId: true,
              option: {
                select: {
                  id: true,
                  optionName: true,
                  variation: {
                    select: {
                      id: true,
                      variationName: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    take: limit,
    orderBy: [
      { rating: "desc" },
      { reviewCount: "desc" },
    ],
  })

  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Related Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {relatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={{
              ...product,
              price: Number(product.price),
              compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
              rating: Number(product.rating ?? 0),
              reviewCount: product.reviewCount ?? 0,
              discountValue: product.discountValue ? Number(product.discountValue) : null,
              flashSales: product.flashSales?.map((fs) => ({
                ...fs,
                salePrice: Number(fs.salePrice),
              })),
              variations: product.variations?.map((variation) => ({
                id: variation.id,
                variationName: variation.variationName,
                options: variation.options.map((option) => ({
                  id: option.id,
                  optionName: option.optionName,
                  isActive: option.isActive,
                  variationId: option.variationId,
                  image: option.image ?? null,
                  hexCode: option.hexCode ?? null,
                })),
              })),
              combinations: product.combinations?.map((combo) => ({
                id: combo.id,
                sku: combo.sku,
                stock: combo.stock,
                price: combo.price !== null && combo.price !== undefined ? Number(combo.price) : null,
                isActive: combo.isActive,
                options: combo.options.map((comboOption) => ({
                  id: comboOption.id,
                  optionId: comboOption.optionId,
                  option: comboOption.option ? {
                    id: comboOption.option.id,
                    optionName: comboOption.option.optionName,
                    variation: comboOption.option.variation ? {
                      id: comboOption.option.variation.id,
                      variationName: comboOption.option.variation.variationName,
                    } : null,
                  } : null,
                })),
              })),
            }}
          />
        ))}
      </div>
    </div>
  )
}

export async function YouMayAlsoLike({ productId, limit = 6 }: { productId: string; limit?: number }) {
  // Get the current product
  const currentProduct = await prisma.product.findUnique({
    where: { id: productId },
    select: { price: true, brand: true },
  })

  if (!currentProduct) return null

  const minPrice = parseFloat(currentProduct.price.toString()) * 0.7
  const maxPrice = parseFloat(currentProduct.price.toString()) * 1.3

  // Get similar priced products or same brand
  const suggestions = await prisma.product.findMany({
    where: {
      AND: [
        { id: { not: productId } },
        { isActive: true },
        { stock: { gt: 0 } },
        {
          OR: [
            {
              price: {
                gte: minPrice,
                lte: maxPrice,
              },
            },
            ...(currentProduct.brand ? [{ brand: currentProduct.brand }] : []),
          ],
        },
      ],
    },
    include: {
      flashSales: {
        where: {
          isActive: true,
        },
      },
      variations: {
        include: {
          options: {
            select: {
              id: true,
              optionName: true,
              isActive: true,
              variationId: true,
              image: true,
              hexCode: true,
            },
          },
        },
      },
      combinations: {
        include: {
          options: {
            select: {
              id: true,
              optionId: true,
              option: {
                select: {
                  id: true,
                  optionName: true,
                  variation: {
                    select: {
                      id: true,
                      variationName: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    take: limit,
    orderBy: [
      { rating: "desc" },
      { reviewCount: "desc" },
    ],
  })

  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">You May Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {suggestions.map((product) => (
          <ProductCard
            key={product.id}
            product={{
              ...product,
              price: Number(product.price),
              compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
              rating: Number(product.rating ?? 0),
              reviewCount: product.reviewCount ?? 0,
              discountValue: product.discountValue ? Number(product.discountValue) : null,
              flashSales: product.flashSales?.map((fs) => ({
                ...fs,
                salePrice: Number(fs.salePrice),
              })),
              variations: product.variations?.map((variation) => ({
                id: variation.id,
                variationName: variation.variationName,
                options: variation.options.map((option) => ({
                  id: option.id,
                  optionName: option.optionName,
                  isActive: option.isActive,
                  variationId: option.variationId,
                  image: option.image ?? null,
                  hexCode: option.hexCode ?? null,
                })),
              })),
              combinations: product.combinations?.map((combo) => ({
                id: combo.id,
                sku: combo.sku,
                stock: combo.stock,
                price: combo.price !== null && combo.price !== undefined ? Number(combo.price) : null,
                isActive: combo.isActive,
                options: combo.options.map((comboOption) => ({
                  id: comboOption.id,
                  optionId: comboOption.optionId,
                  option: comboOption.option ? {
                    id: comboOption.option.id,
                    optionName: comboOption.option.optionName,
                    variation: comboOption.option.variation ? {
                      id: comboOption.option.variation.id,
                      variationName: comboOption.option.variation.variationName,
                    } : null,
                  } : null,
                })),
              })),
            }}
          />
        ))}
      </div>
    </div>
  )
}
