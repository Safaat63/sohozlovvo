"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createOrder } from "@/actions/orders"
import { validateCoupon } from "@/actions/admin-coupons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { validateBDPhoneNumber, validateEmail } from "@/lib/validation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { formatCurrency, useCurrencySymbol } from "@/components/providers/currency-provider"
import { BANGLADESH_DISTRICTS } from "@/lib/bangladesh-districts"

interface CartItem {
    id: string
    quantity: number
    product: {
        id: string
        name: string
        price: number
        rating?: number
        compareAtPrice?: number | null
        costPrice?: number | null
    }
    combinationId?: string | null
    combinationLabel?: string | null
    itemPrice: number
}

interface UserAddress {
    id: string
    name: string
    phone: string
    street: string
    city: string
    state?: string
    postalCode?: string
    country: string
    isDefault: boolean
}

interface CheckoutFormProps {
    cartItems: CartItem[]
    subtotal: number
    shippingCost: number
    total: number
    userEmail?: string
    userName?: string
    userPhone?: string
    userAddresses?: UserAddress[]
    loyaltyPoints?: number
}

export function CheckoutForm({
    cartItems,
    subtotal,
    shippingCost,
    total: initialTotal,
    userEmail,
    userName,
    userPhone,
    userAddresses = [],
    loyaltyPoints = 0,
}: CheckoutFormProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<string>("COD")
    const currency = useCurrencySymbol()
    const [phoneError, setPhoneError] = useState<string | null>(null)
    const [emailError, setEmailError] = useState<string | null>(null)
    const initialSelectedAddressId = userAddresses.find(addr => addr.isDefault)?.id || "new"
    const [selectedAddressId, setSelectedAddressId] = useState<string>(initialSelectedAddressId)

    // Address form state
    const [addressFormData, setAddressFormData] = useState(() => {
        const defaultAddress = userAddresses.find(addr => addr.id === initialSelectedAddressId)
        return defaultAddress
            ? {
                street: defaultAddress.street,
                city: defaultAddress.city,
                state: defaultAddress.state,
                postalCode: defaultAddress.postalCode,
            }
            : {
                street: "",
                city: "",
                state: "N/A",
                postalCode: "N/A",
            }
    })

    // Get referral code from URL if present
    const referralCode = searchParams.get("referral") || ""

    // Coupon state
    const [couponCode, setCouponCode] = useState("")
    const [couponError, setCouponError] = useState("")
    const [appliedCoupon, setAppliedCoupon] = useState<{
        id: string
        code: string
        discount: number
    } | null>(null)
    const [isPending, startTransition] = useTransition()

    // Loyalty points state
    const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false)
    const [pointsToUse, setPointsToUse] = useState(0)

    const discount = appliedCoupon?.discount || 0
    const loyaltyDiscount = useLoyaltyPoints ? pointsToUse : 0
    const total = Math.max(0, initialTotal - discount - loyaltyDiscount)

    async function handleApplyCoupon() {
        if (!couponCode.trim()) return

        setCouponError("")
        startTransition(async () => {
            const result = await validateCoupon(couponCode, subtotal)

            if (!result.valid) {
                setCouponError(result.error || "Invalid coupon")
                setAppliedCoupon(null)
            } else {
                setAppliedCoupon({
                    id: result.coupon!.id,
                    code: result.coupon!.code,
                    discount: result.discount!,
                })
            }
        })
    }

    function handleRemoveCoupon() {
        setAppliedCoupon(null)
        setCouponCode("")
        setCouponError("")
    }

    function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
        const phone = e.target.value
        if (phone && !validateBDPhoneNumber(phone)) {
            setPhoneError("Please enter a valid Bangladesh phone number (e.g., 01712345678)")
        } else {
            setPhoneError(null)
        }
    }

    function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
        const email = e.target.value
        if (email) {
            const result = validateEmail(email)
            if (!result.valid) {
                setEmailError(result.error || "Invalid email")
            } else {
                setEmailError(null)
            }
        } else {
            setEmailError(null)
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        // Check for validation errors before submitting
        if (phoneError || emailError) {
            setError("Please fix the validation errors before submitting")
            return
        }

        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)

        // Add coupon data to form
        if (appliedCoupon) {
            formData.set("couponId", appliedCoupon.id)
            formData.set("discount", appliedCoupon.discount.toString())
            formData.set("couponCode", appliedCoupon.code)
        }

        // Add loyalty points data to form
        if (useLoyaltyPoints && pointsToUse > 0) {
            formData.set("loyaltyPointsUsed", pointsToUse.toString())
            formData.set("loyaltyDiscount", loyaltyDiscount.toString())
        }

        // Add referral code to form
        if (referralCode) {
            formData.set("referralCode", referralCode)
        }

        const result = await createOrder(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else if (result?.success) {
            router.push(`/orders/${result.orderId}?new=true`)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            {error && (
                <div className="bg-destructive/15 dark:bg-red-950/40 p-3 text-sm text-destructive dark:text-red-400 border dark:border-red-800">
                    {error}
                </div>
            )}

            <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-2 md:space-y-3">
                    {/* Contact Information */}
                    <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow border-t-4 border-t-primary">
                        <CardHeader>
                            <CardTitle className="text-xl md:text-2xl dark:text-white flex items-center gap-2">
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pl-4 pr-4 md:pl-6 md:pr-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={userName}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={userEmail}
                                    required
                                    disabled={loading}
                                    onChange={handleEmailChange}
                                    className={emailError ? "border-red-500" : ""}
                                />
                                {emailError && (
                                    <p className="text-xs text-red-600 dark:text-red-400">{emailError}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="017XXXXXXXX"
                                    defaultValue={userPhone}
                                    required
                                    disabled={loading}
                                    onChange={handlePhoneChange}
                                    className={phoneError ? "border-red-500" : ""}
                                />
                                {phoneError && (
                                    <p className="text-xs text-red-600 dark:text-red-400">{phoneError}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Format: 01X XXXXXXXX (11, 12, 13, 14, 15, 16, 17, 18, or 19)
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow border-t-4 border-t-primary">
                        <CardHeader>
                            <CardTitle className="text-xl md:text-2xl dark:text-white flex items-center gap-2">
                                Shipping Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pl-4 pr-4 md:pl-6 md:pr-6 space-y-4">
                            {userAddresses.length > 0 && (
                                <div className="space-y-2">
                                    <Select
                                        value={selectedAddressId}
                                        onValueChange={(value) => {
                                            setSelectedAddressId(value)
                                            if (value === "new") {
                                                setAddressFormData({
                                                    street: "",
                                                    city: "",
                                                    state: "",
                                                    postalCode: "",
                                                })
                                                return
                                            }
                                            const address = userAddresses.find(addr => addr.id === value)
                                            if (address) {
                                                setAddressFormData({
                                                    street: address.street,
                                                    city: address.city,
                                                    state: address.state,
                                                    postalCode: address.postalCode,
                                                })
                                            }
                                        }}
                                        disabled={loading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Enter new address" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new">Enter new address</SelectItem>
                                            {userAddresses.map((addr) => (
                                                <SelectItem key={addr.id} value={addr.id}>
                                                    {addr.name} - {addr.street}, {addr.city}
                                                    {addr.isDefault && " (Default)"}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="street">Street Address *</Label>
                                <Input
                                    id="street"
                                    name="street"
                                    value={addressFormData.street}
                                    onChange={(e) => setAddressFormData({ ...addressFormData, street: e.target.value })}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">District (Zilla) *</Label>
                                    <Select
                                        name="city"
                                        value={addressFormData.city}
                                        onValueChange={(value) => setAddressFormData({ ...addressFormData, city: value })}
                                        disabled={loading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select district" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BANGLADESH_DISTRICTS.map((district) => (
                                                <SelectItem key={district} value={district}>
                                                    {district}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state" hidden>State/Division *</Label>
                                    <Input
                                        id="state"
                                        name="state"
                                        value={addressFormData.state}
                                        onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}
                                        required
                                        disabled={loading}
                                        hidden
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="postalCode" hidden>Postal Code *</Label>
                                <Input
                                    id="postalCode"
                                    name="postalCode"
                                    value={addressFormData.postalCode}
                                    onChange={(e) => setAddressFormData({ ...addressFormData, postalCode: e.target.value })}
                                    required
                                    disabled={loading}
                                    hidden
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Method */}
                    <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow border-t-4 border-t-primary">
                        <CardHeader>
                            <CardTitle className="text-xl md:text-2xl dark:text-white flex items-center gap-2">
                                Payment Method
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pl-4 pr-4 md:pl-6 md:pr-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="paymentMethod">Select Payment Method *</Label>
                                <Select
                                    name="paymentMethod"
                                    defaultValue="COD"
                                    onValueChange={setPaymentMethod}
                                    disabled={loading}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="COD">Cash on Delivery (COD)</SelectItem>
                                        <SelectItem value="BKASH">bKash</SelectItem>
                                        <SelectItem value="NAGAD">Nagad</SelectItem>
                                        <SelectItem value="ROCKET">Rocket</SelectItem>
                                        <SelectItem value="MANUAL">Send Money (Manual)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {paymentMethod !== "COD" && (
                                <div className="space-y-2">
                                    <Label htmlFor="transactionId">Transaction ID *</Label>
                                    <Input
                                        id="transactionId"
                                        name="transactionId"
                                        placeholder="Enter your transaction ID"
                                        required={paymentMethod !== "COD"}
                                        disabled={loading}
                                    />
                                    <p className="text-xs md:text-sm text-muted-foreground">
                                        {paymentMethod === "BKASH" && "Please send money to: 01XXXXXXXXX"}
                                        {paymentMethod === "NAGAD" && "Please send money to: 01XXXXXXXXX"}
                                        {paymentMethod === "ROCKET" && "Please send money to: 01XXXXXXXXX"}
                                        {paymentMethod === "MANUAL" && "Please send money and enter transaction ID"}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="notes">Order Notes (Optional)</Label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    className="w-full min-h-25 border border-input dark:border-gray-600 bg-background dark:bg-gray-900 px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="Any special instructions..."
                                    disabled={loading}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Summary Column */}
                <div className="space-y-4 md:space-y-5 lg:col-span-1">
                    <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-lg border-t-4 border-t-primary sticky top-4">
                        <CardHeader className="p-4 md:p-6 pb-3 bg-linear-to-r from-primary/5 to-transparent">
                            <CardTitle className="text-xl md:text-2xl dark:text-white flex items-center gap-2">
                                <span className="text-primary">🛒</span> Order Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 pt-0 space-y-3">
                            <div className="space-y-2">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex justify-between gap-3 text-xs md:text-sm">
                                        <div className="flex-1 min-w-0">
                                            <span className="block truncate font-medium">
                                                {item.product.name} × {item.quantity}
                                            </span>
                                            {item.combinationLabel && (
                                                <span className="block text-muted-foreground truncate">
                                                    {item.combinationLabel}
                                                </span>
                                            )}
                                        </div>
                                        <span className="shrink-0 font-semibold">
                                            {formatCurrency(item.itemPrice * item.quantity, currency)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Referral Info */}
                            {referralCode && (
                                <div className="pt-3 border-t dark:border-gray-700">
                                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/40 border dark:border-blue-800 rounded-md">
                                        <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div className="flex-1 text-sm">
                                            <span className="font-medium text-blue-700 dark:text-blue-400">
                                                Referred by affiliate code:
                                            </span>
                                            <code className="ml-2 font-mono bg-white dark:bg-gray-800 px-2 py-0.5 rounded text-blue-600 dark:text-blue-300">
                                                {referralCode}
                                            </code>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Coupon Code */}
                            <div className="pt-3 border-t dark:border-gray-700">
                                <Label htmlFor="couponCode">Coupon Code</Label>
                                {appliedCoupon ? (
                                    <div className="flex items-center justify-between mt-2 p-2 bg-green-50 dark:bg-green-950/40 border dark:border-green-800">
                                        <div className="text-sm">
                                            <span className="font-medium text-green-700 dark:text-green-400">
                                                {appliedCoupon.code}
                                            </span>
                                            <span className="text-green-600 dark:text-green-400 ml-2">
                                                -{formatCurrency(appliedCoupon.discount, currency)}
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleRemoveCoupon}
                                            disabled={loading}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2 mt-2">
                                        <Input
                                            id="couponCode"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            placeholder="Enter code"
                                            disabled={loading || isPending}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleApplyCoupon}
                                            disabled={loading || isPending || !couponCode.trim()}
                                        >
                                            {isPending ? "..." : "Apply"}
                                        </Button>
                                    </div>
                                )}
                                {couponError && (
                                    <p className="text-xs md:text-sm text-red-600 dark:text-red-400 mt-1">{couponError}</p>
                                )}
                            </div>

                            {/* Loyalty Points */}
                            {loyaltyPoints > 0 && (
                                <div className="pt-3 border-t dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <Label htmlFor="useLoyaltyPoints">Use Loyalty Points</Label>
                                        <span className="text-sm text-muted-foreground">
                                            Available: {loyaltyPoints}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="useLoyaltyPoints"
                                                checked={useLoyaltyPoints}
                                                onChange={(e) => {
                                                    setUseLoyaltyPoints(e.target.checked)
                                                    if (e.target.checked) {
                                                        const maxPoints = Math.min(loyaltyPoints, initialTotal - discount)
                                                        setPointsToUse(maxPoints)
                                                    } else {
                                                        setPointsToUse(0)
                                                    }
                                                }}
                                                className="h-4 w-4"
                                                disabled={loading}
                                            />
                                            <span className="text-sm">
                                                Redeem loyalty points (1 point = ৳1)
                                            </span>
                                        </div>
                                        {useLoyaltyPoints && (
                                            <div className="space-y-1">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max={Math.min(loyaltyPoints, initialTotal - discount)}
                                                    value={pointsToUse}
                                                    onChange={(e) => {
                                                        const value = parseInt(e.target.value) || 0
                                                        const maxPoints = Math.min(loyaltyPoints, initialTotal - discount)
                                                        setPointsToUse(Math.min(value, maxPoints))
                                                    }}
                                                    disabled={loading}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Max: {Math.min(loyaltyPoints, initialTotal - discount)} points
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="pt-3 border-t dark:border-gray-700 space-y-2 text-sm md:text-base">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-semibold">{formatCurrency(subtotal, currency)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Coupon Discount</span>
                                        <span>-{formatCurrency(discount, currency)}</span>
                                    </div>
                                )}
                                {loyaltyDiscount > 0 && (
                                    <div className="flex justify-between text-purple-600">
                                        <span>Loyalty Points ({pointsToUse} pts)</span>
                                        <span>-{formatCurrency(loyaltyDiscount, currency)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="font-semibold">
                                        {shippingCost === 0 ? "FREE" : formatCurrency(shippingCost, currency)}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-3 border-t-2 border-primary/20 bg-linear-to-r from-primary/5 to-transparent p-3 rounded-lg -mx-3">
                                    <span className="text-base md:text-lg font-bold">Total</span>
                                    <span className="text-xl md:text-3xl font-extrabold text-primary">{formatCurrency(total, currency)}</span>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-linear-to-r from-primary to-primary/90 hover:shadow-lg hover:shadow-primary/30 text-lg font-bold"
                                size="lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="animate-spin">⌛</span> Processing...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        🔒 Place Order Securely
                                    </span>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    )
}
