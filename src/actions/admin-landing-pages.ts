"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

async function checkAdminAccess() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }
  return session
}

const landingPageSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional().nullable(),
  heroImage: z.string().optional().nullable(),
  heroVideo: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  customCss: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isPublished: z.boolean().default(false),
  productIds: z.array(z.string()).default([]),
  imageReviews: z
    .array(
      z.object({
        imageUrl: z.string(),
        caption: z.string().optional().nullable(),
      })
    )
    .default([]),
  videoReviews: z
    .array(
      z.object({
        videoUrl: z.string(),
        title: z.string().optional().nullable(),
        thumbnail: z.string().optional().nullable(),
      })
    )
    .default([]),
})

export async function getAdminLandingPages({
  page = 1,
  limit = 20,
  search,
}: {
  page?: number
  limit?: number
  search?: string
} = {}) {
  await checkAdminAccess()

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ]
  }

  const skip = (page - 1) * limit

  const [landingPages, total] = await Promise.all([
    prisma.landingPage.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    }),
    prisma.landingPage.count({ where }),
  ])

  return {
    landingPages,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  }
}

export async function getAdminLandingPage(id: string) {
  await checkAdminAccess()

  const landingPage = await prisma.landingPage.findUnique({
    where: { id },
    include: {
      products: {
        orderBy: { order: "asc" },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              images: true,
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

  return landingPage
}

export async function createLandingPage(formData: FormData) {
  await checkAdminAccess()

  const productIdsRaw = formData.get("productIds")
  const productIds =
    typeof productIdsRaw === "string" ? JSON.parse(productIdsRaw) : []

  const imageReviewsRaw = formData.get("imageReviews")
  const imageReviews =
    typeof imageReviewsRaw === "string" ? JSON.parse(imageReviewsRaw) : []

  const videoReviewsRaw = formData.get("videoReviews")
  const videoReviews =
    typeof videoReviewsRaw === "string" ? JSON.parse(videoReviewsRaw) : []

  const data = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    heroImage: formData.get("heroImage"),
    heroVideo: formData.get("heroVideo"),
    metaTitle: formData.get("metaTitle"),
    metaDescription: formData.get("metaDescription"),
    customCss: formData.get("customCss"),
    isActive: formData.get("isActive") === "true",
    isPublished: formData.get("isPublished") === "true",
  }

  const result = landingPageSchema.safeParse({
    ...data,
    productIds,
    imageReviews,
    videoReviews,
  })

  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  try {
    const landingPage = await prisma.landingPage.create({
      data: {
        title: result.data.title,
        slug: result.data.slug,
        description: result.data.description,
        heroImage: result.data.heroImage,
        heroVideo: result.data.heroVideo,
        metaTitle: result.data.metaTitle,
        metaDescription: result.data.metaDescription,
        customCss: result.data.customCss,
        isActive: result.data.isActive,
        isPublished: result.data.isPublished,
        products: {
          create: result.data.productIds.map((productId, index) => ({
            productId,
            order: index,
          })),
        },
        imageReviews: {
          create: result.data.imageReviews.map((review, index) => ({
            imageUrl: review.imageUrl,
            caption: review.caption,
            order: index,
          })),
        },
        videoReviews: {
          create: result.data.videoReviews.map((review, index) => ({
            videoUrl: review.videoUrl,
            title: review.title,
            thumbnail: review.thumbnail,
            order: index,
          })),
        },
      },
    })

    revalidatePath("/admin/landing-pages")
    return { success: true, id: landingPage.id }
  } catch {
    return { error: "Failed to create landing page" }
  }
}

export async function updateLandingPage(id: string, formData: FormData) {
  await checkAdminAccess()

  const productIdsRaw = formData.get("productIds")
  const productIds =
    typeof productIdsRaw === "string" ? JSON.parse(productIdsRaw) : []

  const imageReviewsRaw = formData.get("imageReviews")
  const imageReviews =
    typeof imageReviewsRaw === "string" ? JSON.parse(imageReviewsRaw) : []

  const videoReviewsRaw = formData.get("videoReviews")
  const videoReviews =
    typeof videoReviewsRaw === "string" ? JSON.parse(videoReviewsRaw) : []

  const data = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    heroImage: formData.get("heroImage"),
    heroVideo: formData.get("heroVideo"),
    metaTitle: formData.get("metaTitle"),
    metaDescription: formData.get("metaDescription"),
    customCss: formData.get("customCss"),
    isActive: formData.get("isActive") === "true",
    isPublished: formData.get("isPublished") === "true",
  }

  const result = landingPageSchema.safeParse({
    ...data,
    productIds,
    imageReviews,
    videoReviews,
  })

  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.landingPage.update({
        where: { id },
        data: {
          title: result.data.title,
          slug: result.data.slug,
          description: result.data.description,
          heroImage: result.data.heroImage,
          heroVideo: result.data.heroVideo,
          metaTitle: result.data.metaTitle,
          metaDescription: result.data.metaDescription,
          customCss: result.data.customCss,
          isActive: result.data.isActive,
          isPublished: result.data.isPublished,
        },
      })

      await tx.landingPageProduct.deleteMany({
        where: { landingPageId: id },
      })

      await tx.landingPageProduct.createMany({
        data: result.data.productIds.map((productId, index) => ({
          landingPageId: id,
          productId,
          order: index,
        })),
      })

      await tx.landingPageImageReview.deleteMany({
        where: { landingPageId: id },
      })

      await tx.landingPageImageReview.createMany({
        data: result.data.imageReviews.map((review, index) => ({
          landingPageId: id,
          imageUrl: review.imageUrl,
          caption: review.caption,
          order: index,
        })),
      })

      await tx.landingPageVideoReview.deleteMany({
        where: { landingPageId: id },
      })

      await tx.landingPageVideoReview.createMany({
        data: result.data.videoReviews.map((review, index) => ({
          landingPageId: id,
          videoUrl: review.videoUrl,
          title: review.title,
          thumbnail: review.thumbnail,
          order: index,
        })),
      })
    })

    revalidatePath("/admin/landing-pages")
    revalidatePath(`/admin/landing-pages/${id}`)
    return { success: true }
  } catch {
    return { error: "Failed to update landing page" }
  }
}

export async function deleteLandingPage(id: string) {
  await checkAdminAccess()

  try {
    await prisma.landingPage.delete({
      where: { id },
    })

    revalidatePath("/admin/landing-pages")
    return { success: true }
  } catch {
    return { error: "Failed to delete landing page" }
  }
}

export async function getLandingPageOrders(landingPageId: string) {
  await checkAdminAccess()

  const orders = await prisma.landingPageOrder.findMany({
    where: { landingPageId },
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          total: true,
          createdAt: true,
        },
      },
    },
  })

  return orders.map((order) => ({
    ...order,
    total: order.total.toNumber(),
    order: {
      ...order.order,
      total: order.order.total.toNumber(),
    },
  }))
}
