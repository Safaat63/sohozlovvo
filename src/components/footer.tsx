import Link from "next/link"
import { getPublicSettings } from "@/actions/settings"
import { Facebook, Instagram, Twitter, MessageCircle, CreditCard, Wallet, Landmark } from "lucide-react"
import { NewsletterSignup } from "./newsletter-signup"
import Image from "next/image"

export async function Footer() {
    const settings = await getPublicSettings()
    const storeName = settings.store_name || "LuxeStore"

    return (
        <footer className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white pt-16 pb-8">
            <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
                {/* Newsletter Section */}
                <div className="bg-primary rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 mb-16 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-20"></div>
                    <div className="relative z-10 max-w-lg">
                        <h2 className="text-2xl md:text-3xl font-extrabold mb-2 text-white">Join our newsletter</h2>
                        <p className="text-white/90">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals in shaa Allah.</p>
                    </div>
                    <div className="relative z-10 w-full max-w-md">
                        <NewsletterSignup variant="footer" />
                    </div>
                </div>

                {/* Footer Links Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                    {/* Brand Section */}
                    <div className="col-span-2 lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            {settings.logo_url ? (
                                <Image src={settings.logo_url} alt={storeName} width={32} height={32} className="h-8 w-auto object-contain" />
                            ) : (
                                <div className="w-8 h-8 text-white">
                                    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                    </svg>
                                </div>
                            )}
                            <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">{storeName}</span>
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xs leading-relaxed">
                            Your destination for premium fashion and lifestyle products. Quality, sustainability, and style in every stitch.
                        </p>
                        {/* Social Links */}
                        <div className="flex gap-4 mt-6">
                            {settings.facebook_url && (
                                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors" aria-label="Facebook">
                                    <Facebook className="h-5 w-5" />
                                </a>
                            )}
                            {settings.instagram_url && (
                                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors" aria-label="Instagram">
                                    <Instagram className="h-5 w-5" />
                                </a>
                            )}
                            {settings.twitter_url && (
                                <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors" aria-label="Twitter">
                                    <Twitter className="h-5 w-5" />
                                </a>
                            )}
                            {settings.whatsapp_number && (
                                <a href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors" aria-label="WhatsApp">
                                    <MessageCircle className="h-5 w-5" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Shop</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li><Link href="/products?sortBy=newest" className="hover:text-primary transition-colors">New Arrivals</Link></li>
                            <li><Link href="/products?sortBy=bestselling" className="hover:text-primary transition-colors">Best Sellers</Link></li>
                            <li><Link href="/categories" className="hover:text-primary transition-colors">Categories</Link></li>
                            <li><Link href="/products" className="hover:text-primary transition-colors">All Products</Link></li>
                            <li><Link href="/products?hasDiscount=true" className="hover:text-primary transition-colors">Sale</Link></li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Support</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li><Link href="/faq" className="hover:text-primary transition-colors">Help Center</Link></li>
                            <li><Link href="/returns" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                            <li><Link href="/feedback" className="hover:text-primary transition-colors">Feedback</Link></li>
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Company</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-300 dark:border-gray-800 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                        <p className="text-gray-600 dark:text-gray-500 text-sm">© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
                        <div className="flex items-center gap-4 text-gray-600 dark:text-gray-500">
                            <CreditCard className="h-6 w-6" />
                            <Wallet className="h-6 w-6" />
                            <Landmark className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-500 dark:text-gray-600 text-sm">
                            Developed by <Link href="https://miftahcoding.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">MiftahCoding</Link>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
