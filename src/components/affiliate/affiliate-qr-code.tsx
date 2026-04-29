"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, Download } from "lucide-react"
import QRCodeLib from "qrcode"

export function AffiliateQRCode({ affiliateCode }: { affiliateCode: string }) {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
    const [customUrl, setCustomUrl] = useState("")
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const generateQRCode = async (url: string) => {
        if (!canvasRef.current) return

        try {
            await QRCodeLib.toCanvas(canvasRef.current, url, {
                width: 256,
                margin: 2,
                color: {
                    dark: "#000000",
                    light: "#FFFFFF",
                },
            })

            const dataUrl = canvasRef.current.toDataURL()
            setQrCodeUrl(dataUrl)
        } catch (error) {
            console.error("Error generating QR code:", error)
        }
    }

    useEffect(() => {
        // Generate default QR code for affiliate profile
        const defaultUrl = `${window.location.origin}/affiliate/${affiliateCode}`
        generateQRCode(defaultUrl)
    }, [affiliateCode])

    const handleGenerateCustom = () => {
        if (customUrl) {
            const urlWithReferral = customUrl.includes("?")
                ? `${customUrl}&referral=${affiliateCode}`
                : `${customUrl}?referral=${affiliateCode}`
            generateQRCode(urlWithReferral)
        }
    }

    const handleDownload = () => {
        if (!qrCodeUrl) return

        const link = document.createElement("a")
        link.download = `affiliate-qr-${affiliateCode}.png`
        link.href = qrCodeUrl
        link.click()
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    QR Code Generator
                </CardTitle>
                <CardDescription>
                    Generate QR codes with your affiliate code for easy sharing
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                    <canvas
                        ref={canvasRef}
                        className="border rounded-lg p-4 bg-white"
                    />

                    <Button onClick={handleDownload} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download QR Code
                    </Button>
                </div>

                <div className="space-y-3 pt-4 border-t">
                    <Label htmlFor="customUrl">Generate QR for Specific Product</Label>
                    <div className="flex gap-2">
                        <Input
                            id="customUrl"
                            type="text"
                            placeholder="e.g., /products/macbook-pro"
                            value={customUrl}
                            onChange={(e) => setCustomUrl(e.target.value)}
                        />
                        <Button onClick={handleGenerateCustom} variant="secondary">
                            Generate
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Enter a product URL to create a QR code that includes your affiliate code
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
