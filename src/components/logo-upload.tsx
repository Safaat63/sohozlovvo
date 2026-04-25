"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { uploadImage } from "@/actions/upload"
import { Upload, X, Loader2 } from "lucide-react"

interface LogoUploadProps {
    value: string
    onChange: (url: string) => void
}

export function LogoUpload({ value, onChange }: LogoUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState("")
    const [urlInput, setUrlInput] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        setError("")

        const formData = new FormData()
        formData.set("file", file)

        const result = await uploadImage(formData)

        if (result.error) {
            setError(result.error)
        } else if (result.url) {
            onChange(result.url)
            setUrlInput("")
        }

        setIsUploading(false)
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleUrlAdd = () => {
        if (!urlInput.trim()) return

        // Basic URL validation
        try {
            new URL(urlInput)
            onChange(urlInput)
            setUrlInput("")
            setError("")
        } catch {
            setError("Invalid URL")
        }
    }

    return (
        <div className="space-y-4">
            {/* Upload Options */}
            <div className="flex flex-col gap-3 sm:flex-row">
                {/* File Upload */}
                <div className="flex-1">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/svg+xml"
                        onChange={handleFileChange}
                        className="hidden"
                        id="logo-upload"
                    />
                    <label htmlFor="logo-upload">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full cursor-pointer"
                            disabled={isUploading}
                            asChild
                        >
                            <span>
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Logo
                                    </>
                                )}
                            </span>
                        </Button>
                    </label>
                </div>

                {/* URL Input */}
                <div className="flex flex-1 gap-2">
                    <Input
                        placeholder="Or paste logo URL"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault()
                                handleUrlAdd()
                            }
                        }}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleUrlAdd}
                        disabled={!urlInput.trim()}
                    >
                        Add
                    </Button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            {/* Logo Preview */}
            {value && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Current Logo:</p>
                    <div className="relative inline-block p-4 border border-border rounded-lg bg-muted">
                        <Image
                            src={value}
                            alt="Store Logo"
                            width={150}
                            height={60}
                            className="h-auto max-h-20 object-contain"
                        />
                        <button
                            type="button"
                            onClick={() => onChange("")}
                            className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                            title="Remove logo"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
