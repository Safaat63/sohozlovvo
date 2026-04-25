/**
 * Validation utilities for forms
 */

/**
 * Validates Bangladesh phone number format
 * Format: +880 1X XXXXXXXX (where X is 1-9 for operator code)
 * Accepted operators: 11, 12, 13, 14, 15, 16, 17, 18, 19
 */
export function validateBDPhoneNumber(phone: string): boolean {
    // Remove all spaces, hyphens, and parentheses
    const cleanedPhone = phone.replace(/[\s\-\(\)]/g, "")

    // Check if it matches Bangladesh phone format
    // Must start with followed by 1[1-9] and then 8 more digits
    const bdPhoneRegex = /^(01[1-9])\d{8}$/

    return bdPhoneRegex.test(cleanedPhone)
}

/**
 * List of common disposable/temporary email domains to block
 * This helps prevent fake orders from temporary email services
 */
const DISPOSABLE_EMAIL_DOMAINS = [
    "tempmail.com",
    "10minutemail.com",
    "guerrillamail.com",
    "mailinator.com",
    "throwaway.email",
    "temp-mail.org",
    "getnada.com",
    "maildrop.cc",
    "trashmail.com",
    "yopmail.com",
    "fakeinbox.com",
    "sharklasers.com",
    "guerrillamail.info",
    "grr.la",
    "guerrillamail.biz",
    "guerrillamail.de",
    "spam4.me",
    "mintemail.com",
    "emailondeck.com",
    "tempr.email",
    "mohmal.com",
    "mailnesia.com",
    "dispostable.com",
    "throwawaymail.com",
    "mytrashmail.com",
    "tempinbox.com",
]

/**
 * Checks if an email domain is a known disposable/temporary email service
 */
export function isDisposableEmail(email: string): boolean {
    const domain = email.toLowerCase().split("@")[1]
    if (!domain) return false

    return DISPOSABLE_EMAIL_DOMAINS.includes(domain)
}

/**
 * Validates email format and checks against disposable domains
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
        return { valid: false, error: "Invalid email format" }
    }

    if (isDisposableEmail(email)) {
        return { valid: false, error: "Temporary/disposable email addresses are not allowed" }
    }

    return { valid: true }
}

/**
 * Formats a Bangladesh phone number to standard format
 * Converts various input formats to: +880 1X XXXX XXXX
 */
export function formatBDPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/[\s\-\(\)]/g, "")

    // If it starts with +880
    if (cleaned.startsWith("+880")) {
        const number = cleaned.slice(4)
        if (number.length === 10) {
            return `+880 ${number.slice(0, 2)} ${number.slice(2, 6)} ${number.slice(6)}`
        }
    }

    // If it starts with 880
    if (cleaned.startsWith("880")) {
        const number = cleaned.slice(3)
        if (number.length === 10) {
            return `+880 ${number.slice(0, 2)} ${number.slice(2, 6)} ${number.slice(6)}`
        }
    }

    // If it starts with 0
    if (cleaned.startsWith("0")) {
        const number = cleaned.slice(1)
        if (number.length === 10) {
            return `+880 ${number.slice(0, 2)} ${number.slice(2, 6)} ${number.slice(6)}`
        }
    }

    // Return as-is if it doesn't match expected formats
    return phone
}
