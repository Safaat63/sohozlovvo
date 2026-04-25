import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { toZonedTime } from "date-fns-tz"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Dhaka timezone
const DHAKA_TIMEZONE = "Asia/Dhaka"

/**
 * Formats a date to Dhaka timezone (GMT+6)
 */
export function formatDateDhaka(date: Date | string, formatStr: string = "PPP"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const zonedDate = toZonedTime(dateObj, DHAKA_TIMEZONE)
  return format(zonedDate, formatStr)
}

/**
 * Formats a date with time to Dhaka timezone (GMT+6)
 */
export function formatDateTimeDhaka(date: Date | string, formatStr: string = "PPP 'at' p"): string {
  return formatDateDhaka(date, formatStr)
}

/**
 * Calculate discounted price for a product
 */
export function calculateDiscountedPrice(
  basePrice: number,
  discountType?: string | null,
  discountValue?: number | null,
  discountStartDate?: Date | null,
  discountEndDate?: Date | null
): { finalPrice: number; hasDiscount: boolean; discountPercentage?: number } {
  // Check if discount is valid
  if (!discountType || !discountValue || discountValue <= 0) {
    return { finalPrice: basePrice, hasDiscount: false }
  }

  // Check if discount is within date range
  const now = new Date()
  if (discountStartDate && now < new Date(discountStartDate)) {
    return { finalPrice: basePrice, hasDiscount: false }
  }
  if (discountEndDate && now > new Date(discountEndDate)) {
    return { finalPrice: basePrice, hasDiscount: false }
  }

  let finalPrice = basePrice
  let discountPercentage: number | undefined

  if (discountType === "PERCENTAGE") {
    const discount = (basePrice * discountValue) / 100
    finalPrice = basePrice - discount
    discountPercentage = discountValue
  } else if (discountType === "FIXED_AMOUNT") {
    finalPrice = basePrice - discountValue
    discountPercentage = Math.round((discountValue / basePrice) * 100)
  }

  // Ensure price doesn't go below 0 and round to 2 decimal places
  finalPrice = Math.max(0, Math.round(finalPrice * 100) / 100)

  return { finalPrice, hasDiscount: true, discountPercentage }
}
