"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { uploadImage } from "@/actions/upload"
import { Upload, X, Loader2, User } from "lucide-react"

interface SingleImageUploadProps {
    value: string
    onChange: (url: string) => void
    name?: string
    placeholder?: string
    className?: string
    showPreview?: boolean
    previewSize?: number
    isAvatar?: boolean
    folder?: string
}

export function SingleImageUpload({
    value,
    onChange,
    name,
    placeholder = "Upload an image",
    className = "",
    showPreview = true,
    previewSize = 96,
    isAvatar = false,
    folder = "e-commerce/products",
}: SingleImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        setError("")

        const formData = new FormData()
        formData.set("file", file)

        const result = await uploadImage(formData, folder)

        if (result.error) {
            setError(result.error)
        } else if (result.url) {
            onChange(result.url)
        }

        setIsUploading(false)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleRemove = () => {
        onChange("")
        setError("")
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Hidden input for form submission */}
            {name && <input type="hidden" name={name} value={value} />}

            {/* File input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
                id={`single-image-upload-${name || 'default'}`}
            />

            {/* Preview & Upload Area */}
            {showPreview && value ? (
                <div className="relative inline-block">
                    <div
                        className={`relative overflow-hidden bg-gray-100 ${isAvatar ? 'rounded-full' : 'rounded-lg'}`}
                        style={{ width: previewSize, height: previewSize }}
                    >
                        <Image
                            src={value}
                            alt="Uploaded image"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={handleRemove}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            ) : showPreview && isAvatar ? (
                <div
                    className="relative overflow-hidden bg-gray-100 rounded-full flex items-center justify-center"
                    style={{ width: previewSize, height: previewSize }}
                >
                    <User className="w-1/2 h-1/2 text-gray-400" />
                </div>
            ) : null}

            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4" />
                            {value ? "Change Image" : placeholder}
                        </>
                    )}
                </Button>

                {value && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemove}
                        className="text-red-600 hover:text-red-700"
                    >
                        Remove
                    </Button>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    )
}
