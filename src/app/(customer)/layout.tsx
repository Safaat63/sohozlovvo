import { getPublicSettings } from "@/actions/settings";
import Footer from "@/components/footer/footer-new";
import { Navbar } from "@/components/navbar/navbar"
import { CurrencyProvider } from "@/components/providers/currency-provider"
import { GoogleTagManager } from "@next/third-parties/google";

export const dynamic = 'force-dynamic'

export default async function BlogLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const settings = await getPublicSettings();
    const currencySymbol = settings.currency_symbol || "৳";
    return (
        <CurrencyProvider symbol={currencySymbol}>
            <Navbar storeName={settings.store_name} />
            <main className="min-h-screen bg-background">
                <div className="mx-auto w-full">
                    <GoogleTagManager gtmId="GTM-NJSH52CZ" />
                    {children}
                </div>
            </main>
            <Footer />
        </CurrencyProvider>
    )
}