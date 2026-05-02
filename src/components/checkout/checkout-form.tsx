"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createOrder } from "@/actions/orders"
import { removeCartItem, updateCartItemQuantity } from "@/actions/cart"
import { validateCoupon } from "@/actions/admin-coupons"
import { validateBDPhoneNumber, validateEmail } from "@/lib/validation"
import { formatCurrency, useCurrencySymbol } from "@/components/providers/currency-provider"
import { BANGLADESH_DISTRICTS } from "@/lib/bangladesh-districts"
import { Trash2, ChevronDown, ChevronUp, Check, CreditCard } from "lucide-react"
import districtsData from "@/lib/bangladesh-geojson/bd-districts.json"
import upazilasData from "@/lib/bangladesh-geojson/bd-upazilas.json"
import { trackBeginCheckout } from "@/lib/ga4"

interface CartItem {
    id: string
    quantity: number
    product: {
        id: string
        name: string
        price: number
        image?: string
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
    thana?: string
    country: string
    isDefault: boolean
}

interface CheckoutFormProps {
    cartItems: CartItem[]
    subtotal: number
    shippingCost: number
    total: number
    isLoggedIn?: boolean
    userName?: string
    userPhone?: string
    userEmail?: string
    userAddresses?: UserAddress[]
}

const SectionHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-2 mb-3">
        <div className="w-[3px] h-4 bg-[#f48721] rounded-sm"></div>
        <h2 className="text-[14px] md:text-[16px] font-semibold text-black">{title}</h2>
    </div>
)

