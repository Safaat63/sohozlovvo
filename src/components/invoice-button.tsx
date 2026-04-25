"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { formatDateDhaka } from "@/lib/utils"
import QRCode from "qrcode"
import { parseVariationDetails } from "@/lib/variant-utils"

// Currency symbol - using BDT for better PDF compatibility
// Using Hind Siliguri font for Bengali character support
const CURRENCY = "BDT "

// Cache font so we only load once per session
let cachedHindFontBase64: string | null = null

async function loadHindSiliguriFont(): Promise<string> {
    if (cachedHindFontBase64) return cachedHindFontBase64

    // Fetch TTF from public/fonts and convert to base64 in browser
    const res = await fetch("/fonts/HindSiliguri-Regular.ttf")
    if (!res.ok) {
        throw new Error("Failed to load Hind Siliguri font")
    }
    const buffer = await res.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)

    // Convert to base64
    let binary = ""
    for (let i = 0; i < uint8Array.byteLength; i++) {
        binary += String.fromCharCode(uint8Array[i])
    }
    cachedHindFontBase64 = btoa(binary)
    return cachedHindFontBase64
}

interface OrderItem {
    name: string
    quantity: number
    price: string
    sku?: string | null
    variationDetails?: string | null
    image?: string | null
}

interface OrderData {
    orderNumber: string
    createdAt: string
    customerName: string
    customerEmail: string
    customerPhone?: string | null
    shippingAddress?: string | null
    items: OrderItem[]
    subtotal: string
    shippingCost: string
    tax: string
    discount: string
    total: string
    paymentMethod: string
    paymentStatus: string
    couponCode?: string | null
}

interface InvoiceButtonProps {
    order: OrderData
}

