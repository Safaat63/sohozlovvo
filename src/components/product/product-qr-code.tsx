"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { QrCode, Download, Share2 } from "lucide-react"
import QRCode from "qrcode"

interface ProductQRCodeProps {
    productName: string
    productUrl: string
}

export function ProductQRCode({ productName, productUrl }: ProductQRCodeProps) {
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("")
    const [isOpen, setIsOpen] = useState(false)

    const generateQRCode = async () => {
        try {
            const fullUrl = `${window.location.origin}${productUrl}`
            const dataUrl = await QRCode.toDataURL(fullUrl, {
                width: 300,
                margin: 2,
                color: {
                    dark: "#000000",
                    light: "#FFFFFF",
                },
            })
            setQrCodeDataUrl(dataUrl)
        } catch (err) {
            console.error("Error generating QR code:", err)
        }
    }

    const handleOpen = (open: boolean) => {
        setIsOpen(open)
        if (open && !qrCodeDataUrl) {
            generateQRCode()
        }
    }

    const downloadQRCode = () => {
        if (!qrCodeDataUrl) return

        const link = document.createElement("a")
        link.download = `${productName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-qr-code.png`
        link.href = qrCodeDataUrl
        link.click()
    }

    const shareQRCode = async () => {
        const fullUrl = `${window.location.origin}${productUrl}`

        if (navigator.share) {
            try {
                await navigator.share({
                    title: productName,
                    text: `Check out ${productName}`,
                    url: fullUrl,
                })
            } catch (err) {
                console.log("Error sharing:", err)
            }
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(fullUrl)
            alert("Link copied to clipboard!")
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <QrCode className="h-4 w-4" />
                    <span className="hidden sm:inline">QR Code</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Product QR Code</DialogTitle>
                    <DialogDescription>
                        Scan this QR code to view the product on any device
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4">
                    {qrCodeDataUrl ? (
                        <>
                            <div className="rounded-lg border p-4 bg-white">
                                <Image
                                    src={qrCodeDataUrl}
                                    alt={`QR Code for ${productName}`}
                                    width={256}
                                    height={256}
                                    className="w-64 h-64"
                                    unoptimized
                                />
                            </div>
                            <p className="text-sm text-center text-muted-foreground">
                                {productName}
                            </p>
                            <div className="flex gap-2 w-full">
                                <Button
                                    onClick={downloadQRCode}
                                    className="flex-1 gap-2"
                                    variant="default"
                                >
                                    <Download className="h-4 w-4" />
                                    Download
                                </Button>
                                <Button
                                    onClick={shareQRCode}
                                    className="flex-1 gap-2"
                                    variant="outline"
                                >
                                    <Share2 className="h-4 w-4" />
                                    Share
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="w-64 h-64 flex items-center justify-center bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Generating QR Code...</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
