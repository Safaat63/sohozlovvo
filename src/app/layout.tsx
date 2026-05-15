import type { Metadata } from "next";
import { Hind_Siliguri, Open_Sans } from "next/font/google";
import { getPublicSettings } from "@/actions/settings";
import { getCart } from "@/actions/cart";
import { ServiceWorkerRegistration } from "@/components/providers/service-worker-registration";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { GoogleTagManager } from "@next/third-parties/google";
import FloatingCart from "@/components/home/floating-cart-summary";
import FloatingChat from "@/components/home/floating-chat";
import { ThemeProvider } from "next-themes";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["latin", "bengali"],
  weight: ["300", "400", "500", "600", "700"],
});

const openSans = Open_Sans({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: settings.meta_title,
    description: settings.meta_description,
    appleWebApp: {
      title: settings.store_name,
    },
    manifest: "/manifest.json",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cart = await getCart();

  const itemCount =
    (cart?.items ?? []).reduce(
      (sum: number, item: { quantity: number }) => sum + item.quantity,
      0
    );

  const serializedCart = cart ? {
    id: cart.id,
    items: cart.items.map((item) => {
      const combination = item.combination;
      const combinationLabel = combination?.options
        ?.map(o => `${o.option.variation.variationName}: ${o.option.optionName}`)
        .join(", ") || null;

      let basePrice = combination?.price
        ? Number(combination.price)
        : Number(item.product.price);

      const product = item.product;
      if (product.discountType && product.discountValue && Number(product.discountValue) > 0) {
        const now = new Date();
        let isDiscountValid = true;

        if (product.discountStartDate && now < new Date(product.discountStartDate)) {
          isDiscountValid = false;
        }
        if (product.discountEndDate && now > new Date(product.discountEndDate)) {
          isDiscountValid = false;
        }

        if (isDiscountValid) {
          if (product.discountType === "PERCENTAGE") {
            const discount = (basePrice * Number(product.discountValue)) / 100;
            basePrice = basePrice - discount;
          } else if (product.discountType === "FIXED_AMOUNT") {
            basePrice = basePrice - Number(product.discountValue);
          }
          basePrice = Math.max(0, basePrice);
        }
      }

      const itemStock = combination?.stock ?? item.product.stock;

      return {
        id: item.id,
        quantity: item.quantity,
        combinationId: item.combinationId ?? null,
        combinationLabel,
        itemPrice: basePrice.toString(),
        itemStock,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: item.product.price.toString(),
          categoryId: item.product.categoryId ?? null,
          images: item.product.images,
          stock: item.product.stock,
        },
      };
    }),
  } : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="Sohozlovvo" />
        <GoogleTagManager gtmId="GTM-NJSH52CZ" />
      </head>
      <body
        className={`${hindSiliguri.variable} ${openSans.variable} antialiased font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ServiceWorkerRegistration />
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
        {/* Whatsapp floating button */}
        <FloatingChat />
        {/* Cart summary floating button */}
        <FloatingCart cart={serializedCart} itemCount={itemCount} />
      </body>
    </html>
  );
}
