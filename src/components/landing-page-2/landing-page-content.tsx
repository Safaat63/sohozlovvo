"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRightCircle,
  Star,
  Facebook,
  Instagram,
  Mail,
  Loader2,
} from "lucide-react";
import { createLandingPageOrder } from "@/actions/landing-page-checkout";
import { trackViewItem, trackPurchase, trackBeginCheckout } from "@/lib/ga4";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Category {
  name?: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  brand?: string | null;
  category?: Category | null;
  images: string[];
}

interface LandingPageProduct {
  id: string;
  quantity?: number;
  product: Product;
}

interface LandingPageSectionItem {
  id: string;
  title?: string | null;
  text: string;
}

interface LandingPageSection {
  id: string;
  title: string;
  description?: string | null;
  image?: string | null;
  type?: string | null;
  items: LandingPageSectionItem[];
}

interface LandingPageReview {
  id: string;
  rating: number;
  comment: string;
  name: string;
  image?: string | null;
}

interface LandingPage {
  id: string;
  title: string;
  description?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  buttonText?: string | null;
  heroImage?: string | null;
  products: LandingPageProduct[];
  sections: LandingPageSection[];
  reviews?: LandingPageReview[];
}

interface LandingPageProps {
  landingPage: LandingPage;
}

interface WhatsAppCtaProps {
  buttonText: string;
  whatsappNumber: string;
}

const WhatsAppCta = ({ buttonText, whatsappNumber }: WhatsAppCtaProps) => (
  <div className="mt-4 w-full max-w-115 mx-auto">
    <div className="rounded-xs bg-green-700 shadow-md p-1">
      <div className="px-4 py-0 m-0 text-center text-white text-[20px] font-bold">
        {buttonText}
      </div>
      <a
        href={`https://wa.me/88${whatsappNumber}`}
        className="flex items-center justify-center gap-2 rounded-xs bg-orange-500 text-white shadow"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M20.52 3.48A11.86 11.86 0 0012.04 0C5.44 0 .07 5.36.07 11.95c0 2.1.55 4.16 1.6 5.98L0 24l6.22-1.63a11.9 11.9 0 005.82 1.5h.01c6.6 0 11.98-5.36 11.98-11.95 0-3.19-1.24-6.19-3.51-8.44zM12.05 21.8h-.01a9.94 9.94 0 01-5.06-1.38l-.36-.21-3.69.97.99-3.6-.23-.37a9.9 9.9 0 01-1.53-5.26C2.17 6.46 6.55 2.1 12.04 2.1c2.65 0 5.14 1.03 7.01 2.9a9.84 9.84 0 012.9 6.95c0 5.49-4.38 9.86-9.9 9.86zm5.46-7.45c-.3-.15-1.77-.87-2.05-.97-.28-.1-.49-.15-.7.15-.21.3-.8.97-.98 1.17-.18.2-.36.22-.66.07-.3-.15-1.28-.47-2.44-1.5-.9-.8-1.51-1.79-1.69-2.09-.18-.3-.02-.46.13-.61.13-.13.3-.36.45-.54.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.7-1.7-.96-2.33-.25-.6-.5-.52-.7-.53h-.6c-.2 0-.53.07-.8.38-.28.3-1.06 1.04-1.06 2.54 0 1.5 1.09 2.95 1.24 3.16.15.2 2.15 3.28 5.21 4.6.73.31 1.3.5 1.74.64.73.23 1.4.2 1.93.12.59-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.07-.12-.28-.2-.58-.35z" />
        </svg>
        <span className="text-[20px] font-bold">{whatsappNumber}</span>
      </a>
    </div>
  </div>
);

