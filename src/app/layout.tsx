import type { Metadata } from "next";
import { Hind_Siliguri, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/footer";
import { FloatingSocialButtons } from "@/components/floating-social-buttons";
import { getPublicSettings } from "@/actions/settings";
import { ThemeProvider } from "@/components/theme-provider";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { Toaster } from "@/components/ui/sonner";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["latin", "bengali"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
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
        <meta name="apple-mobile-web-app-title" content="Abru Life Style" />
      </head>
      <body
        className={`${hindSiliguri.variable} ${geistMono.variable} antialiased font-hind-siliguri`}
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
          <FloatingSocialButtons />
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
