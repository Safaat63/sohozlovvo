"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createOrder } from "@/actions/orders"
import { removeCartItem, updateCartItemQuantity } from "@/actions/cart"
import { validateCoupon } from "@/actions/admin-coupons"
import { validateBDPhoneNumber } from "@/lib/validation"
import { formatCurrency, useCurrencySymbol } from "@/components/providers/currency-provider"
import { BANGLADESH_DISTRICTS } from "@/lib/bangladesh-districts"
import { Trash2, ChevronDown, ChevronUp, Check, Banknote, CreditCard } from "lucide-react"
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
    userAddresses?: UserAddress[]
}

// Compact Section Header to match the screenshot's orange pipe
const SectionHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-2 mb-3">
        <div className="w-[3px] h-[14px] bg-[#f97316] rounded-sm"></div>
        <h2 className="text-[15px] font-semibold text-gray-800">{title}</h2>
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

    // Address Form State - Aligned strictly with Prisma Schema
    const initialSelectedAddressId = userAddresses.find(addr => addr.isDefault)?.id || "new"
    const [addressFormData, setAddressFormData] = useState(() => {
        const defaultAddress = userAddresses.find(addr => addr.id === initialSelectedAddressId)
        return defaultAddress
            ? {
                name: userName || "",
                phone: userPhone?.replace(/^(\+?88)?/, '') || "",
                street: defaultAddress.street,
                city: defaultAddress.city,
                thana: defaultAddress.thana || "",
            }
            : {
                name: userName || "",
                phone: userPhone?.replace(/^(\+?88)?/, '') || "",
                street: "",
                city: "",
                thana: "",
            }
    })

    // UI Toggles
    const [isCouponOpen, setIsCouponOpen] = useState(false)
    const [termsAccepted, setTermsAccepted] = useState(false)

    // Coupon State
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

    // Handlers
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
        const phone = e.target.value
        setAddressFormData(prev => ({ ...prev, phone }))
        if (phone && !validateBDPhoneNumber(`0${phone}`)) {
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

        if (phoneError) {
            setError("Please fix the phone number before submitting")
            return
        }

        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)

        formData.set("phone", `880${addressFormData.phone}`)
        formData.set("name", addressFormData.name)
        formData.set("street", addressFormData.street)
        formData.set("city", addressFormData.city)
        if (addressFormData.thana) formData.set("thana", addressFormData.thana)

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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-7xl mx-auto">
            {/* Top Login Banner */}
            {!isLoggedIn && (
                <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                    <p className="text-gray-700 text-[14px] mb-2 sm:mb-0">
                        Have any account? please login or register
                    </p>
                    <div className="flex items-center gap-2">
                        <Link href="/login" className="px-5 py-1.5 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                            Login
                        </Link>
                        <Link href="/register" className="px-5 py-1.5 text-sm font-medium bg-[#f97316] text-white rounded hover:bg-[#ea580c] transition-colors">
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
                {/* Left Column (Wider) */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Order Review */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                        <SectionHeader title="Order review" />
                        <div className="space-y-3">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-2 border border-gray-200 rounded-md">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-50 rounded border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                            <Image
                                                src={item.product.image}
                                                alt={item.product.name}
                                                width={48}
                                                height={48}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                            <span className="text-[14px] text-gray-800">{item.product.name}</span>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center text-sm text-gray-600">
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
                                                <span className="font-semibold text-[14px]">
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
                                        <Trash2 className="w-[14px] h-[14px]" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                        <SectionHeader title="Shipping Address" />
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="Your Full Name *"
                                    value={addressFormData.name}
                                    onChange={(e) => setAddressFormData({ ...addressFormData, name: e.target.value })}
                                    required
                                    disabled={loading}
                                    className="w-full px-3 py-2 text-[14px] border border-gray-200 rounded focus:outline-none focus:border-orange-400"
                                />
                                <div className="flex">
                                    <div className="bg-gray-50 border border-gray-200 border-r-0 rounded-l px-3 py-2 flex items-center text-[14px] text-gray-600">
                                        88
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="017********"
                                        value={addressFormData.phone}
                                        onChange={handlePhoneChange}
                                        required
                                        disabled={loading}
                                        className={`w-full px-3 py-2 text-[14px] border ${phoneError ? 'border-red-400' : 'border-gray-200'} rounded-r focus:outline-none focus:border-orange-400`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="relative">
                                    <select
                                        value={addressFormData.city}
                                        onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value, thana: "" })}
                                        required
                                        disabled={loading}
                                        className="w-full px-3 py-2 text-[14px] border border-gray-200 rounded appearance-none bg-white focus:outline-none focus:border-orange-400 text-gray-600"
                                    >
                                        <option value="" disabled>Select District</option>
                                        {BANGLADESH_DISTRICTS.map((district) => (
                                            <option key={district} value={district}>{district}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                                <div className="relative">
                                    <select
                                        value={addressFormData.thana}
                                        onChange={(e) => setAddressFormData({ ...addressFormData, thana: e.target.value })}
                                        disabled={loading || !selectedDistrictId}
                                        className="w-full px-3 py-2 text-[14px] border border-gray-200 rounded appearance-none bg-white focus:outline-none focus:border-orange-400 text-gray-600"
                                    >
                                        <option value="" disabled>
                                            {selectedDistrictId ? "Select Thana (Optional)" : "Select District First"}
                                        </option>
                                        {thanaOptions.map((thana) => (
                                            <option key={thana} value={thana}>
                                                {thana}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <input
                                type="text"
                                placeholder="ex: House no. / building / street / area"
                                value={addressFormData.street}
                                onChange={(e) => setAddressFormData({ ...addressFormData, street: e.target.value })}
                                required
                                disabled={loading}
                                className="w-full px-3 py-2 text-[14px] border border-gray-200 rounded focus:outline-none focus:border-orange-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column (Narrower) */}
                <div className="lg:col-span-5 space-y-4">
                    {/* Payment Method */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                        <SectionHeader title="Payment method" />
                        <input type="hidden" name="paymentMethod" value={paymentMethod} />

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                            <div
                                onClick={() => setPaymentMethod("COD")}
                                className={`relative flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${paymentMethod === "COD"
                                    ? "border-orange-400 bg-orange-50/30"
                                    : "border-gray-200 hover:border-gray-300"
                                    }`}
                            >
                                <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center">
                                    <Image src="/svg/cash-on-delivery.png" alt="COD" width={20} height={20} className="object-contain" />
                                </div>
                                <span className="text-[13px] font-medium text-gray-700">Cash On Delivery</span>
                                {paymentMethod === "COD" && (
                                    <div className="absolute right-2 w-4 h-4 bg-[#f97316] rounded-full flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5 text-white" />
                                    </div>
                                )}
                            </div>

                            <div
                                onClick={() => setPaymentMethod("ONLINE")}
                                className={`relative flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${paymentMethod === "ONLINE"
                                    ? "border-orange-400 bg-orange-50/30"
                                    : "border-gray-200 hover:border-gray-300"
                                    }`}
                            >
                                <div className="w-8 h-8 rounded flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-blue-800" />
                                </div>
                                <span className="text-[13px] font-medium text-gray-700">Online Payment</span>
                                {paymentMethod === "ONLINE" && (
                                    <div className="absolute right-2 w-4 h-4 bg-[#f97316] rounded-full flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5 text-white" />
                                    </div>
                                )}
                            </div>

                            <div
                                onClick={() => setPaymentMethod("BKASH")}
                                className={`relative flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${paymentMethod === "BKASH"
                                    ? "border-orange-400 bg-orange-50/30"
                                    : "border-gray-200 hover:border-gray-300"
                                    }`}
                            >
                                <div className="w-8 h-8 rounded bg-pink-50 flex items-center justify-center">
                                    <Image src="/svg/BKash-bKash-Logo.svg" alt="Bkash" width={20} height={20} className="object-contain" />
                                </div>
                                <span className="text-[13px] font-medium text-gray-700">Bkash</span>
                                {paymentMethod === "BKASH" && (
                                    <div className="absolute right-2 w-4 h-4 bg-[#f97316] rounded-full flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5 text-white" />
                                    </div>
                                )}
                            </div>

                            <div
                                onClick={() => setPaymentMethod("NAGAD")}
                                className={`relative flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${paymentMethod === "NAGAD"
                                    ? "border-orange-400 bg-orange-50/30"
                                    : "border-gray-200 hover:border-gray-300"
                                    }`}
                            >
                                <div className="w-8 h-8 rounded bg-orange-50 flex items-center justify-center">
                                    <Image src="/svg/Nagad-Logo.svg" alt="Nagad" width={20} height={20} className="object-contain" />
                                </div>
                                <span className="text-[13px] font-medium text-gray-700">Nagad</span>
                                {paymentMethod === "NAGAD" && (
                                    <div className="absolute right-2 w-4 h-4 bg-[#f97316] rounded-full flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5 text-white" />
                                    </div>
                                )}
                            </div>

                            <div
                                onClick={() => setPaymentMethod("ROCKET")}
                                className={`relative flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${paymentMethod === "ROCKET"
                                    ? "border-orange-400 bg-orange-50/30"
                                    : "border-gray-200 hover:border-gray-300"
                                    }`}
                            >
                                <div className="w-8 h-8 rounded bg-purple-50 flex items-center justify-center">
                                    <Image src="/svg/Rocket_mobile_banking_logo.svg" alt="Rocket" width={20} height={20} className="object-contain" />
                                </div>
                                <span className="text-[13px] font-medium text-gray-700">Rocket</span>
                                {paymentMethod === "ROCKET" && (
                                    <div className="absolute right-2 w-4 h-4 bg-[#f97316] rounded-full flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5 text-white" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {paymentMethod !== "COD" && paymentMethod !== "ONLINE" && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <input
                                    type="text"
                                    name="transactionId"
                                    placeholder="Enter Transaction ID *"
                                    required={paymentMethod !== "COD" && paymentMethod !== "ONLINE"}
                                    disabled={loading}
                                    className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded focus:outline-none focus:border-orange-400"
                                />
                            </div>
                        )}
                    </div>

                    {/* Order Summary & Coupon */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
                        {/* Coupon Accordion */}
                        <div className="border-b border-gray-100 pb-3">
                            <button
                                type="button"
                                onClick={() => setIsCouponOpen(!isCouponOpen)}
                                className="w-full flex items-center justify-between text-[14px] font-medium text-gray-700 hover:text-orange-600 transition-colors"
                            >
                                Have any coupon or gift voucher?
                                {isCouponOpen ? <ChevronUp className="w-4 h-4 text-orange-400" /> : <ChevronDown className="w-4 h-4 text-orange-400" />}
                            </button>

                            {isCouponOpen && (
                                <div className="mt-3 flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        placeholder="Enter code here"
                                        disabled={loading || isPending || !!appliedCoupon}
                                        className="flex-1 px-3 py-1.5 text-[13px] border border-gray-200 rounded focus:outline-none focus:border-orange-400"
                                    />
                                    {appliedCoupon ? (
                                        <button type="button" onClick={() => setAppliedCoupon(null)} className="px-3 py-1.5 bg-red-50 text-red-600 text-[13px] rounded border border-red-100 hover:bg-red-100">
                                            Remove
                                        </button>
                                    ) : (
                                        <button type="button" onClick={handleApplyCoupon} disabled={!couponCode || isPending} className="px-3 py-1.5 bg-gray-800 text-white text-[13px] rounded hover:bg-gray-700 disabled:bg-gray-300">
                                            Apply
                                        </button>
                                    )}
                                </div>
                            )}
                            {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
                        </div>

                        {/* Summary */}
                        <div className="space-y-2 text-[14px] text-gray-600">
                            <div className="flex justify-between">
                                <span>Sub total</span>
                                <span className="font-semibold text-gray-800">{subtotal.toFixed(2)} BDT</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-{discount.toFixed(2)} BDT</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Delivery cost</span>
                                <span className="font-semibold text-gray-800">{shippingCost} BDT</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-100 text-[15px] font-bold text-gray-900">
                                <span>Total</span>
                                <span>{total.toFixed(2)} BDT</span>
                            </div>
                        </div>
                    </div>

                    {/* Special Notes */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                        <SectionHeader title="Special notes (Optional)" />
                        <textarea
                            name="notes"
                            rows={2}
                            className="w-full mt-1 px-3 py-2 text-[13px] border border-gray-200 rounded focus:outline-none focus:border-orange-400 resize-none"
                        ></textarea>

                        {/* Terms and Conditions inside notes block for compactness */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <label className="flex items-start gap-2 cursor-pointer group">
                                <div className="relative flex items-center justify-center w-4 h-4 mt-0.5">
                                    <input
                                        type="checkbox"
                                        checked={termsAccepted}
                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className="w-4 h-4 border border-gray-300 rounded-sm peer-checked:bg-[#f97316] peer-checked:border-[#f97316] transition-colors"></div>
                                    <Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
                                </div>
                                <span className="text-[12px] text-gray-500 leading-tight">
                                    I have read and agree to the <Link href="/terms" className="text-[#f97316] hover:underline">Terms</Link> & <Link href="/refund" className="text-[#f97316] hover:underline">Refund Policy</Link>.
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !termsAccepted}
                            className={`w-full mt-4 py-2.5 rounded text-white font-medium text-[14px] transition-all ${loading || !termsAccepted
                                ? "bg-orange-300 cursor-not-allowed"
                                : "bg-[#f97316] hover:bg-[#ea580c]"
                                }`}
                        >
                            {loading ? "Processing..." : "Place Order"}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    )
}