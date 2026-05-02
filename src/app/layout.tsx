import type { Metadata } from "next";
import { Hind_Siliguri, Open_Sans } from "next/font/google";
import { FloatingSocialButtons } from "@/components/ui/floating-social-buttons";
import { getPublicSettings } from "@/actions/settings";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ServiceWorkerRegistration } from "@/components/providers/service-worker-registration";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import Footer from "@/components/footer/footer-new";
import { GoogleTagManager } from '@next/third-parties/google'

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
    manifest: '/manifest.json',
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="Sohozlovvo" />
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
          <Footer />
          <Toaster position="top-right" richColors />
        </ThemeProvider>
        <FloatingSocialButtons />
      </body>
      <GoogleTagManager gtmId="GTM-NJSH52CZ" />
    </html>
  );
}
