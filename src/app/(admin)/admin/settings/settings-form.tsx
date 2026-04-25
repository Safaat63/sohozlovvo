"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogoUpload } from "@/components/logo-upload"
import { updateSettings } from "@/actions/admin-settings"
import { Store, Mail, Phone, MapPin, DollarSign, Truck, Globe, Share2 } from "lucide-react"

interface SettingsFormProps {
    settings: Record<string, string>
}

export function SettingsForm({ settings }: SettingsFormProps) {
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const [logoUrl, setLogoUrl] = useState(settings.logo_url || "")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        // Add logo URL to form data
        formData.set("logo_url", logoUrl)

        startTransition(async () => {
            const result = await updateSettings(formData)

            if (result.error) {
                setMessage({ type: "error", text: result.error })
            } else {
                setMessage({ type: "success", text: "Settings updated successfully!" })
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
                <div
                    className={`rounded-lg p-4 ${message.type === "success"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                >
                    {message.text}
                </div>
            )}

            {/* Store Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        Store Information
                    </CardTitle>
                    <CardDescription>
                        Basic information about your store
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="store_name">Store Name</Label>
                        <Input
                            id="store_name"
                            name="store_name"
                            defaultValue={settings.store_name || "Sohozlovvo"}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="store_email">
                            <Mail className="h-4 w-4 inline mr-1" />
                            Store Email
                        </Label>
                        <Input
                            id="store_email"
                            name="store_email"
                            type="email"
                            defaultValue={settings.store_email || ""}
                            placeholder="contact@yourstore.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="store_phone">
                            <Phone className="h-4 w-4 inline mr-1" />
                            Store Phone
                        </Label>
                        <Input
                            id="store_phone"
                            name="store_phone"
                            defaultValue={settings.store_phone || ""}
                            placeholder="+880 1234567890"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="store_address">
                            <MapPin className="h-4 w-4 inline mr-1" />
                            Store Address
                        </Label>
                        <textarea
                            id="store_address"
                            name="store_address"
                            rows={3}
                            defaultValue={settings.store_address || ""}
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            placeholder="Enter your store address"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Store Logo</Label>
                        <LogoUpload value={logoUrl} onChange={setLogoUrl} />
                    </div>
                </CardContent>
            </Card>

            {/* Pricing & Shipping */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Pricing & Shipping
                    </CardTitle>
                    <CardDescription>
                        Configure pricing and shipping settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="currency_symbol">Currency Symbol</Label>
                        <Input
                            id="currency_symbol"
                            name="currency_symbol"
                            defaultValue={settings.currency_symbol || "৳"}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                        <Input
                            id="tax_rate"
                            name="tax_rate"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={settings.tax_rate || "0"}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="shipping_cost">
                            <Truck className="h-4 w-4 inline mr-1" />
                            Default Shipping Cost
                        </Label>
                        <Input
                            id="shipping_cost"
                            name="shipping_cost"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={settings.shipping_cost || "0"}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="free_shipping_threshold">Free Shipping Threshold</Label>
                        <Input
                            id="free_shipping_threshold"
                            name="free_shipping_threshold"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={settings.free_shipping_threshold || "0"}
                            placeholder="0 = no Free Shipping"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="order_prefix">Order Number Prefix</Label>
                        <Input
                            id="order_prefix"
                            name="order_prefix"
                            defaultValue={settings.order_prefix || "ORD"}
                            placeholder="ORD"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        SEO Settings
                    </CardTitle>
                    <CardDescription>
                        Configure search engine optimization settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="meta_title">Meta Title</Label>
                        <Input
                            id="meta_title"
                            name="meta_title"
                            defaultValue={settings.meta_title || ""}
                            placeholder="Your Store - Best Products Online"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="meta_description">Meta Description</Label>
                        <textarea
                            id="meta_description"
                            name="meta_description"
                            rows={3}
                            defaultValue={settings.meta_description || ""}
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            placeholder="A brief description of your store for search engines"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5" />
                        Social Media
                    </CardTitle>
                    <CardDescription>
                        Link your social media accounts
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="facebook_url">Facebook URL</Label>
                        <Input
                            id="facebook_url"
                            name="facebook_url"
                            type="url"
                            defaultValue={settings.facebook_url || ""}
                            placeholder="https://facebook.com/yourstore"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="instagram_url">Instagram URL</Label>
                        <Input
                            id="instagram_url"
                            name="instagram_url"
                            type="url"
                            defaultValue={settings.instagram_url || ""}
                            placeholder="https://instagram.com/yourstore"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="twitter_url">Twitter/X URL</Label>
                        <Input
                            id="twitter_url"
                            name="twitter_url"
                            type="url"
                            defaultValue={settings.twitter_url || ""}
                            placeholder="https://twitter.com/yourstore"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                        <Input
                            id="whatsapp_number"
                            name="whatsapp_number"
                            defaultValue={settings.whatsapp_number || ""}
                            placeholder="+8801234567890"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={isPending} size="lg">
                    {isPending ? "Saving..." : "Save Settings"}
                </Button>
            </div>
        </form>
    )
}