export function LandingPageContent({ landingPage }: LandingPageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [quantities, setQuantities] = useState<number[]>(
    landingPage.products.map((p) => p.quantity || 1),
  );
  const [error, setError] = useState("");

  const whatsappNumber = "01637469920";

  const primaryColor = landingPage.primaryColor || "#005c1b";
  const secondaryColor = landingPage.secondaryColor || "#cc0000";
  const buttonText = landingPage.buttonText || "অর্ডার করতে চাই";

  useEffect(() => {
    landingPage.products.forEach((lp) => {
      trackViewItem({
        item_id: lp.product.id,
        item_name: lp.product.name,
        price: lp.product.price,
        item_brand: lp.product.brand || undefined,
        item_category: lp.product.category?.name || undefined,
      });
    });
  }, [landingPage]);

  const updateQuantity = (index: number, delta: number) => {
    const newQuantities = [...quantities];
    newQuantities[index] = Math.max(1, newQuantities[index] + delta);
    setQuantities(newQuantities);
  };

  const selectedProduct = landingPage.products[selectedProductIndex]?.product;
  const selectedQuantity = quantities[selectedProductIndex];
  const subtotal = selectedProduct
    ? selectedProduct.price * selectedQuantity
    : 0;
  const shippingCost = 100; // Hardcoded for now as in design, or can be dynamic
  const total = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const items = [
      {
        productId: selectedProduct.id,
        quantity: selectedQuantity,
      },
    ];
    formData.append("items", JSON.stringify(items));
    formData.append("paymentMethod", "COD"); // Fixed as per design

    // Track begin checkout
    trackBeginCheckout(
      items.map((item) => ({
        item_id: item.productId,
        item_name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: item.quantity,
      })),
      total,
    );

    const result = await createLandingPageOrder(landingPage.id, formData);

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
      });
      router.push(`/order-success/${result.orderId}`);
    } else {
      setError(result.error || "Failed to place order");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-sans text-gray-900 bg-[#fbfbfb] min-h-screen pb-0">
      {/* Hero Section */}
      <section
        className="relative pt-12 pb-32 px-4 rounded-b-[50%] md:rounded-b-[100%] max-w-280 mx-auto overflow-hidden"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="mx-auto text-center space-y-4 relative z-10">
          <h1 className="text-[36px] md:text-[50px] md:text-5xl font-bold text-white mb-6">
            {landingPage.title}
          </h1>
          <div
            className="text-white text-[14px] md:text-[25px] max-w-3xl mx-auto font-medium leading-relaxed"
            dangerouslySetInnerHTML={{ __html: landingPage.description || "" }}
          />
          <div className="pt-6">
            <a
              href="#order"
              className="inline-block text-white font-bold text-[26px] md:text-[30px] px-12 py-3 border-2 border-white shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: secondaryColor }}
            >
              {buttonText}
            </a>
          </div>
        </div>
      </section>

      <main className="max-w-250 mx-auto px-4 -mt-20 relative z-20 space-y-16">
        {/* Main Hero Image */}
        {landingPage.heroImage && (
          <div className="flex justify-center">
            <Image
              src={landingPage.heroImage}
              alt={landingPage.title}
              width={500}
              height={500}
              className="w-[80%] max-w-125 h-auto border-8 border-white shadow-xl"
              sizes="(max-width: 768px) 80vw, 500px"
            />
          </div>
        )}

        {/* Dynamic Sections */}
        {landingPage.sections.map((section) => (
          <section key={section.id} className="space-y-8">
            <div className="text-center">
              <h2
                className="text-[26px] md:text-[46px] md:text-2xl font-bold text-white py-3 px-12 inline-block"
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
                  <Image
                    src={section.image}
                    alt={section.title}
                    width={800}
                    height={600}
                    className="w-full h-auto rounded border-4 border-white shadow"
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                )}
              </div>
              <div
                className={`space-y-4 ${section.type === "WHY_US" ? "md:order-1" : ""}`}
              >
                {section.description && (
                  <p className="text-gray-700 font-medium">
                    {section.description}
                  </p>
                )}
                <ul className="space-y-4 text-sm md:text-base font-medium">
                  {section.items.map((item) => (
                    <li key={item.id} className="flex gap-3">
                      <ArrowRightCircle
                        className="w-5 h-5 shrink-0 mt-1"
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
              {landingPage.reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-100 p-6 rounded-xl bg-gray-50/50 relative"
                >
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-4">
                    &quot;{review.comment}&quot;
                  </p>
                  <div className="flex items-center gap-3">
                    {review.image && (
                      <Image
                        src={review.image}
                        alt={review.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                        sizes="40px"
                      />
                    )}
                    <span className="font-bold text-gray-800">
                      {review.name}
                    </span>
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
            className="bg-[#eef2e6] border-t-12 rounded-t-3xl rounded-b-lg shadow-lg p-6 md:p-8"
            style={{ borderTopColor: primaryColor }}
          >
            <div className="text-center border-b border-gray-300 pb-6 mb-8">
              <h2
                className="text-2xl md:text-3xl font-bold"
                style={{ color: primaryColor }}
              >
                অর্ডার করতে নিচের ফর্মটি সম্পূর্ণ পূরন করুন
              </h2>
              {error && <p className="text-red-500 mt-2 font-bold">{error}</p>}
            </div>

            <div className="grid lg:grid-cols-2 gap-x-12 gap-y-10">
              {/* Left Column: Product Selection & Billing */}
              <div className="space-y-8">
                {/* Product Selection */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-4 uppercase text-sm tracking-wider">
                    Your Products
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {landingPage.products.map((lp, index) => (
                      <div
                        key={lp.id}
                        className={`border-2 p-3 rounded flex gap-3 relative transition-all cursor-pointer bg-white ${
                          selectedProductIndex === index
                            ? "border-primary-color ring-2 ring-primary-color ring-opacity-20"
                            : "border-gray-200 opacity-60 hover:opacity-100"
                        }`}
                        style={{
                          borderColor:
                            selectedProductIndex === index
                              ? primaryColor
                              : "#e5e7eb",
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
                        <div className="w-16 h-20 shrink-0 ml-6">
                          <Image
                            src={lp.product.images[0]}
                            alt={lp.product.name}
                            width={64}
                            height={80}
                            className="w-full h-full object-cover border"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex flex-col justify-between">
                          <p className="text-xs font-bold leading-tight">
                            {lp.product.name}
                          </p>
                          <div className="flex items-center border border-gray-300 rounded w-max mt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(index, -1);
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
                                e.stopPropagation();
                                updateQuantity(index, 1);
                              }}
                              className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-xs font-bold"
                            >
                              +
                            </button>
                          </div>
                          <p
                            className="font-bold text-sm mt-1"
                            style={{ color: primaryColor }}
                          >
                            ৳ {lp.product.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Billing Details */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-4 uppercase text-sm tracking-wider">
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
                        আপনার মোবাইল নাম্বার{" "}
                        <span className="text-red-500">*</span>
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
                <h3 className="font-bold text-gray-800 mb-4 uppercase text-sm tracking-wider">
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
                        <Image
                          src={selectedProduct.images[0]}
                          alt={selectedProduct.name}
                          width={48}
                          height={56}
                          className="w-12 h-14 object-cover border"
                          sizes="48px"
                        />
                        <span className="text-sm font-bold text-gray-700 max-w-50 leading-tight">
                          {selectedProduct.name} <br />
                          <span className="font-normal text-gray-500">
                            × {selectedQuantity}
                          </span>
                        </span>
                      </div>
                      <span className="font-bold text-sm text-gray-800">
                        ৳ {subtotal}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between py-3 border-b border-gray-200 text-sm">
                    <span className="font-bold text-gray-800">Subtotal</span>
                    <span className="font-bold text-gray-800">
                      ৳ {subtotal}
                    </span>
                  </div>

                  <div className="flex justify-between py-3 border-b border-gray-200 text-sm">
                    <span className="font-bold text-gray-800">Shipment</span>
                    <span className="font-bold text-gray-800">
                      Delivery Charge: ৳ {shippingCost}
                    </span>
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
  );
}
