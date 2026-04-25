import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPublicSettings } from "@/actions/settings"
import { CheckCircle2, TruckIcon, Shield, HeadphonesIcon, Award, Users, Sparkles } from "lucide-react"

export default async function AboutPage() {
    const settings = await getPublicSettings()

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-5xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-12 md:mb-16">
                    <Badge className="mb-4" variant="secondary">About Us</Badge>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 dark:text-white">
                        Welcome to {settings.store_name}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                        Your trusted destination for quality products and exceptional shopping experiences in Bangladesh
                    </p>
                </div>

                {/* Our Story */}
                <Card className="mb-8">
                    <CardContent className="p-6 md:p-8">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4 dark:text-white">Our Story</h2>
                        <div className="space-y-4 text-muted-foreground">
                            <p>
                                It&apos;s been four years since we started our journey with a dream. Like other beginners, we tried different types of business and explored many paths. Some of them clicked and some didn&apos;t - but from every side we learned something valuable which helped us to set the final decision towards our dream.
                            </p>
                            <p>
                                Over the time we realized, we don&apos;t want to run just a business, we want to build something meaningful where people can connect them with their emotions. That&apos;s why we decided to grow Abru Lifestyle as a true lifestyle brand.
                            </p>
                            <p>
                                We opened Abru Lifestyle for both men and women. Our goal is to serve people who love style, quality and comfort in their everyday life. We strongly believe that quality products shouldn&apos;t be expensive or out of reach for the general people. That&apos;s why, we focus on providing high-quality items at a reasonable price.
                            </p>
                            <p>
                                Our brand is inspired by traditional beauty and culture, mixed with a modern vibe. We want our customers to feel confident, stylish and connected to their roots - altogether. We&apos;re not just selling products, we&apos;re building a lifestyle.
                            </p>
                            <p>
                                We spent four years learning and growing so that today, we can offer you the very best. Welcome to the family - where tradition meets modern living.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Our Values */}
                <div className="mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center dark:text-white">
                        Why Choose Us
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                                        <CheckCircle2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 dark:text-white">Quality Assured</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Every product is carefully inspected to ensure you receive only the best quality items
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                                        <TruckIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 dark:text-white">Fast Delivery</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Swift and reliable delivery across Bangladesh, with tracking available on all orders
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 mb-4">
                                        <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 dark:text-white">Secure Shopping</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Your data and transactions are protected with industry-leading security measures
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900 mb-4">
                                        <HeadphonesIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 dark:text-white">24/7 Support</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Our dedicated customer service team is always ready to assist you
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="p-3 rounded-full bg-pink-100 dark:bg-pink-900 mb-4">
                                        <Award className="h-8 w-8 text-pink-600 dark:text-pink-400" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 dark:text-white">Best Prices</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Competitive pricing and regular deals to give you the best value for your money
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="p-3 rounded-full bg-teal-100 dark:bg-teal-900 mb-4">
                                        <Users className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 dark:text-white">Customer First</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Your satisfaction is our top priority, backed by hassle-free returns and refunds
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Card className="mb-8 bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                    <CardContent className="p-8 md:p-12">
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <Sparkles className="h-6 w-6 text-yellow-500" />
                            <h2 className="text-2xl md:text-3xl font-bold text-center dark:text-white">
                                Our Achievements
                            </h2>
                            <Sparkles className="h-6 w-6 text-yellow-500" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                    10k+
                                </div>
                                <div className="text-sm md:text-base text-muted-foreground">Happy Customers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                                    5k+
                                </div>
                                <div className="text-sm md:text-base text-muted-foreground">Products</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                                    98%
                                </div>
                                <div className="text-sm md:text-base text-muted-foreground">Satisfaction Rate</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                                    50+
                                </div>
                                <div className="text-sm md:text-base text-muted-foreground">Cities Covered</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact CTA */}
                <Card className="text-center">
                    <CardContent className="p-8 md:p-12">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4 dark:text-white">
                            Have Questions?
                        </h2>
                        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                            We&apos;d love to hear from you. Whether you have a question about products, pricing,
                            or anything else, our team is ready to answer all your questions.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {settings.store_email && (
                                <a
                                    href={`mailto:${settings.store_email}`}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6"
                                >
                                    Email Us
                                </a>
                            )}
                            {settings.store_phone && (
                                <a
                                    href={`tel:${settings.store_phone}`}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-6"
                                >
                                    Call Us
                                </a>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
