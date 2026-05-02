"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { SingleImageUpload } from "@/components/ui/single-image-upload"
import { createLandingPage, updateLandingPage } from "@/actions/admin-landing-pages"
import { getProducts } from "@/actions/products"
import { Plus, X, GripVertical, Trash2, Loader2 } from "lucide-react"
import { useEffect } from "react"

type Product = {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
}

type ImageReview = {
  imageUrl: string
  caption: string | null
}

type VideoReview = {
  videoUrl: string
  title: string | null
  thumbnail: string | null
}

type LandingPage = {
  id: string
  title: string
  slug: string
  description: string | null
  heroImage: string | null
  heroVideo: string | null
  metaTitle: string | null
  metaDescription: string | null
  customCss: string | null
  isActive: boolean
  isPublished: boolean
  products: {
    id: string
    product: Product
    order: number
  }[]
  imageReviews: {
    id: string
    imageUrl: string
    caption: string | null
    order: number
  }[]
  videoReviews: {
    id: string
    videoUrl: string
    title: string | null
    thumbnail: string | null
    order: number
  }[]
}

interface LandingPageFormProps {
  landingPage?: LandingPage
}

export function LandingPageForm({ landingPage }: LandingPageFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  const [heroImage, setHeroImage] = useState(landingPage?.heroImage || "")
  const [isActive, setIsActive] = useState(landingPage?.isActive ?? true)
  const [isPublished, setIsPublished] = useState(landingPage?.isPublished ?? false)

  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    landingPage?.products.map((p) => p.product.id) || []
  )
  const [productSearch, setProductSearch] = useState("")
  const [productSearchResults, setProductSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const [imageReviews, setImageReviews] = useState<ImageReview[]>(
    landingPage?.imageReviews.map((r) => ({
      imageUrl: r.imageUrl,
      caption: r.caption,
    })) || []
  )

  const [videoReviews, setVideoReviews] = useState<VideoReview[]>(
    landingPage?.videoReviews.map((r) => ({
      videoUrl: r.videoUrl,
      title: r.title,
      thumbnail: r.thumbnail,
    })) || []
  )

  useEffect(() => {
    const loadProducts = async () => {
      const result = await getProducts({ limit: 50 })
      if (result?.products) {
        const serializedProducts = result.products.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: Number(p.price),
          images: p.images || [],
        }))
        setProducts(serializedProducts)
      }
    }
    loadProducts()
  }, [])

  const handleProductSearch = async (query: string) => {
    setProductSearch(query)
    if (!query.trim()) {
      setProductSearchResults([])
      return
    }

    setIsSearching(true)
    const result = await getProducts({ search: query, limit: 10 })
    if (result?.products) {
      const serializedProducts = result.products.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        images: p.images || [],
      }))
      setProductSearchResults(serializedProducts)
    }
    setIsSearching(false)
  }

  const addProduct = (product: Product) => {
    if (!selectedProductIds.includes(product.id)) {
      setSelectedProductIds([...selectedProductIds, product.id])
      setProductSearch("")
      setProductSearchResults([])
    }
  }

  const removeProduct = (productId: string) => {
    setSelectedProductIds(selectedProductIds.filter((id) => id !== productId))
  }

  const addImageReview = () => {
    setImageReviews([...imageReviews, { imageUrl: "", caption: null }])
  }

  const updateImageReview = (index: number, field: keyof ImageReview, value: string) => {
    const updated = [...imageReviews]
    updated[index] = { ...updated[index], [field]: value }
    setImageReviews(updated)
  }

  const removeImageReview = (index: number) => {
    setImageReviews(imageReviews.filter((_, i) => i !== index))
  }

  const addVideoReview = () => {
    setVideoReviews([...videoReviews, { videoUrl: "", title: null, thumbnail: null }])
  }

  const updateVideoReview = (index: number, field: keyof VideoReview, value: string) => {
    const updated = [...videoReviews]
    updated[index] = { ...updated[index], [field]: value }
    setVideoReviews(updated)
  }

  const removeVideoReview = (index: number) => {
    setVideoReviews(videoReviews.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    const formData = new FormData(e.currentTarget)
    formData.set("heroImage", heroImage)
    formData.set("isActive", isActive.toString())
    formData.set("isPublished", isPublished.toString())
    formData.set("productIds", JSON.stringify(selectedProductIds))
    formData.set("imageReviews", JSON.stringify(imageReviews.filter((r) => r.imageUrl)))
    formData.set("videoReviews", JSON.stringify(videoReviews.filter((r) => r.videoUrl)))

    startTransition(async () => {
      let result
      if (landingPage) {
        result = await updateLandingPage(landingPage.id, formData)
      } else {
        result = await createLandingPage(formData)
      }

      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        router.push("/admin/landing-pages")
      }
    })
  }

  const selectedProducts = products.filter((p) => selectedProductIds.includes(p.id))

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600 border border-red-200">
          {error}
        </div>
      )}

      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>

        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            name="title"
            required
            defaultValue={landingPage?.title}
            placeholder="e.g., Premium Wireless Headphones"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            name="slug"
            required
            defaultValue={landingPage?.slug}
            placeholder="e.g., premium-wireless-headphones"
          />
          <p className="text-xs text-muted-foreground">
            This will be the URL: /lp/your-slug
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={landingPage?.description || ""}
            placeholder="Detailed product description (HTML supported)"
            rows={5}
          />
        </div>

        <div className="space-y-2">
          <Label>Hero Image</Label>
          <SingleImageUpload
            value={heroImage}
            onChange={setHeroImage}
            folder="landing-pages"
            previewSize={160}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="heroVideo">Hero Video URL (YouTube)</Label>
          <Input
            id="heroVideo"
            name="heroVideo"
            defaultValue={landingPage?.heroVideo || ""}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <p className="text-xs text-muted-foreground">
            Optional: Overrides hero image with a video player
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h3 className="text-lg font-semibold">SEO</h3>

        <div className="space-y-2">
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input
            id="metaTitle"
            name="metaTitle"
            defaultValue={landingPage?.metaTitle || ""}
            placeholder="SEO title (defaults to page title if empty)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Textarea
            id="metaDescription"
            name="metaDescription"
            defaultValue={landingPage?.metaDescription || ""}
            placeholder="SEO description"
            rows={2}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h3 className="text-lg font-semibold">Products</h3>
        <p className="text-sm text-muted-foreground">
          Select products to include on this landing page
        </p>

        <div className="space-y-2">
          <Label>Search Products</Label>
          <Input
            value={productSearch}
            onChange={(e) => handleProductSearch(e.target.value)}
            placeholder="Search by product name..."
          />
          {isSearching && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </div>
          )}
          {productSearchResults.length > 0 && (
            <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
              {productSearchResults
                .filter((p) => !selectedProductIds.includes(p.id))
                .map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addProduct(product)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left"
                  >
                    {product.images[0] && (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
            </div>
          )}
        </div>

        {selectedProducts.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Products ({selectedProducts.length})</Label>
            <div className="border rounded-lg divide-y">
              {selectedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  {product.images[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProduct(product.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Image Reviews</h3>
          <Button type="button" variant="outline" size="sm" onClick={addImageReview}>
            <Plus className="h-4 w-4 mr-1" />
            Add Image
          </Button>
        </div>

        {imageReviews.map((review, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Image #{index + 1}</span>
              <button
                type="button"
                onClick={() => removeImageReview(index)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </button>
            </div>
            <SingleImageUpload
              value={review.imageUrl}
              onChange={(url) => updateImageReview(index, "imageUrl", url)}
              folder="landing-pages/reviews"
              previewSize={80}
            />
            <Input
              value={review.caption || ""}
              onChange={(e) => updateImageReview(index, "caption", e.target.value)}
              placeholder="Caption (optional)"
            />
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Video Reviews</h3>
          <Button type="button" variant="outline" size="sm" onClick={addVideoReview}>
            <Plus className="h-4 w-4 mr-1" />
            Add Video
          </Button>
        </div>

        {videoReviews.map((review, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Video #{index + 1}</span>
              <button
                type="button"
                onClick={() => removeVideoReview(index)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </button>
            </div>
            <Input
              value={review.videoUrl}
              onChange={(e) => updateVideoReview(index, "videoUrl", e.target.value)}
              placeholder="YouTube video URL"
            />
            <Input
              value={review.title || ""}
              onChange={(e) => updateVideoReview(index, "title", e.target.value)}
              placeholder="Video title (optional)"
            />
            <SingleImageUpload
              value={review.thumbnail || ""}
              onChange={(url) => updateVideoReview(index, "thumbnail", url)}
              folder="landing-pages/video-thumbnails"
              previewSize={80}
              placeholder="Thumbnail (auto from YouTube if empty)"
            />
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h3 className="text-lg font-semibold">Settings</h3>

        <div className="flex items-center gap-2">
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="isActive" className="cursor-pointer">
            Active
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="isPublished"
            checked={isPublished}
            onCheckedChange={setIsPublished}
          />
          <Label htmlFor="isPublished" className="cursor-pointer">
            Published (visible to customers)
          </Label>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Saving..."
            : landingPage
            ? "Update Landing Page"
            : "Create Landing Page"}
        </Button>
        <Link href="/admin/landing-pages">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  )
}
