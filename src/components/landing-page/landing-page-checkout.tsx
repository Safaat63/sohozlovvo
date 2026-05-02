"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createLandingPageOrder } from "@/actions/landing-page-checkout"
import { validateBDPhoneNumber, validateEmail } from "@/lib/validation"
import { formatCurrency, useCurrencySymbol } from "@/components/providers/currency-provider"
import { BANGLADESH_DISTRICTS } from "@/lib/bangladesh-districts"
import { ChevronDown, Check, CreditCard, ShoppingCart } from "lucide-react"
import districtsData from "@/lib/bangladesh-geojson/bd-districts.json"
import upazilasData from "@/lib/bangladesh-geojson/bd-upazilas.json"
import { useMemo } from "react"

interface Product {
  id: string
  name: string
  price: number
  compareAtPrice: number | null
  images: string[]
  stock: number
}

interface LandingPageCheckoutProps {
  landingPageId: string
  products: Product[]
}

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="w-0.75 h-3.5 bg-orange-500 rounded-sm"></div>
    <h3 className="text-[15px] font-semibold text-gray-800">{title}</h3>
  </div>
)

export function LandingPageCheckout({ landingPageId, products }: LandingPageCheckoutProps) {
  const router = useRouter()
  const currency = useCurrencySymbol()
  const [isPending, startTransition] = useTransition()

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>("COD")
  const [transactionId, setTransactionId] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const [quantities, setQuantities] = useState<Record<string, number>>(
    products.reduce((acc, p) => ({ ...acc, [p.id]: 1 }), {})
  )

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    thana: "",
    notes: "",
  })

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const product = products.find((p) => p.id === productId)
      if (!product) return prev
      const newQty = Math.max(1, Math.min((prev[productId] || 1) + delta, product.stock))
      return { ...prev, [productId]: newQty }
    })
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let cleaned = e.target.value.replace(/\D/g, "")
    if (cleaned.startsWith("8801")) {
      cleaned = `0${cleaned.slice(3)}`
    } else if (cleaned.startsWith("1") && cleaned.length === 10) {
      cleaned = `0${cleaned}`
    }
    cleaned = cleaned.slice(0, 11)
    setFormData((prev) => ({ ...prev, phone: cleaned }))
  }

  const districtIdByName = useMemo(() => {
    const map = new Map<string, string>()
    districtsData.districts.forEach((district) => {
      map.set(district.name, district.id)
    })
    return map
  }, [])

  const selectedDistrictId = districtIdByName.get(formData.city)
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

  const fieldErrors: Record<string, string> = {}
  if (touched.name && formData.name.trim().length < 2) {
    fieldErrors.name = "Please enter your full name (at least 2 characters)"
  }
  if (touched.email && formData.email) {
    const emailResult = validateEmail(formData.email)
    if (!emailResult.valid) fieldErrors.email = "Please enter a valid email address"
  }
  if (touched.phone && formData.phone) {
    if (formData.phone.length !== 11) {
      fieldErrors.phone = "Please enter a valid phone number (01XXXXXXXXX)"
    } else if (!validateBDPhoneNumber(formData.phone)) {
      fieldErrors.phone = "Invalid phone number format"
    }
  }
  if (touched.street && formData.street.trim().length < 5) {
    fieldErrors.street = "Please enter your complete address (at least 5 characters)"
  }
  if (touched.city && formData.city.trim().length < 2) {
    fieldErrors.city = "Please enter your city name"
  }
  if (touched.transactionId && paymentMethod !== "COD" && paymentMethod !== "CARD" && !transactionId.trim()) {
    fieldErrors.transactionId = "Transaction ID is required"
  }

  const subtotal = products.reduce((sum, product) => {
    const qty = quantities[product.id] || 1
    return sum + product.price * qty
  }, 0)

  const shippingCost = 0
  const total = subtotal + shippingCost

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!termsAccepted) {
      setError("Please agree to the Terms and Conditions to proceed.")
      return
    }

    setTouched({ name: true, email: true, phone: true, street: true, city: true, transactionId: true })

    if (!formData.name.trim() || formData.name.trim().length < 2) return
    if (formData.email && !validateEmail(formData.email).valid) return
    if (!validateBDPhoneNumber(formData.phone)) return
    if (formData.street.trim().length < 5) return
    if (formData.city.trim().length < 2) return
    if (paymentMethod !== "COD" && paymentMethod !== "CARD" && !transactionId.trim()) return

    const items = products
      .filter((p) => (quantities[p.id] || 1) > 0)
      .map((p) => ({
        productId: p.id,
        quantity: quantities[p.id] || 1,
        combinationId: null,
      }))

    if (items.length === 0) {
      setError("Please select at least one product")
      return
    }

    const formPayload = new FormData()
    formPayload.set("name", formData.name)
    formPayload.set("email", formData.email)
    formPayload.set("phone", formData.phone)
    formPayload.set("street", formData.street)
    formPayload.set("city", formData.city)
    formPayload.set("thana", formData.thana)
    formPayload.set("paymentMethod", paymentMethod)
    formPayload.set("notes", formData.notes)
    if (transactionId.trim()) formPayload.set("transactionId", transactionId.trim())
    formPayload.set("items", JSON.stringify(items))

    startTransition(async () => {
      const result = await createLandingPageOrder(landingPageId, formPayload)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess("Order placed successfully!")
        router.push(`/orders/${result.orderId}?new=true`)
      }
    })
  }

  return (
    <section id="checkout" className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Order Now
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            Fill in your details to place your order
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-5">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <SectionHeader title="Your Information" />
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Full Name *"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                      required
                      disabled={isPending}
                      className={`w-full px-3 py-2.5 text-[14px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 ${
                        fieldErrors.name ? "border-red-400" : "border-gray-200"
                      }`}
                    />
                    {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
                  </div>

                  <div>
                    <input
                      type="email"
                      placeholder="Email Address (Optional)"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                      disabled={isPending}
                      className={`w-full px-3 py-2.5 text-[14px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 ${
                        fieldErrors.email ? "border-red-400" : "border-gray-200"
                      }`}
                    />
                    {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
                  </div>

                  <div>
                    <input
                      type="tel"
                      placeholder="01XXXXXXXXX *"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                      required
                      disabled={isPending}
                      inputMode="numeric"
                      pattern="01[1-9][0-9]{8}"
                      className={`w-full px-3 py-2.5 text-[14px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 ${
                        fieldErrors.phone ? "border-red-400" : "border-gray-200"
                      }`}
                    />
                    {fieldErrors.phone && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>}
                  </div>

                  <div>
                    <textarea
                      placeholder="Full Address *"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      onBlur={() => setTouched((prev) => ({ ...prev, street: true }))}
                      required
                      disabled={isPending}
                      rows={2}
                      className={`w-full px-3 py-2.5 text-[14px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none ${
                        fieldErrors.street ? "border-red-400" : "border-gray-200"
                      }`}
                    />
                    {fieldErrors.street && <p className="text-xs text-red-500 mt-1">{fieldErrors.street}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                      <input
                        type="text"
                        list="lp-district-options"
                        placeholder="Select District *"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value, thana: "" })}
                        onBlur={() => setTouched((prev) => ({ ...prev, city: true }))}
                        required
                        disabled={isPending}
                        className={`w-full px-3 py-2.5 text-[14px] border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 ${
                          fieldErrors.city ? "border-red-400" : "border-gray-200"
                        }`}
                      />
                      {fieldErrors.city && <p className="text-xs text-red-500 mt-1">{fieldErrors.city}</p>}
                      <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                      <datalist id="lp-district-options">
                        {BANGLADESH_DISTRICTS.map((district) => (
                          <option key={district} value={district} />
                        ))}
                      </datalist>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        list="lp-thana-options"
                        placeholder="Select Thana (Optional)"
                        value={formData.thana}
                        onChange={(e) => setFormData({ ...formData, thana: e.target.value })}
                        disabled={isPending}
                        className="w-full px-3 py-2.5 text-[14px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                      <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                      <datalist id="lp-thana-options">
                        {thanaOptionsWithOther.map((thana) => (
                          <option key={thana} value={thana} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <SectionHeader title="Payment Method" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                  {[
                    { id: "COD", label: "Cash On Delivery", icon: "/svg/cash-on-delivery.png" },
                    { id: "CARD", label: "Online Payment", icon: "card" },
                    { id: "BKASH", label: "Bkash", icon: "/svg/BKash-bKash-Logo.svg" },
                    { id: "NAGAD", label: "Nagad", icon: "/svg/Nagad-Logo.svg" },
                    { id: "ROCKET", label: "Rocket", icon: "/svg/Rocket_mobile_banking_logo.svg" },
                  ].map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`relative flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? "border-orange-400 bg-orange-50/30"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center">
                        {method.icon === "card" ? (
                          <CreditCard className="w-5 h-5 text-blue-800" />
                        ) : (
                          <Image src={method.icon} alt={method.label} width={20} height={20} className="object-contain" />
                        )}
                      </div>
                      <span className="text-[13px] font-medium text-gray-700">{method.label}</span>
                      {paymentMethod === method.id && (
                        <div className="absolute right-2 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {paymentMethod !== "COD" && paymentMethod !== "CARD" && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <input
                      type="text"
                      placeholder="Enter Transaction ID *"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, transactionId: true }))}
                      disabled={isPending}
                      className={`w-full px-3 py-2.5 text-[13px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 ${
                        fieldErrors.transactionId ? "border-red-400" : "border-gray-200"
                      }`}
                    />
                    {fieldErrors.transactionId && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.transactionId}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <SectionHeader title="Your Order" />
                <div className="space-y-3 mt-3">
                  {products.map((product) => {
                    const qty = quantities[product.id] || 1
                    return (
                      <div key={product.id} className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg">
                        <div className="w-14 h-14 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                          {product.images[0] && (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-medium text-gray-800 truncate">{product.name}</p>
                          <p className="text-sm text-orange-600 font-semibold">
                            {formatCurrency(product.price, currency)}
                          </p>
                        </div>
                        <div className="flex items-center border border-gray-200 rounded-lg h-8">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(product.id, -1)}
                            disabled={qty <= 1}
                            className="px-2.5 text-gray-500 hover:text-gray-700 disabled:opacity-50 rounded-l-lg"
                          >
                            -
                          </button>
                          <span className="px-2 border-x border-gray-200 text-sm">{qty}</span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(product.id, 1)}
                            disabled={qty >= product.stock}
                            className="px-2.5 text-orange-500 hover:text-orange-600 disabled:opacity-50 rounded-r-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-[14px] text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-800">
                      {formatCurrency(subtotal, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Cost</span>
                    <span className="font-semibold text-gray-800">
                      {shippingCost > 0 ? formatCurrency(shippingCost, currency) : "Free"}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-100 text-[16px] font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatCurrency(total, currency)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <SectionHeader title="Special Notes (Optional)" />
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full mt-2 px-3 py-2.5 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                  placeholder="Any special instructions..."
                />

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <label className="flex items-start gap-2 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-4 h-4 mt-0.5">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="w-4 h-4 border border-gray-300 rounded-sm peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-colors"></div>
                      <Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
                    </div>
                    <span className="text-[12px] text-gray-500 leading-tight">
                      I have read and agree to the Terms & Conditions.
                    </span>
                  </label>
                </div>

                {error && (
                  <div className="mt-4 bg-red-50 p-3 text-sm text-red-600 border border-red-200 rounded-lg">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mt-4 bg-green-50 p-3 text-sm text-green-600 border border-green-200 rounded-lg">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className={`w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-lg text-white font-semibold text-[15px] transition-all ${
                    isPending
                      ? "bg-orange-300 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600"
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {isPending ? "Processing..." : `Place Order - ${formatCurrency(total, currency)}`}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}
