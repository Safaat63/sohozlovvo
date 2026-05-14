import { getPublicSettings } from "@/actions/settings";
import Footer from "@/components/footer/footer-new";
import { Navbar } from "@/components/navbar/navbar"
import { CurrencyProvider } from "@/components/providers/currency-provider"

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
            <main className="relative min-h-screen bg-background">
                <div className="mx-auto w-full">
                    {children}
                </div>
            </main>
            <Footer />
        </CurrencyProvider>
    )
}