export function InvoiceButton({ order }: InvoiceButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false)

    const generateInvoice = async () => {
        setIsGenerating(true)

        try {
            const doc = new jsPDF()

            // Add Hind Siliguri font for Bengali character support
            const hindFont = await loadHindSiliguriFont()
            doc.addFileToVFS("HindSiliguri-Regular.ttf", hindFont)
            doc.addFont("HindSiliguri-Regular.ttf", "HindSiliguri", "normal")
            doc.setFont("HindSiliguri")

            // Add subtle background color
            doc.setFillColor(250, 250, 252) // Very light gray/blue
            doc.rect(0, 0, 210, 297, 'F')

            // Header with modern design
            doc.setFillColor(30, 58, 138) // Deep blue background
            doc.rect(0, 0, 210, 50, 'F')

            doc.setFontSize(28)
            doc.setTextColor(255, 255, 255) // White text
            doc.setFont("HindSiliguri", "normal")
            doc.text("Abru Life Style", 14, 22)

            doc.setFontSize(11)
            doc.setTextColor(203, 213, 225) // Light gray text
            doc.text("Abru Life Style", 14, 30)
            doc.setFontSize(9)
            doc.text("lifestyleabru@gmail.com | +8801974540281", 14, 36)

            // Invoice Title - Top right
            doc.setFontSize(20)
            doc.setTextColor(255, 255, 255)
            doc.text("INVOICE", 196, 22, { align: "right" })

            doc.setFontSize(11)
            doc.setTextColor(203, 213, 225)
            doc.text(`#${order.orderNumber}`, 196, 30, { align: "right" })

            // Order Info Section with card-like design
            doc.setFillColor(255, 255, 255) // White card
            doc.setDrawColor(226, 232, 240) // Light border
            doc.setLineWidth(0.5)
            doc.roundedRect(14, 58, 182, 28, 2, 2, 'FD')

            doc.setFontSize(10)
            doc.setTextColor(51, 65, 85) // Dark gray
            doc.setFont("HindSiliguri", "normal")
            doc.text("Order Date:", 18, 67)
            doc.setTextColor(71, 85, 105)
            doc.text(formatDateDhaka(order.createdAt, "MMMM d, yyyy"), 50, 67)

            doc.setTextColor(51, 65, 85)
            doc.text("Payment Status:", 18, 74)
            const statusColor = order.paymentStatus === "PAID"
                ? { r: 34, g: 197, b: 94 }  // Green
                : { r: 239, g: 68, b: 68 }   // Red
            doc.setTextColor(statusColor.r, statusColor.g, statusColor.b)
            doc.setFont("HindSiliguri", "normal")
            doc.text(order.paymentStatus, 55, 74)

            doc.setTextColor(51, 65, 85)
            doc.setFont("HindSiliguri", "normal")
            doc.text("Payment Method:", 18, 81)
            doc.setTextColor(71, 85, 105)
            doc.text(order.paymentMethod.replace("_", " "), 60, 81)

            // Bill To and Ship To sections side by side with cards
            // Bill To Card
            doc.setFillColor(255, 255, 255)
            doc.setDrawColor(226, 232, 240)
            doc.roundedRect(14, 94, 85, 42, 2, 2, 'FD')

            doc.setFontSize(12)
            doc.setTextColor(30, 58, 138) // Blue
            doc.setFont("HindSiliguri", "normal")
            doc.text("Bill To", 18, 102)

            doc.setFontSize(10)
            doc.setTextColor(15, 23, 42) // Almost black
            doc.text(order.customerName || "N/A", 18, 110)
            doc.setTextColor(71, 85, 105)
            doc.setFontSize(9)
            doc.text(order.customerEmail || "N/A", 18, 117)
            if (order.customerPhone) {
                doc.text(order.customerPhone, 18, 124)
            }

            // Shipping Address Card
            if (order.shippingAddress) {
                doc.setFillColor(255, 255, 255)
                doc.setDrawColor(226, 232, 240)
                doc.roundedRect(111, 94, 85, 42, 2, 2, 'FD')

                doc.setFontSize(12)
                doc.setTextColor(30, 58, 138) // Blue
                doc.setFont("HindSiliguri", "normal")
                doc.text("Ship To", 115, 102)

                doc.setFontSize(9)
                doc.setTextColor(71, 85, 105)
                const addressLines = order.shippingAddress.split("\n")
                let addressY = 110
                addressLines.forEach((line) => {
                    if (addressY <= 132) { // Prevent overflow
                        doc.text(line.trim(), 115, addressY)
                        addressY += 6
                    }
                })
            }

            // Generate QR Code for website
            const websiteUrl = 'https://supernalwear.com'
            const qrCodeDataUrl = await QRCode.toDataURL(websiteUrl, {
                width: 200,
                margin: 1,
                color: {
                    dark: '#1e3a8a',
                    light: '#ffffff'
                }
            })

            // Add QR code to top right of bill section
            doc.addImage(qrCodeDataUrl, 'PNG', 169, 60, 24, 24)
            doc.setFontSize(7)
            doc.setTextColor(71, 85, 105)
            doc.text('Scan to visit', 181, 86, { align: 'center' })

            // Items Table with modern styling
            const tableData = order.items.map((item) => {
                const variations = item.variationDetails ? parseVariationDetails(item.variationDetails) : []
                const variationText = variations.length > 0
                    ? `\n(${variations.map(v => `${v.type}: ${v.value}`).join(', ')})`
                    : ''
                return [
                    item.name + variationText,
                    item.sku || "-",
                    item.quantity.toString(),
                    `${CURRENCY}${parseFloat(item.price).toFixed(2)}`,
                    `${CURRENCY}${(item.quantity * parseFloat(item.price)).toFixed(2)}`,
                ]
            })

            autoTable(doc, {
                startY: 144,
                head: [["Product", "SKU", "Qty", "Unit Price", "Total"]],
                body: tableData,
                theme: "plain",
                headStyles: {
                    fillColor: [30, 58, 138], // Deep blue
                    textColor: [255, 255, 255], // White
                    fontStyle: "normal",
                    font: "HindSiliguri",
                    fontSize: 10,
                    cellPadding: { top: 6, right: 5, bottom: 6, left: 5 },
                },
                styles: {
                    fontSize: 9,
                    cellPadding: { top: 5, right: 5, bottom: 5, left: 5 },
                    font: "HindSiliguri",
                    textColor: [51, 65, 85],
                    lineColor: [226, 232, 240],
                    lineWidth: 0.5,
                },
                alternateRowStyles: {
                    fillColor: [248, 250, 252], // Very light gray
                },
                columnStyles: {
                    0: { cellWidth: 70 },
                    1: { cellWidth: 30 },
                    2: { cellWidth: 20, halign: "center" },
                    3: { cellWidth: 35, halign: "right" },
                    4: { cellWidth: 35, halign: "right" },
                },
            })

            // Summary Section with modern card design
            const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8

            // Summary card background
            doc.setFillColor(255, 255, 255)
            doc.setDrawColor(226, 232, 240)
            doc.roundedRect(125, finalY, 71, 50, 2, 2, 'FD')

            const summaryX = 130
            let summaryY = finalY + 8

            doc.setFontSize(10)
            doc.setTextColor(71, 85, 105)
            doc.setFont("HindSiliguri", "normal")
            doc.text("Subtotal:", summaryX, summaryY)
            doc.setTextColor(51, 65, 85)
            doc.text(`${CURRENCY}${parseFloat(order.subtotal).toFixed(2)}`, 191, summaryY, { align: "right" })

            summaryY += 7
            doc.setTextColor(71, 85, 105)
            doc.text("Shipping:", summaryX, summaryY)
            doc.setTextColor(51, 65, 85)
            doc.text(`${CURRENCY}${parseFloat(order.shippingCost).toFixed(2)}`, 191, summaryY, { align: "right" })

            if (parseFloat(order.tax) > 0) {
                summaryY += 7
                doc.setTextColor(71, 85, 105)
                doc.text("Tax:", summaryX, summaryY)
                doc.setTextColor(51, 65, 85)
                doc.text(`${CURRENCY}${parseFloat(order.tax).toFixed(2)}`, 191, summaryY, { align: "right" })
            }

            if (parseFloat(order.discount) > 0) {
                summaryY += 7
                doc.setTextColor(34, 197, 94) // Green for discount
                doc.text("Discount:", summaryX, summaryY)
                doc.text(`-${CURRENCY}${parseFloat(order.discount).toFixed(2)}`, 191, summaryY, { align: "right" })
                if (order.couponCode) {
                    summaryY += 5
                    doc.setFontSize(8)
                    doc.setTextColor(71, 85, 105)
                    doc.text(`(Coupon: ${order.couponCode})`, summaryX, summaryY)
                    doc.setFontSize(10)
                }
            }

            summaryY += 9
            doc.setDrawColor(226, 232, 240)
            doc.setLineWidth(1)
            doc.line(summaryX, summaryY, 191, summaryY)

            summaryY += 7
            doc.setFillColor(30, 58, 138) // Blue background for total
            doc.roundedRect(summaryX - 3, summaryY - 6, 64, 10, 1, 1, 'F')

            doc.setFontSize(12)
            doc.setTextColor(255, 255, 255) // White text
            doc.setFont("HindSiliguri", "normal")
            doc.text("Total:", summaryX, summaryY)
            doc.text(`${CURRENCY}${parseFloat(order.total).toFixed(2)}`, 191, summaryY, { align: "right" })

            // Footer with subtle styling
            doc.setFillColor(248, 250, 252)
            doc.rect(0, 270, 210, 27, 'F')

            doc.setFont("HindSiliguri", "normal")
            doc.setFontSize(10)
            doc.setTextColor(30, 58, 138)
            doc.text("Thank you for shopping with Abru Life Style!", 105, 278, { align: "center" })

            doc.setFontSize(9)
            doc.setTextColor(100, 116, 139)
            doc.text("For any questions, contact us at lifestyleabru@gmail.com", 105, 284, { align: "center" })

            // Save the PDF
            doc.save(`Invoice-${order.orderNumber}.pdf`)
        } catch (error) {
            console.error("Error generating invoice:", error)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <Button onClick={generateInvoice} disabled={isGenerating} variant="outline">
            {isGenerating ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <Download className="mr-2 h-4 w-4" />
                    Invoice
                </>
            )}
        </Button>
    )
}