export function CheckoutForm({
    cartItems,
    subtotal,
    shippingCost,
    total: initialTotal,
    isLoggedIn,
    userName,
    userPhone,
    userEmail,
    userAddresses = [],
}: CheckoutFormProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currency = useCurrencySymbol()
    const beginCheckoutRef = useRef(false)

    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<string>("COD")
    const [phoneError, setPhoneError] = useState<string | null>(null)
    const [cartUpdatingId, setCartUpdatingId] = useState<string | null>(null)
    const [touched, setTouched] = useState<Record<string, boolean>>({})
    const [transactionId, setTransactionId] = useState("")

    const initialSelectedAddressId = userAddresses.find(addr => addr.isDefault)?.id || "new"
    const [addressFormData, setAddressFormData] = useState(() => {
        const defaultAddress = userAddresses.find(addr => addr.id === initialSelectedAddressId)
        return defaultAddress
            ? {
                name: userName || "",
                email: userEmail || "",
                phone: userPhone?.replace(/^(\+?88)?/, '') || "",
                street: defaultAddress.street,
                city: defaultAddress.city,
                thana: defaultAddress.thana || "",
                state: "",
                postalCode: "",
            }
            : {
                name: userName || "",
                email: userEmail || "",
                phone: userPhone?.replace(/^(\+?88)?/, '') || "",
                street: "",
                city: "",
                thana: "",
                state: "",
                postalCode: "",
            }
    })

    const fieldErrors: Record<string, string> = {}
    if (touched.name && addressFormData.name.trim().length < 2) {
        fieldErrors.name = "Please enter your full name (at least 2 characters)"
    }
    if (touched.email && addressFormData.email) {
        const emailResult = validateEmail(addressFormData.email)
        if (!emailResult.valid) fieldErrors.email = "Please enter a valid email address"
    }
    if (touched.phone && addressFormData.phone) {
        if (addressFormData.phone.length !== 11) {
            fieldErrors.phone = "Please enter a valid phone number (01XXXXXXXXX)"
        } else if (!validateBDPhoneNumber(addressFormData.phone)) {
            fieldErrors.phone = "Invalid phone number format"
        }
    }
    if (touched.street && addressFormData.street.trim().length < 5) {
        fieldErrors.street = "Please enter your complete address (at least 5 characters)"
    }
    if (touched.city && addressFormData.city.trim().length < 2) {
        fieldErrors.city = "Please enter your city name"
    }
    if (touched.transactionId && paymentMethod !== "COD" && paymentMethod !== "CARD" && !transactionId.trim()) {
        fieldErrors.transactionId = "Transaction ID is required"
    }

    const [isCouponOpen, setIsCouponOpen] = useState(false)
    const [termsAccepted, setTermsAccepted] = useState(false)

    const referralCode = searchParams.get("referral") || ""
    const [couponCode, setCouponCode] = useState("")
    const [couponError, setCouponError] = useState("")
    const [appliedCoupon, setAppliedCoupon] = useState<{ id: string, code: string, discount: number } | null>(null)
    const [isPending, startTransition] = useTransition()

    const discount = appliedCoupon?.discount || 0
    const total = Math.max(0, initialTotal - discount)

    useEffect(() => {
        if (beginCheckoutRef.current) return
        beginCheckoutRef.current = true
        trackBeginCheckout(
            cartItems.map((item) => ({
                item_id: item.product.id,
                item_name: item.product.name,
                price: item.itemPrice,
                quantity: item.quantity,
                item_variant: item.combinationLabel || undefined,
            })),
            total
        )
    }, [cartItems, total])

    const districtIdByName = useMemo(() => {
        const map = new Map<string, string>()
        districtsData.districts.forEach((district) => {
            map.set(district.name, district.id)
        })
        return map
    }, [])

    const selectedDistrictId = districtIdByName.get(addressFormData.city)
    const thanaOptions = useMemo(() => {
        if (!selectedDistrictId) return []
        return upazilasData.upazilas
            .filter((upazila) => upazila.district_id === selectedDistrictId)
            .map((upazila) => upazila.name)
    }, [selectedDistrictId])
    const thanaOptionsWithOther = useMemo(() => {
        const unique = new Set(thanaOptions)
        unique.add("Other")
        return Array.from(unique)
    }, [thanaOptions])

    function handleApplyCoupon() {
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

    function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
        let cleaned = e.target.value.replace(/\D/g, "")

        if (cleaned.startsWith("8801")) {
            cleaned = `0${cleaned.slice(3)}`
        } else if (cleaned.startsWith("1") && cleaned.length === 10) {
            cleaned = `0${cleaned}`
        }

        cleaned = cleaned.slice(0, 11)
        setAddressFormData(prev => ({ ...prev, phone: cleaned }))

        if (cleaned.length === 11 && !validateBDPhoneNumber(cleaned)) {
            setPhoneError("Invalid format")
        } else {
            setPhoneError(null)
        }
    }

    function handleCartQuantityChange(itemId: string, nextQuantity: number) {
        if (nextQuantity < 0) return
        setError(null)
        setCartUpdatingId(itemId)
        startTransition(async () => {
            const result = await updateCartItemQuantity(itemId, nextQuantity)
            if (result?.error) setError(result.error)
            else router.refresh()
            setCartUpdatingId(null)
        })
    }

    function handleRemoveCartItem(itemId: string) {
        setError(null)
        setCartUpdatingId(itemId)
        startTransition(async () => {
            const result = await removeCartItem(itemId)
            if (result?.error) setError(result.error)
            else router.refresh()
            setCartUpdatingId(null)
        })
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (!termsAccepted) {
            setError("Please agree to the Terms and Conditions to proceed.")
            return
        }

        setTouched({ name: true, email: true, phone: true, street: true, city: true, transactionId: true })

        if (!addressFormData.name.trim() || addressFormData.name.trim().length < 2) return
        if (isLoggedIn && addressFormData.email && !validateEmail(addressFormData.email).valid) return
        if (!validateBDPhoneNumber(addressFormData.phone)) return
        if (addressFormData.street.trim().length < 5) return
        if (addressFormData.city.trim().length < 2) return
        if (paymentMethod !== "COD" && paymentMethod !== "CARD" && !transactionId.trim()) return

        setError(null)

        const formData = new FormData(e.currentTarget)

        setLoading(true)

        formData.set("phone", addressFormData.phone)
        formData.set("name", addressFormData.name)
        formData.set("email", addressFormData.email)
        formData.set("street", addressFormData.street)
        formData.set("city", addressFormData.city)
        formData.set("state", addressFormData.state)
        formData.set("postalCode", addressFormData.postalCode)
        formData.set("subtotal", subtotal.toString())
        formData.set("shippingCost", shippingCost.toString())
        formData.set("total", total.toString())

        if (addressFormData.thana) formData.set("thana", addressFormData.thana)
        if (transactionId.trim()) formData.set("transactionId", transactionId.trim())

        if (appliedCoupon) {
            formData.set("couponId", appliedCoupon.id)
            formData.set("discount", appliedCoupon.discount.toString())
            formData.set("couponCode", appliedCoupon.code)
        }

        if (referralCode) formData.set("referralCode", referralCode)

        const result = await createOrder(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else if (result?.success) {
            router.push(`/orders/${result.orderId}?new=true`)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-360 mx-auto">
            {!isLoggedIn && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2 rounded-lg border border-black">
                    <p className="text-black text-[12px] md:text-[16px] font-semibold mb-2 sm:mb-0">
                        Have any account? please login or register
                    </p>
                    <div className="flex items-center gap-2">
                        <Link href="/login" className="px-5 py-1.5 text-sm font-medium border border-[#f48721] rounded hover:bg-gray-50 transition-colors">
                            Login
                        </Link>
                        <Link href="/register" className="px-5 py-1.5 text-sm font-medium bg-[#f48721] text-white rounded hover:bg-[#ea580c] transition-colors">
                            Register
                        </Link>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 p-3 text-sm text-red-600 border border-red-200 rounded-lg">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-7 space-y-4">
                    <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                        <SectionHeader title="Order review" />
                        <div className="space-y-3">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-2 rounded-md">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 md:w-14 md:h-14 bg-gray-50 rounded border border-black flex items-center justify-center overflow-hidden shrink-0">
                                            <Image
                                                src={item.product.image || "/placeholder-image.png"}
                                                alt={item.product.name}
                                                width={48}
                                                height={48}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex flex-col font-semibold gap-1 sm:gap-4">
                                            <span className="text-[12px] md:text-[14px] text-black">{item.product.name}</span>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center text-sm text-black">
                                                    <span className="mr-2">Qty:</span>
                                                    <div className="flex items-center border border-gray-200 rounded h-7">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCartQuantityChange(item.id, item.quantity - 1)}
                                                            disabled={cartUpdatingId === item.id || item.quantity <= 1}
                                                            className="px-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                                        >-</button>
                                                        <span className="px-2 border-x border-gray-200">{item.quantity}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCartQuantityChange(item.id, item.quantity + 1)}
                                                            disabled={cartUpdatingId === item.id}
                                                            className="px-2 text-orange-500 hover:text-orange-600 disabled:opacity-50"
                                                        >+</button>
                                                    </div>
                                                </div>
                                                <span className="font-semibold text-[12px] md:text-[14px]">
                                                    {formatCurrency(item.itemPrice * item.quantity, currency)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveCartItem(item.id)}
                                        disabled={cartUpdatingId === item.id}
                                        className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                        <SectionHeader title="Shipping Address" />
                        <div className="space-y-3 text-black font-semibold">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Your Full Name *"
                                        value={addressFormData.name}
                                        onChange={(e) => setAddressFormData({ ...addressFormData, name: e.target.value })}
                                        onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                                        required
                                        disabled={loading}
                                        className={`w-full px-3 py-1.5 md:py-3 text-[14px] border rounded-md focus:outline-none focus:border-[#f48721] ${fieldErrors.name ? 'border-red-400' : 'border-[#888888ad]'}`}
                                    />
                                    {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
                                </div>
                                {isLoggedIn && (
                                    <div>
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            value={addressFormData.email}
                                            onChange={(e) => setAddressFormData({ ...addressFormData, email: e.target.value })}
                                            onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                                            disabled={loading}
                                            className={`w-full px-3 py-1.5 md:py-3 text-[14px] border rounded-md focus:outline-none focus:border-[#f48721] ${fieldErrors.email ? 'border-red-400' : 'border-[#888888ad]'}`}
                                        />
                                        {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
                                    </div>
                                )}
                                <div>
                                    <input
                                        type="tel"
                                        placeholder="017********"
                                        value={addressFormData.phone}
                                        onChange={handlePhoneChange}
                                        onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                                        required
                                        disabled={loading}
                                        inputMode="numeric"
                                        pattern="01[1-9][0-9]{8}"
                                        className={`w-full px-3 py-1.5 md:py-3 text-[14px] border rounded-md focus:outline-none focus:border-[#f48721] ${fieldErrors.phone || phoneError ? 'border-red-400' : 'border-[#888888ad]'}`}
                                    />
                                    {(fieldErrors.phone || phoneError) && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone || phoneError}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <input
                                        type="text"
                                        list="district-options"
                                        placeholder="Select District"
                                        value={addressFormData.city}
                                        onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value, thana: "" })}
                                        onBlur={() => setTouched(prev => ({ ...prev, city: true }))}
                                        required
                                        disabled={loading}
                                        className={`w-full px-3 py-1.5 md:py-3 text-[14px] border rounded-md bg-white focus:outline-none focus:border-[#f48721] text-gray-600 ${fieldErrors.city ? 'border-red-400' : 'border-[#888888ad]'}`}
                                    />
                                    {fieldErrors.city && <p className="text-xs text-red-500 mt-1">{fieldErrors.city}</p>}
                                    <datalist id="district-options">
                                        {BANGLADESH_DISTRICTS.map((district) => (
                                            <option key={district} value={district} />
                                        ))}
                                        <option value="Other" />
                                    </datalist>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        list="thana-options"
                                        placeholder={selectedDistrictId ? "Select Thana (Optional)" : "Select Thana (Optional)"}
                                        value={addressFormData.thana}
                                        onChange={(e) => setAddressFormData({ ...addressFormData, thana: e.target.value })}
                                        disabled={loading}
                                        className="w-full px-3 py-1.5 md:py-3 text-[14px] border border-[#888888ad] rounded-md bg-white focus:outline-none focus:border-[#f48721] text-gray-600"
                                    />
                                    <datalist id="thana-options">
                                        {thanaOptionsWithOther.map((thana) => (
                                            <option key={thana} value={thana} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="ex: House no. / building / street / area"
                                    value={addressFormData.street}
                                    onChange={(e) => setAddressFormData({ ...addressFormData, street: e.target.value })}
                                    onBlur={() => setTouched(prev => ({ ...prev, street: true }))}
                                    required
                                    disabled={loading}
                                    className={`w-full px-3 py-1.5 md:py-3 text-[14px] border rounded-md focus:outline-none focus:border-[#f48721] ${fieldErrors.street ? 'border-red-400' : 'border-[#888888ad]'}`}
                                />
                                {fieldErrors.street && <p className="text-xs text-red-500 mt-1">{fieldErrors.street}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5 space-y-4">
                    <div className="bg-white p-3 rounded-xl border border-[#888888ad] shadow-sm">
                        <SectionHeader title="Payment method" />
                        <input type="hidden" name="paymentMethod" value={paymentMethod} />

                        <div className="grid grid-cols-3 gap-3 mt-3">
                            <div
                                onClick={() => setPaymentMethod("COD")}
                                className={`relative flex items-center gap-2 py-1 px-2 rounded-md border cursor-pointer transition-all ${paymentMethod === "COD"
                                    ? "border-[#f48721] bg-orange-50/30"
                                    : "border-[#888888ad] hover:border-gray-300"
                                    }`}
                            >
                                <div className="w-5 h-5 md:w-8 md:h-8 rounded bg-gray-50 flex items-center justify-center">
                                    <Image src="/svg/cash-on-delivery.png" alt="COD" width={20} height={20} className="object-contain" />
                                </div>
                                <span className="text-[13px] font-medium text-gray-700">Cash On Delivery</span>
                                {paymentMethod === "COD" && (
                                    <div className="absolute right-2 top-2 w-4 h-4 bg-[#f48721] rounded-full flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5 text-white" />
                                    </div>
                                )}
                            </div>

                            <div
                                onClick={() => setPaymentMethod("CARD")}
                                className={`relative flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all ${paymentMethod === "CARD"
                                    ? "border-[#f48721] bg-orange-50/30"
                                    : "border-[#888888ad] hover:border-gray-300"
                                    }`}
                            >
                                <div className="w-8 h-8 rounded flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-blue-800" />
                                </div>
                                <span className="text-[13px] font-medium text-gray-700">Online Payment</span>
                                {paymentMethod === "CARD" && (
                                    <div className="absolute right-2 top-2 w-4 h-4 bg-[#f48721] rounded-full flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5 text-white" />
                                    </div>
                                )}
                            </div>

                            <div
                                onClick={() => setPaymentMethod("BKASH")}
                                className={`relative flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all ${paymentMethod === "BKASH"
                                    ? "border-[#f48721] bg-orange-50/30"
                                    : "border-[#888888ad] hover:border-gray-300"
                                    }`}
                            >
                                <div className="w-8 h-8 rounded bg-pink-50 flex items-center justify-center">
                                    <Image src="/svg/BKash-bKash-Logo.svg" alt="Bkash" width={20} height={20} className="object-contain" />
                                </div>
                                <span className="text-[13px] font-medium text-gray-700">Bkash</span>
                                {paymentMethod === "BKASH" && (
                                    <div className="absolute right-2 top-2 w-4 h-4 bg-[#f48721] rounded-full flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5 text-white" />
                                    </div>
                                )}
                            </div>

                            <div
                                onClick={() => setPaymentMethod("NAGAD")}
                                className={`relative flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all ${paymentMethod === "NAGAD"
                                    ? "border-[#f48721] bg-orange-50/30"
                                    : "border-[#888888ad] hover:border-gray-300"
                                    }`}
                            >
                                <div className="w-8 h-8 rounded bg-orange-50 flex items-center justify-center">
                                    <Image src="/svg/Nagad-Logo.svg" alt="Nagad" width={20} height={20} className="object-contain" />
                                </div>
                                <span className="text-[13px] font-medium text-gray-700">Nagad</span>
                                {paymentMethod === "NAGAD" && (
                                    <div className="absolute right-2 top-2 w-4 h-4 bg-[#f48721] rounded-full flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5 text-white" />
                                    </div>
                                )}
                            </div>

                            <div
                                onClick={() => setPaymentMethod("ROCKET")}
                                className={`relative flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all ${paymentMethod === "ROCKET"
                                    ? "border-[#f48721] bg-orange-50/30"
                                    : "border-[#888888ad] hover:border-gray-300"
                                    }`}
                            >
                                <div className="w-8 h-8 rounded bg-purple-50 flex items-center justify-center">
                                    <Image src="/svg/Rocket_mobile_banking_logo.svg" alt="Rocket" width={20} height={20} className="object-contain" />
                                </div>
                                <span className="text-[13px] font-medium text-gray-700">Rocket</span>
                                {paymentMethod === "ROCKET" && (
                                    <div className="absolute right-2 top-2 w-4 h-4 bg-[#f48721] rounded-full flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5 text-white" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {paymentMethod !== "COD" && paymentMethod !== "CARD" && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <input
                                    type="text"
                                    placeholder="Enter Transaction ID *"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    onBlur={() => setTouched(prev => ({ ...prev, transactionId: true }))}
                                    disabled={loading}
                                    className={`w-full px-3 py-3 text-[13px] border rounded-md focus:outline-none focus:border-[#f48721] ${fieldErrors.transactionId ? 'border-red-400' : 'border-[#888888ad]'}`}
                                />
                                {fieldErrors.transactionId && <p className="text-xs text-red-500 mt-1">{fieldErrors.transactionId}</p>}
                            </div>
                        )}
                    </div>

                    {/* Coupon */}
                    <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <button
                            type="button"
                            onClick={() => setIsCouponOpen(!isCouponOpen)}
                            className="w-full flex items-center justify-between text-[14px] font-bold text-gray-700 hover:text-orange-600 transition-colors"
                        >
                            Have any coupon or gift voucher?
                            {isCouponOpen ? <ChevronUp className="w-4 h-4 text-[#f48721]" /> : <ChevronDown className="w-4 h-4 text-[#f48721]" />}
                        </button>

                        {isCouponOpen && (
                            <div className="mt-3 flex gap-2 border rounded-lg p-1">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="Enter Coupon"
                                    disabled={loading || isPending || !!appliedCoupon}
                                    className="flex-1 px-3 py-1.5 text-[13px] rounded-md focus:outline-none focus:border-[#f48721]"
                                />
                                {appliedCoupon ? (
                                    <button type="button" onClick={() => setAppliedCoupon(null)} className="px-3 py-1.5 bg-red-50 text-red-600 text-[13px] rounded border border-red-100 hover:bg-red-100">
                                        Remove
                                    </button>
                                ) : (
                                    <button type="button" onClick={handleApplyCoupon} disabled={isPending} className="px-3 py-1.5 bg-[#f48721] text-white text-[13px] rounded hover:bg-gray-700 disabled:bg-gray-300">
                                        Apply Coupon
                                    </button>
                                )}
                            </div>
                        )}
                        {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm space-y-4">

                        <div className="space-y-2 text-[14px] text-gray-500">
                            <div className="flex justify-between">
                                <span className="font-bold">Sub total</span>
                                <span className="font-semibold text-gray-800">{subtotal.toFixed(2)} BDT</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-{discount.toFixed(2)} BDT</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="font-bold text-gray-500">Delivery cost</span>
                                <span className="font-semibold text-gray-800">{shippingCost} BDT</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-100 text-[15px] font-bold text-gray-900">
                                <span>Total</span>
                                <span>{total.toFixed(2)} BDT</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                        <SectionHeader title="Special notes (Optional)" />
                        <textarea
                            name="notes"
                            rows={2}
                            className="w-full mt-1 px-3 py-3 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:border-[#f48721] resize-none"
                        ></textarea>
                    </div>

                    {/* Terms Acceptance */}
                    <div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <label className="flex items-start gap-2 cursor-pointer group">
                                <div className="relative flex items-center justify-center w-4 h-4 mt-0.5">
                                    <input
                                        type="checkbox"
                                        checked={termsAccepted}
                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className="w-4 h-4 border border-gray-300 rounded-sm peer-checked:bg-[#f48721] peer-checked:border-[#f48721] transition-colors"></div>
                                    <Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
                                </div>
                                <span className="text-[12px] md:text-[14px] text-gray-500 leading-tight font-semibold">
                                    I have read and agree to the <Link href="/terms" className="text-[#f48721] hover:underline">Terms</Link> & <Link href="/refund" className="text-[#f48721] hover:underline">Refund Policy</Link>.
                                </span>
                            </label>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full mt-4 py-2.5 rounded-md text-white font-semibold text-[14px] transition-all ${loading
                                ? "bg-orange-300 cursor-not-allowed"
                                : "bg-[#f48721] hover:bg-[#ea580c]"
                                }`}
                        >
                            {loading ? "Processing..." : `PLACE ORDER - ${formatCurrency(total, currency)}`}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    )
}