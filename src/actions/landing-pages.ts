"use server"

import { prisma } from "@/lib/prisma"

export async function getLandingPage(slug: string) {
  try {
    const landingPage = await prisma.landingPage.findUnique({
      where: {
        slug,
        isActive: true,
        isPublished: true,
      },
      include: {
        products: {
          orderBy: { order: "asc" },
          include: {
            product: {
              include: {
                reviews: {
                  select: {
                    id: true,
                    rating: true,
                    title: true,
                    comment: true,
                    images: true,
                    createdAt: true,
                    isVerified: true,
                    user: {
                      select: {
                        name: true,
                        image: true,
                      },
                    },
                  },
                  orderBy: { createdAt: "desc" },
                  take: 10,
                },
                flashSales: {
                  where: {
                    isActive: true,
                    endDate: { gt: new Date() },
                  },
                  orderBy: { endDate: "asc" },
                  take: 1,
                },
              },
            },
          },
        },
        imageReviews: {
          orderBy: { order: "asc" },
        },
        videoReviews: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!landingPage) {
      return null
    }

    return {
      ...landingPage,
      products: landingPage.products.map((lp) => ({
        ...lp,
        product: {
          ...lp.product,
          price: lp.product.price.toNumber(),
          compareAtPrice: lp.product.compareAtPrice?.toNumber() ?? null,
          costPrice: lp.product.costPrice?.toNumber() ?? null,
          rating: lp.product.rating.toNumber(),
          discountValue: lp.product.discountValue?.toNumber() ?? null,
          flashSales: lp.product.flashSales.map((fs) => ({
            ...fs,
            salePrice: fs.salePrice.toNumber(),
          })),
        },
      })),
    }
  } catch {
    return null
  }
}

export async function getActiveLandingPages() {
  try {
    const landingPages = await prisma.landingPage.findMany({
      where: {
        isActive: true,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        heroImage: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return landingPages
  } catch {
    return []
  }
}
