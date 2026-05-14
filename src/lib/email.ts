import { Resend } from "resend"
import { prisma } from "@/lib/prisma"

const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@sohozlovvo.com"
const BRANDING_CACHE_TTL_MS = 5 * 60 * 1000

type EmailBranding = {
    from: string
    storeName: string
    supportEmail: string
}

let emailBrandingCache: (EmailBranding & { expiresAt: number }) | null = null

function extractEmailAddress(value: string) {
    const match = value.match(/<(.+)>/)
    return match?.[1] || value.trim()
}

export async function getEmailBranding(): Promise<EmailBranding> {
    const now = Date.now()

    if (emailBrandingCache && emailBrandingCache.expiresAt > now) {
        const { ...cached } = emailBrandingCache
        return cached
    }

    const settings = await prisma.setting.findMany({
        where: { key: { in: ["store_name", "store_email"] } },
    })

    const settingsMap: Record<string, string> = {}
    for (const setting of settings) {
        settingsMap[setting.key] = setting.value
    }

    const storeName = settingsMap.store_name || "Sohozlovvo"
    const fromAddress = extractEmailAddress(process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL)
    const supportEmail = settingsMap.store_email || fromAddress

    const branding: EmailBranding = {
        from: `${storeName} <${fromAddress}>`,
        storeName,
        supportEmail,
    }

    emailBrandingCache = { ...branding, expiresAt: now + BRANDING_CACHE_TTL_MS }
    return branding
}

interface OrderEmailData {
    orderNumber: string
    customerName: string
    customerEmail: string
    items: {
        name: string
        quantity: number
        price: string
    }[]
    subtotal: string
    shippingCost: string
    discount: string
    total: string
    shippingAddress: string
    paymentMethod: string
    couponCode?: string | null
    loyaltyPointsUsed?: number
}

