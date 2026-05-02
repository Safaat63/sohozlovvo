"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createLandingPageOrder } from "@/actions/landing-page-checkout"
import { validateBDPhoneNumber, validateEmail } from "@/lib/validation"
import { formatCurrency, useCurrencySymbol } from "@/components/providers/currency-provider"
import { Check, Package, Banknote } from "lucide-react"

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
  <h3 className="text-xl font-semibold mb-4 text-gray-900">{title}</h3>
)

export function LandingPageCheckout({ landingPageId, products }: LandingPageCheckoutProps) {
  const router = useRouter()
  const currency = useCurrencySymbol()
  const [isPending, startTransition] = useTransition()

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [paymentMethod] = useState<string>("COD")
  const [transactionId] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const [quantities, setQuantities] = useState<Record<string, number>>(
    products.reduce((acc, p) => ({ ...acc, [p.id]: p.stock > 0 ? 1 : 0 }), {})
  )

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    notes: "",
  })

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const product = products.find((p) => p.id === productId)
      if (!product) return prev
      const newQty = Math.max(0, Math.min((prev[productId] ?? 1) + delta, product.stock))
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

  const fieldErrors: Record<string, string> = {}
  if (touched.name && formData.name.trim().length < 2) {
    fieldErrors.name = "সম্পূর্ণ নাম লিখুন"
  }
  if (touched.email && formData.email) {
    const emailResult = validateEmail(formData.email)
    if (!emailResult.valid) fieldErrors.email = "সঠিক ইমেইল দিন"
  }
  if (touched.phone && formData.phone) {
    if (formData.phone.length !== 11) {
      fieldErrors.phone = "সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন"
    } else if (!validateBDPhoneNumber(formData.phone)) {
      fieldErrors.phone = "মোবাইল নাম্বার সঠিক নয়"
    }
  }
  if (touched.street && formData.street.trim().length < 5) {
    fieldErrors.street = "সম্পূর্ণ ঠিকানা লিখুন"
  }
  if (touched.transactionId && paymentMethod !== "COD" && paymentMethod !== "CARD" && !transactionId.trim()) {
    fieldErrors.transactionId = "ট্রানজেকশন আইডি দিন"
  }

  const subtotal = products.reduce((sum, product) => {
    const qty = quantities[product.id] ?? 0
    return sum + product.price * qty
  }, 0)

  const shippingCost = 0
  const total = subtotal + shippingCost

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!termsAccepted) {
      setError("অর্ডার করতে হলে শর্তাবলী মেনে নিতে হবে।")
      return
    }

    setTouched({ name: true, email: true, phone: true, street: true, transactionId: true })

    if (!formData.name.trim() || formData.name.trim().length < 2) return
    if (formData.email && !validateEmail(formData.email).valid) return
    if (!validateBDPhoneNumber(formData.phone)) return
    if (formData.street.trim().length < 5) return
    if (paymentMethod !== "COD" && paymentMethod !== "CARD" && !transactionId.trim()) return

    const items = products
      .filter((p) => (quantities[p.id] ?? 0) > 0)
      .map((p) => ({
        productId: p.id,
        quantity: quantities[p.id] ?? 0,
        combinationId: null,
      }))

    if (items.length === 0) {
      setError("অন্যূন একটি পণ্য সিলেক্ট করুন")
      return
    }

    const formPayload = new FormData()
    formPayload.set("name", formData.name)
    formPayload.set("email", formData.email)
    formPayload.set("phone", formData.phone)
    formPayload.set("street", formData.street)
    formPayload.set("paymentMethod", paymentMethod)
    formPayload.set("notes", formData.notes)
    if (transactionId.trim()) formPayload.set("transactionId", transactionId.trim())
    formPayload.set("items", JSON.stringify(items))

    startTransition(async () => {
      const result = await createLandingPageOrder(landingPageId, formPayload)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess("অর্ডার সফল হয়েছে!")
        router.push(`/orders/${result.orderId}?new=true`)
      }
    })
  }

  const mainProduct = products[0]

  return (
    <section id="checkout" className="py-12 md:py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4">
            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">আপনার পণ্য</h3>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              {products.map((product) => {
                const qty = quantities[product.id] ?? (product.stock > 0 ? 1 : 0)
                return (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="text-xs line-through text-gray-400">
                            {formatCurrency(product.compareAtPrice, currency)}
                          </span>
                        )}
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(product.price, currency)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(product.id, -1)}
                        disabled={qty <= 0}
                        className="w-7 h-7 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-full flex items-center justify-center transition-colors active:scale-95"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="text-base font-semibold px-2 min-w-[2.5rem] text-center bg-gray-50 rounded py-1 border">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(product.id, 1)}
                        disabled={qty >= product.stock}
                        className="w-7 h-7 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-full flex items-center justify-center transition-colors active:scale-95"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <SectionHeader title="আপনার তথ্য দিন" />

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">আপনার নাম *</label>
                      <input
                        type="text"
                        placeholder="সম্পূর্ণ নাম লিখুন"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                        required
                        disabled={isPending}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${fieldErrors.name ? "border-red-400" : "border-gray-300"
                          }`}
                      />
                      {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">মোবাইল নাম্বার *</label>
                      <input
                        type="tel"
                        placeholder="সঠিক ১১ ডিজিটের মোবাইল নাম্বার"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                        required
                        disabled={isPending}
                        inputMode="numeric"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${fieldErrors.phone ? "border-red-400" : "border-gray-300"
                          }`}
                      />
                      {fieldErrors.phone && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">সম্পূর্ণ ঠিকানা *</label>
                      <textarea
                        placeholder="বাড়ি/রোড নং, রোড বা উপজেলা, জেলা"
                        value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        onBlur={() => setTouched((prev) => ({ ...prev, street: true }))}
                        required
                        disabled={isPending}
                        rows={3}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${fieldErrors.street ? "border-red-400" : "border-gray-300"
                          }`}
                      />
                      {fieldErrors.street && <p className="text-xs text-red-500 mt-1">{fieldErrors.street}</p>}
                    </div>
                  </div>
                </div>

                <div>
                  <SectionHeader title="আপনার অর্ডার" />

                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    {mainProduct && (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-600 rounded">
                              <Package className="w-4 h-4 text-white m-2" />
                            </div>
                            <span className="font-medium">{mainProduct.name}</span>
                          </div>
                          <span className="font-semibold" id="itemPrice">
                            {formatCurrency(mainProduct.price * (quantities[mainProduct.id] ?? 0), currency)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          পরিমাণ: <span id="summaryQuantity">{quantities[mainProduct.id] ?? 0}</span>
                        </div>
                      </>
                    )}

                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between text-sm">
                        <span>পণ্যের মূল্য</span>
                        <span className="font-semibold" id="subtotal">
                          {formatCurrency(subtotal, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>ডেলিভারি চার্জ</span>
                        <span className="font-semibold" id="deliveryCharge">
                          {shippingCost > 0 ? formatCurrency(shippingCost, currency) : "ফ্রি"}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                        <span>সর্বমোট</span>
                        <span id="total" className="text-green-600">
                          {formatCurrency(total, currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 py-2 px-3 bg-green-50 border border-green-200 rounded-lg text-sm mb-6">
                    <Banknote className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="font-medium text-green-900">ক্যাশ অন ডেলিভারি (COD)</span>
                    <span className="text-green-600">— পণ্য হাতে পেয়ে টাকা দিন</span>
                  </div>

                  <label className="flex items-start gap-2 cursor-pointer group mb-4">
                    <div className="relative flex items-center justify-center w-4 h-4 mt-0.5">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="w-4 h-4 border border-gray-300 rounded-sm peer-checked:bg-green-600 peer-checked:border-green-600 transition-colors"></div>
                      <Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
                    </div>
                    <span className="text-sm text-gray-600 leading-tight">
                      আমি শর্তাবলী পড়েছি এবং মেনে নিয়েছি।
                    </span>
                  </label>

                  {error && (
                    <div className="mb-4 bg-red-50 p-3 text-sm text-red-600 border border-red-200 rounded-lg">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="mb-4 bg-green-50 p-3 text-sm text-green-600 border border-green-200 rounded-lg">
                      {success}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isPending}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-lg font-semibold text-lg transition-colors ${isPending
                      ? "bg-green-400 cursor-not-allowed text-white/80"
                      : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span id="orderButtonText">
                      {isPending ? "প্রসেসিং..." : `PLACE ORDER - ${formatCurrency(total, currency)}`}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
