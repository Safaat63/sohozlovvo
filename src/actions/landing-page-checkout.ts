"use server"

import { prisma } from "@/lib/prisma"
import { getPublicSettings } from "@/actions/settings"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { PaymentMethod, PaymentStatus, OrderStatus } from "@/generated/prisma/enums"
import { validateBDPhoneNumber, validateEmail } from "@/lib/validation"
import { sendPushNotificationToAdmins } from "@/actions/push-notifications"

const landingPageCheckoutSchema = z.object({
  name: z.string().min(2, "Please enter your full name (at least 2 characters)"),
  email: z.string().optional().refine((email) => {
    if (!email) return true
    const result = validateEmail(email)
    return result.valid
  }, { message: "Invalid email address" }),
  phone: z.string().refine((phone) => validateBDPhoneNumber(phone), {
    message: "Please enter a valid Bangladesh phone number (01XXXXXXXXX)"
  }),
  street: z.string().min(5, "Please enter your complete address (at least 5 characters)"),
  city: z.string().min(2, "Please enter your city name"),
  thana: z.string().optional(),
  paymentMethod: z.enum(["CARD", "BKASH", "NAGAD", "ROCKET", "COD", "MANUAL"]),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().min(1),
    combinationId: z.string().optional().nullable(),
  })),
})

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `SL-${timestamp}-${random}`.toUpperCase()
}

export async function createLandingPageOrder(landingPageId: string, formData: FormData) {
  try {
    const settings = await getPublicSettings()

    const itemsRaw = formData.get("items")
    if (!itemsRaw || typeof itemsRaw !== "string") {
      return { error: "Invalid order items" }
    }

    const items = JSON.parse(itemsRaw)

    const data = {
      name: formData.get("name") as string,
      email: (formData.get("email") as string) || undefined,
      phone: formData.get("phone") as string,
      street: formData.get("street") as string,
      city: formData.get("city") as string,
      thana: (formData.get("thana") as string) || undefined,
      paymentMethod: formData.get("paymentMethod") as string,
      transactionId: (() => {
        const value = formData.get("transactionId")
        return value && typeof value === "string" && value.trim() !== "" ? value : undefined
      })(),
      notes: (() => {
        const value = formData.get("notes")
        return value && typeof value === "string" && value.trim() !== "" ? value : undefined
      })(),
      items,
    }

    const validatedFields = landingPageCheckoutSchema.safeParse(data)

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.issues[0].message,
      }
    }

    const { name, email, phone, street, city, thana, paymentMethod, transactionId, notes, items: orderItems } = validatedFields.data

    const products = await prisma.product.findMany({
      where: {
        id: { in: orderItems.map((item: { productId: string }) => item.productId) },
        isActive: true,
      },
      include: {
        combinations: true,
      },
    })

    if (products.length !== orderItems.length) {
      return { error: "Some products are not available" }
    }

    for (const item of orderItems) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) {
        return { error: `Product not found` }
      }

      const stock = item.combinationId
        ? product.combinations.find((c) => c.id === item.combinationId)?.stock ?? 0
        : product.stock

      if (stock < item.quantity) {
        return { error: `Sorry, ${product.name} only has ${stock} units available` }
      }
    }

    const defaultShippingCost = parseFloat(settings.shipping_cost || "0")

    const subtotal = orderItems.reduce((sum: number, item: { productId: string; quantity: number; combinationId?: string | null }) => {
      const product = products.find((p) => p.id === item.productId)!
      let price = parseFloat(product.price.toString())

      if (item.combinationId) {
        const combination = product.combinations.find((c) => c.id === item.combinationId)
        if (combination?.price) {
          price = parseFloat(combination.price.toString())
        }
      }

      if (product.discountType && product.discountValue) {
        const discountValue = Number(product.discountValue)
        const now = new Date()
        let isDiscountValid = true

        if (product.discountStartDate && now < new Date(product.discountStartDate)) {
          isDiscountValid = false
        }
        if (product.discountEndDate && now > new Date(product.discountEndDate)) {
          isDiscountValid = false
        }

        if (isDiscountValid && discountValue > 0) {
          if (product.discountType === "PERCENTAGE") {
            price = price - (price * discountValue / 100)
          } else if (product.discountType === "FIXED_AMOUNT") {
            price = price - discountValue
          }
          price = Math.max(0, price)
        }
      }

      return sum + price * item.quantity
    }, 0)

    const shippingCost = defaultShippingCost
    const total = subtotal + shippingCost

    const orderNumber = generateOrderNumber()

    const shippingAddress = `${street}${thana ? `, ${thana}` : ""}, ${city}, Bangladesh`

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          status: OrderStatus.PENDING,
          subtotal,
          shippingCost,
          total,
          paymentMethod: paymentMethod as PaymentMethod,
          paymentStatus: PaymentStatus.PENDING,
          transactionId,
          notes,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          shippingAddress,
          items: {
            create: orderItems.map((item: { productId: string; quantity: number; combinationId?: string | null }) => {
              const product = products.find((p) => p.id === item.productId)!
              let price = parseFloat(product.price.toString())

              if (item.combinationId) {
                const combination = product.combinations.find((c) => c.id === item.combinationId)
                if (combination?.price) {
                  price = parseFloat(combination.price.toString())
                }
              }

              if (product.discountType && product.discountValue) {
                const discountValue = Number(product.discountValue)
                const now = new Date()
                let isDiscountValid = true

                if (product.discountStartDate && now < new Date(product.discountStartDate)) {
                  isDiscountValid = false
                }
                if (product.discountEndDate && now > new Date(product.discountEndDate)) {
                  isDiscountValid = false
                }

                if (isDiscountValid && discountValue > 0) {
                  if (product.discountType === "PERCENTAGE") {
                    price = price - (price * discountValue / 100)
                  } else if (product.discountType === "FIXED_AMOUNT") {
                    price = price - discountValue
                  }
                  price = Math.max(0, price)
                }
              }

              return {
                productId: item.productId,
                combinationId: item.combinationId,
                quantity: item.quantity,
                price,
                name: product.name,
                image: product.images[0] || null,
                sku: product.sku,
              }
            }),
          },
          payment: {
            create: {
              amount: total,
              method: paymentMethod as PaymentMethod,
              status: PaymentStatus.PENDING,
              transactionId,
            },
          },
        },
      })

      const landingPageOrder = await tx.landingPageOrder.create({
        data: {
          landingPageId,
          orderId: order.id,
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          shippingAddress,
          city,
          thana,
          paymentMethod: paymentMethod as PaymentMethod,
          paymentStatus: PaymentStatus.PENDING,
          transactionId,
          subtotal,
          shippingCost,
          total,
          notes,
          status: OrderStatus.PENDING,
        },
      })

      for (const item of orderItems) {
        const product = products.find((p) => p.id === item.productId)!

        if (item.combinationId) {
          await tx.productVariantCombination.update({
            where: { id: item.combinationId! },
            data: { stock: { decrement: item.quantity } },
          })
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        }
      }

      return { order, landingPageOrder }
    })

    try {
      await sendPushNotificationToAdmins({
        title: "New Landing Page Order",
        body: `${name} placed an order #${orderNumber} for ${total.toFixed(2)} BDT`,
      })
    } catch {
      // Push notification failure should not block order
    }

    revalidatePath(`/admin/landing-pages`)
    return { success: true, orderId: result.order.id, orderNumber }
  } catch {
    return { error: "Failed to create order. Please try again." }
  }
}
