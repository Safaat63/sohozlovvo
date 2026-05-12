"use client"

import React, { useState, useEffect } from "react"
import {
  ArrowRightCircle,
  CheckCircle2,
  Star,
  Facebook,
  Instagram,
  Mail,
  Loader2,
  Plus,
  Minus,
} from "lucide-react"
import { createLandingPageOrder } from "@/actions/landing-page-checkout"
import { trackViewItem, trackPurchase, trackBeginCheckout } from "@/lib/ga4"
import { useRouter } from "next/navigation"

interface LandingPageProps {
  landingPage: any
}

export function LandingPageContent({ landingPage }: LandingPageProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProductIndex, setSelectedProductIndex] = useState(0)
  const [quantities, setQuantities] = useState<number[]>(
    landingPage.products.map((p: any) => p.quantity || 1)
  )
  const [error, setError] = useState("")

  const primaryColor = landingPage.primaryColor || "#005c1b"
  const secondaryColor = landingPage.secondaryColor || "#cc0000"
  const buttonText = landingPage.buttonText || "অর্ডার করতে চাই"

  useEffect(() => {
    // Track page view and items
    landingPage.products.forEach((lp: any) => {
      trackViewItem({
        item_id: lp.product.id,
        item_name: lp.product.name,
        price: lp.product.price,
        item_brand: lp.product.brand || undefined,
        item_category: lp.product.category?.name || undefined,
      })
    })
  }, [landingPage])

  const updateQuantity = (index: number, delta: number) => {
    const newQuantities = [...quantities]
    newQuantities[index] = Math.max(1, newQuantities[index] + delta)
    setQuantities(newQuantities)
  }

  const selectedProduct = landingPage.products[selectedProductIndex]?.product
  const selectedQuantity = quantities[selectedProductIndex]
  const subtotal = selectedProduct ? selectedProduct.price * selectedQuantity : 0
  const shippingCost = 100 // Hardcoded for now as in design, or can be dynamic
  const total = subtotal + shippingCost

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const items = [
      {
        productId: selectedProduct.id,
        quantity: selectedQuantity,
      },
    ]
    formData.append("items", JSON.stringify(items))
    formData.append("paymentMethod", "COD") // Fixed as per design

    // Track begin checkout
    trackBeginCheckout(
      items.map((item) => ({
        item_id: item.productId,
        item_name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: item.quantity,
      })),
      total
    )

    const result = await createLandingPageOrder(landingPage.id, formData)

    if (result.success) {
      // Track purchase
      trackPurchase({
        transactionId: result.orderNumber,
        value: total,
        shipping: shippingCost,
        items: items.map((item) => ({
          item_id: item.productId,
          item_name: selectedProduct.name,
          price: selectedProduct.price,
          quantity: item.quantity,
        })),
      })
      router.push(`/order-success/${result.orderId}`)
    } else {
      setError(result.error || "Failed to place order")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="font-sans text-gray-900 bg-[#fbfbfb] min-h-screen pb-0">
      {/* Hero Section */}
      <section
        className="relative pt-12 pb-32 px-4 rounded-b-[50%] md:rounded-b-[100%] max-w-[1400px] mx-auto overflow-hidden"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
            {landingPage.title}
          </h1>
          <div
            className="text-white text-lg md:text-xl max-w-3xl mx-auto font-medium leading-relaxed"
            dangerouslySetInnerHTML={{ __html: landingPage.description || "" }}
          />
          <div className="pt-6">
            <a
              href="#order"
              className="inline-block text-white font-bold text-xl px-12 py-3 border-2 border-white shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: secondaryColor }}
            >
              {buttonText}
            </a>
          </div>
        </div>
      </section>

      <main className="max-w-[1000px] mx-auto px-4 -mt-20 relative z-20 space-y-16">
        {/* Main Hero Image */}
        {landingPage.heroImage && (
          <div className="flex justify-center">
            <img
              src={landingPage.heroImage}
              alt={landingPage.title}
              className="w-[80%] max-w-[500px] h-auto border-8 border-white shadow-xl"
            />
          </div>
        )}

        {/* Dynamic Sections */}
        {landingPage.sections.map((section: any, index: number) => (
          <section key={section.id} className="space-y-8">
            <div className="text-center">
              <h2
                className="text-xl md:text-2xl font-bold text-white py-3 px-12 inline-block"
                style={{ backgroundColor: primaryColor }}
              >
                {section.title}
              </h2>
            </div>

            <div
              className={`grid md:grid-cols-2 gap-8 items-center bg-white p-6 rounded-lg shadow-sm ${
                section.type === "WHY_US" ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className={section.type === "WHY_US" ? "md:order-2" : ""}>
                {section.image && (
                  <img
                    src={section.image}
                    alt={section.title}
                    className="w-full rounded border-4 border-white shadow"
                  />
                )}
              </div>
              <div className={`space-y-4 ${section.type === "WHY_US" ? "md:order-1" : ""}`}>
                {section.description && (
                  <p className="text-gray-700 font-medium">{section.description}</p>
                )}
                <ul className="space-y-4 text-sm md:text-base font-medium">
                  {section.items.map((item: any) => (
                    <li key={item.id} className="flex gap-3">
                      <ArrowRightCircle
                        className="w-5 h-5 flex-shrink-0 mt-1"
                        style={{ color: primaryColor }}
                      />
                      <span>
                        {item.title && <strong>{item.title}: </strong>}
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center">
              <a
                href="#order"
                className="inline-block text-white font-bold text-xl px-12 py-3 border-2 border-white shadow-lg transition-transform hover:scale-105"
                style={{ backgroundColor: secondaryColor }}
              >
                {buttonText}
              </a>
            </div>
          </section>
        ))}

        {/* Text Reviews Section */}
        {landingPage.reviews && landingPage.reviews.length > 0 && (
          <section className="space-y-8 bg-white p-8 rounded-lg shadow-sm">
            <div className="text-center mb-8">
              <h2
                className="text-xl md:text-2xl font-bold text-white py-3 px-12 inline-block"
                style={{ backgroundColor: primaryColor }}
              >
                আমাদের সন্তুষ্ট গ্রাহকদের মতামত
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {landingPage.reviews.map((review: any) => (
                <div key={review.id} className="border border-gray-100 p-6 rounded-xl bg-gray-50/50 relative">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-4">"{review.comment}"</p>
                  <div className="flex items-center gap-3">
                    {review.image && (
                      <img
                        src={review.image}
                        alt={review.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    )}
                    <span className="font-bold text-gray-800">{review.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Checkout Form Section */}
        <section id="order" className="pb-16">
          <form
            onSubmit={handleSubmit}
            className="bg-[#eef2e6] border-t-[12px] rounded-t-3xl rounded-b-lg shadow-lg p-6 md:p-8"
            style={{ borderTopColor: primaryColor }}
          >
            <div className="text-center border-b border-gray-300 pb-6 mb-8">
              <h2 className="text-2xl md:text-3xl font-bold" style={{ color: primaryColor }}>
                অর্ডার করতে নিচের ফর্মটি সম্পূর্ণ পূরন করুন
              </h2>
              {error && <p className="text-red-500 mt-2 font-bold">{error}</p>}
            </div>

            <div className="grid lg:grid-cols-2 gap-x-12 gap-y-10">
              {/* Left Column: Product Selection & Billing */}
              <div className="space-y-8">
                {/* Product Selection */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase text-sm tracking-wider">
                    Your Products
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {landingPage.products.map((lp: any, index: number) => (
                      <div
                        key={lp.id}
                        className={`border-2 p-3 rounded flex gap-3 relative transition-all cursor-pointer bg-white ${
                          selectedProductIndex === index
                            ? "border-primary-color ring-2 ring-primary-color ring-opacity-20"
                            : "border-gray-200 opacity-60 hover:opacity-100"
                        }`}
                        style={{
                          borderColor: selectedProductIndex === index ? primaryColor : "#e5e7eb",
                        }}
                        onClick={() => setSelectedProductIndex(index)}
                      >
                        <input
                          type="radio"
                          name="selected_product"
                          className="absolute top-3 left-3 w-4 h-4"
                          checked={selectedProductIndex === index}
                          onChange={() => setSelectedProductIndex(index)}
                          style={{ accentColor: primaryColor }}
                        />
                        <div className="w-16 h-20 flex-shrink-0 ml-6">
                          <img
                            src={lp.product.images[0]}
                            alt={lp.product.name}
                            className="w-full h-full object-cover border"
                          />
                        </div>
                        <div className="flex flex-col justify-between">
                          <p className="text-xs font-bold leading-tight">{lp.product.name}</p>
                          <div className="flex items-center border border-gray-300 rounded w-max mt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateQuantity(index, -1)
                              }}
                              className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-xs font-bold"
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-xs font-bold outline-none">
                              {quantities[index]}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateQuantity(index, 1)
                              }}
                              className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-xs font-bold"
                            >
                              +
                            </button>
                          </div>
                          <p className="font-bold text-sm mt-1" style={{ color: primaryColor }}>
                            ৳ {lp.product.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Billing Details */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase text-sm tracking-wider">
                    Billing details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        আপনার নাম <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full border-t-[3px] border-l-[3px] border-b border-r rounded-tl-xl rounded-br-xl px-3 py-2 outline-none bg-white text-sm"
                        style={{ borderColor: primaryColor }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        আপনার ঠিকানা বাসা নং, রোড নং, থানা, জেলা{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="street"
                        required
                        className="w-full border-t-[3px] border-l-[3px] border-b border-r rounded-tl-xl rounded-br-xl px-3 py-2 outline-none bg-white text-sm"
                        style={{ borderColor: primaryColor }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        আপনার মোবাইল নাম্বার <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        className="w-full border-t-[3px] border-l-[3px] border-b border-r rounded-tl-xl rounded-br-xl px-3 py-2 outline-none bg-white text-sm"
                        style={{ borderColor: primaryColor }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Review */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase text-sm tracking-wider">
                  Your order
                </h3>
                <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
                  <div className="flex justify-between font-bold text-gray-800 border-b-2 border-gray-200 pb-3 text-sm">
                    <span>Product</span>
                    <span>Subtotal</span>
                  </div>

                  {selectedProduct && (
                    <div className="flex justify-between items-center py-4 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedProduct.images[0]}
                          alt="thumb"
                          className="w-12 h-14 object-cover border"
                        />
                        <span className="text-sm font-bold text-gray-700 max-w-[200px] leading-tight">
                          {selectedProduct.name} <br />
                          <span className="font-normal text-gray-500">× {selectedQuantity}</span>
                        </span>
                      </div>
                      <span className="font-bold text-sm text-gray-800">৳ {subtotal}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-3 border-b border-gray-200 text-sm">
                    <span className="font-bold text-gray-800">Subtotal</span>
                    <span className="font-bold text-gray-800">৳ {subtotal}</span>
                  </div>

                  <div className="flex justify-between py-3 border-b border-gray-200 text-sm">
                    <span className="font-bold text-gray-800">Shipment</span>
                    <span className="font-bold text-gray-800">Delivery Charge: ৳ {shippingCost}</span>
                  </div>

                  <div className="flex justify-between py-4 text-lg">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-gray-900">৳ {total}</span>
                  </div>

                  {/* Payment Method */}
                  <div className="mt-4 mb-6">
                    <div className="bg-gray-100 p-3 rounded border border-gray-200">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-800 cursor-pointer">
                        <input
                          type="radio"
                          checked
                          readOnly
                          className="w-4 h-4 accent-gray-600"
                        />
                        পন্য হাতে পেয়ে মূল্য পরিশোধ করুন
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full text-white font-bold text-lg py-4 rounded transition-colors shadow flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        অর্ডার করা হচ্ছে...
                      </>
                    ) : (
                      `Place Order ৳ ${total}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="bg-black text-white py-12 text-center text-xs border-t-4"
        style={{ borderTopColor: primaryColor }}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-6">
          <div className="flex gap-4">
            <a
              href="#"
              className="p-3 bg-gray-800 rounded-full hover:bg-opacity-80 transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="p-3 bg-gray-800 rounded-full hover:bg-opacity-80 transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="p-3 bg-gray-800 rounded-full hover:bg-opacity-80 transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-gray-400 font-medium text-sm">
            <a href="#" className="hover:text-white transition-colors">
              Refund policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacy policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of service
            </a>
          </div>
          <div className="text-gray-500 mt-2 text-sm">
            © 2026 Sohozlovvo | Developed By{" "}
            <span className="text-white font-semibold">MiftahCoding</span>.
          </div>
        </div>
      </footer>
    </div>
  )
}
