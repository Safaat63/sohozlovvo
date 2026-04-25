"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { uploadImage } from "@/actions/upload"
import { Upload, X, Loader2 } from "lucide-react"

interface ImageUploadProps {
    images: string[]
    onChange: (images: string[]) => void
    maxImages?: number
}

export function ImageUpload({ images, onChange, maxImages = 10 }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState("")
    const [urlInput, setUrlInput] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files?.length) return

        setIsUploading(true)
        setError("")

        const newImages: string[] = []

        for (const file of Array.from(files)) {
            if (images.length + newImages.length >= maxImages) {
                setError(`Maximum ${maxImages} images allowed`)
                break
            }

            const formData = new FormData()
            formData.set("file", file)

            const result = await uploadImage(formData)

            if (result.error) {
                setError(result.error)
            } else if (result.url) {
                newImages.push(result.url)
            }
        }

        if (newImages.length > 0) {
            onChange([...images, ...newImages])
        }

        setIsUploading(false)
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleUrlAdd = () => {
        if (!urlInput.trim()) return

        if (images.length >= maxImages) {
            setError(`Maximum ${maxImages} images allowed`)
            return
        }

        // Basic URL validation
        try {
            new URL(urlInput)
            if (!images.includes(urlInput)) {
                onChange([...images, urlInput])
            }
            setUrlInput("")
            setError("")
        } catch {
            setError("Invalid URL")
        }
    }

    const handleRemove = (index: number) => {
        onChange(images.filter((_, i) => i !== index))
    }

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData("text/plain", index.toString())
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault()
        const dragIndex = parseInt(e.dataTransfer.getData("text/plain"))

        if (dragIndex === dropIndex) return

        const newImages = [...images]
        const [draggedImage] = newImages.splice(dragIndex, 1)
        newImages.splice(dropIndex, 0, draggedImage)
        onChange(newImages)
    }

    return (
        <div className="space-y-4">
            {/* Upload Options */}
            <div className="flex flex-col gap-4 sm:flex-row">
                {/* File Upload */}
                <div className="flex-1">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        id="image-upload"
                    />
                    <label htmlFor="image-upload">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full cursor-pointer"
                            disabled={isUploading || images.length >= maxImages}
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
                                        Upload Images
                                    </>
                                )}
                            </span>
                        </Button>
                    </label>
                </div>

                {/* URL Input */}
                <div className="flex flex-1 gap-2">
                    <Input
                        placeholder="Or paste image URL"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault()
                                handleUrlAdd()
                            }
                        }}
                        disabled={images.length >= maxImages}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleUrlAdd}
                        disabled={!urlInput.trim() || images.length >= maxImages}
                    >
                        Add
                    </Button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}

            {/* Image Preview */}
            {images.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                        Drag to reorder. First image will be the main product image.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {images.map((url, index) => (
                            <div
                                key={`${url}-${index}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, index)}
                                className={`relative group rounded-lg border-2 overflow-hidden cursor-move ${index === 0 ? "border-blue-500" : "border-transparent"
                                    }`}
                            >
                                <Image
                                    src={url}
                                    alt={`Product ${index + 1}`}
                                    width={96}
                                    height={96}
                                    className="h-24 w-24 object-cover"
                                />
                                {index === 0 && (
                                    <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                                        Main
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleRemove(index)}
                                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Image Count */}
            <p className="text-sm text-muted-foreground">
                {images.length} / {maxImages} images
            </p>
        </div>
    )
}