export async function sendOrderConfirmation(data: OrderEmailData) {
    if (!process.env.RESEND_API_KEY) {
        console.log("Resend API key not configured, skipping email")
        return { success: false, error: "Email not configured" }
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const branding = await getEmailBranding()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const trackUrl = `${baseUrl}/tracking?order=${encodeURIComponent(data.orderNumber)}`

    const itemsHtml = data.items
        .map(
            (item) => `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">৳${item.price}</td>
            </tr>
        `
        )
        .join("")

    try {
        await resend.emails.send({
            from: branding.from,
            to: data.customerEmail,
            subject: `Order Confirmed - #${data.orderNumber}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(to right, #2563eb, #7c3aed); padding: 30px; text-align: center; }
                        .header h1 { color: white; margin: 0; }
                        .content { padding: 30px; background: #fff; }
                        .order-info { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        table { width: 100%; border-collapse: collapse; }
                        th { background: #f3f4f6; padding: 12px; text-align: left; }
                        .total-row { font-weight: bold; font-size: 18px; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Order Confirmed!</h1>
                        </div>
                        <div class="content">
                            <p>Dear ${data.customerName},</p>
                            <p>Thank you for your order! We're excited to let you know that we've received your order and it's being processed.</p>
                            
                            <div class="order-info">
                                <p><strong>Order Number:</strong> #${data.orderNumber}</p>
                                <p><strong>Payment Method:</strong> ${data.paymentMethod.replace("_", " ")}</p>
                            </div>

                            <p style="margin: 10px 0 20px;">
                                <a href="${trackUrl}" style="color: #2563eb; font-weight: 600; text-decoration: none;">View order status</a>
                            </p>
                            
                            <h3>Order Details</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th style="text-align: center;">Qty</th>
                                        <th style="text-align: right;">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHtml}
                                </tbody>
                            </table>
                            
                            <div style="margin-top: 20px; text-align: right;">
                                <p>Subtotal: ৳${data.subtotal}</p>
                                <p>Shipping: ৳${data.shippingCost}</p>
                                ${data.couponCode && parseFloat(data.discount) > 0 ? `<p style="color: green;">Coupon (${data.couponCode}): -৳${data.discount}</p>` : ""}
                                ${data.loyaltyPointsUsed && data.loyaltyPointsUsed > 0 ? `<p style="color: blue;">Loyalty Points (${data.loyaltyPointsUsed}): -৳${(data.loyaltyPointsUsed / 10).toFixed(2)}</p>` : ""}
                                ${!data.couponCode && parseFloat(data.discount) > 0 ? `<p style="color: green;">Discount: -৳${data.discount}</p>` : ""}
                                <p class="total-row">Total: ৳${data.total}</p>
                            </div>
                            
                            <h3>Shipping Address</h3>
                            <p style="white-space: pre-line;">${data.shippingAddress}</p>
                            
                            <p style="margin-top: 30px;">Track this order anytime: <a href="${trackUrl}" style="color: #2563eb; font-weight: 600; text-decoration: none;">View</a></p>
                            
                            <p>Thank you for shopping with us!</p>
                            <p><strong>${branding.storeName} Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} ${branding.storeName}. All rights reserved.</p>
                            <p>If you have any questions, contact us at ${branding.supportEmail}</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        })

        return { success: true }
    } catch (error) {
        console.error("Failed to send order confirmation email:", error)
        return { success: false, error: "Failed to send email" }
    }
}

interface OrderStatusEmailData {
    orderNumber: string
    customerName: string
    customerEmail: string
    status: string
    trackingNumber?: string | null
}

export async function sendOrderStatusUpdate(data: OrderStatusEmailData) {
    if (!process.env.RESEND_API_KEY) {
        console.log("Resend API key not configured, skipping email")
        return { success: false, error: "Email not configured" }
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const branding = await getEmailBranding()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const trackUrl = `${baseUrl}/tracking?order=${encodeURIComponent(data.orderNumber)}`
    
    const statusMessages: Record<string, { title: string; message: string; emoji: string }> = {
        VERIFIED: {
            title: "Payment Verified",
            message: "Your payment has been verified and your order is now being processed.",
            emoji: "✅",
        },
        PROCESSING: {
            title: "Order Processing",
            message: "Your order is being prepared for shipment.",
            emoji: "📦",
        },
        SHIPPED: {
            title: "Order Shipped",
            message: "Great news! Your order has been shipped and is on its way to you.",
            emoji: "🚚",
        },
        DELIVERED: {
            title: "Order Delivered",
            message: "Your order has been delivered. We hope you enjoy your purchase!",
            emoji: "🎉",
        },
        CANCELLED: {
            title: "Order Cancelled",
            message: "Your order has been cancelled. If you have any questions, please contact us.",
            emoji: "❌",
        },
    }

    const statusInfo = statusMessages[data.status] || {
        title: "Order Update",
        message: `Your order status has been updated to: ${data.status}`,
        emoji: "📋",
    }

    try {
        await resend.emails.send({
            from: branding.from,
            to: data.customerEmail,
            subject: `${statusInfo.emoji} ${statusInfo.title} - Order #${data.orderNumber}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(to right, #2563eb, #7c3aed); padding: 30px; text-align: center; }
                        .header h1 { color: white; margin: 0; }
                        .content { padding: 30px; background: #fff; }
                        .status-box { background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
                        .status-emoji { font-size: 48px; }
                        .tracking-box { background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>${statusInfo.title}</h1>
                        </div>
                        <div class="content">
                            <p>Dear ${data.customerName},</p>
                            
                            <div class="status-box">
                                <div class="status-emoji">${statusInfo.emoji}</div>
                                <h2>${statusInfo.title}</h2>
                                <p>${statusInfo.message}</p>
                            </div>
                            
                            <p><strong>Order Number:</strong> #${data.orderNumber}</p>
                            
                            ${data.trackingNumber
                    ? `
                                <div class="tracking-box">
                                    <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
                                    <p>Use this number to track your shipment with the courier.</p>
                                </div>
                            `
                    : ""
                }
                            
                            <p>You can view your order details in your account dashboard.</p>
                            
                            <p style="margin: 10px 0 20px;">
                                <a href="${trackUrl}" style="color: #2563eb; font-weight: 600; text-decoration: none;">View order status</a>
                            </p>

                            <p>Thank you for shopping with us!</p>
                            <p><strong>${branding.storeName} Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} ${branding.storeName}. All rights reserved.</p>
                            <p>If you have any questions, contact us at ${branding.supportEmail}</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        })

        return { success: true }
    } catch (error) {
        console.error("Failed to send order status email:", error)
        return { success: false, error: "Failed to send email" }
    }
}

interface StockAlertEmailData {
    productName: string
    productUrl: string
    recipientEmail: string
}

export async function sendStockAlertEmail(data: StockAlertEmailData) {
    if (!process.env.RESEND_API_KEY) {
        console.log("Resend API key not configured, skipping stock alert email")
        return { success: false, error: "Email not configured" }
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const branding = await getEmailBranding()

    try {
        await resend.emails.send({
            from: branding.from,
            to: data.recipientEmail,
            subject: `Back in Stock: ${data.productName}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(to right, #22c55e, #16a34a); padding: 24px; text-align: center; color: #fff; border-radius: 8px; }
                        .content { background: #fff; padding: 24px; border-radius: 8px; margin-top: -16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                        .btn { display: inline-block; padding: 12px 20px; background: #16a34a; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Good news! ${data.productName} is back in stock</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>The product you were waiting for is available again. Grab it before it sells out!</p>
                            <p style="text-align: center; margin: 24px 0;">
                                <a class="btn" href="${data.productUrl}">View Product</a>
                            </p>
                            <p>If the button doesn't work, copy and paste this link into your browser:</p>
                            <p><a href="${data.productUrl}">${data.productUrl}</a></p>
                            <p>Thanks for shopping with ${branding.storeName}!</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        })

        return { success: true }
    } catch (error) {
        console.error("Failed to send stock alert email:", error)
        return { success: false, error: "Failed to send email" }
    }
}
