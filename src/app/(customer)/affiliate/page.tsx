import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserAffiliate, getAffiliateStats } from "@/actions/affiliates"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, Users, TrendingUp, Eye, Package, Link as LinkIcon, Tag, ExternalLink } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import Link from "next/link"
import { CopyCodeButton } from "@/components/affiliate/copy-code-button"
import { AffiliateProductSearch } from "@/components/affiliate/affiliate-product-search"
import { AffiliateQRCode } from "@/components/affiliate/affiliate-qr-code"
export default async function AffiliateDashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/auth/login")
    }

    const affiliate = await getUserAffiliate(session.user.id)

    if (!affiliate) {
        return (
            <div className="container mx-auto px-4 py-8 md:py-12">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Affiliate Program</CardTitle>
                        <CardDescription>
                            You are not currently enrolled in our affiliate program.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            Join our affiliate program to earn commissions by promoting our products.
                            Contact our admin team to get started!
                        </p>
                        <Button asChild>
                            <Link href="/">Return Home</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const stats = await getAffiliateStats(affiliate.id)

    return (
        <div className="container mx-auto px-4 py-6 md:py-8 space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold">Affiliate Dashboard</h1>
                <p className="text-muted-foreground">
                    Track your performance and earnings
                </p>
            </div>

            {/* Affiliate Code Card */}
            <Card className="border-primary/20">
                <CardHeader>
                    <CardTitle className="text-lg">Your Affiliate Code</CardTitle>
                    <CardDescription>Share this code or use it in product links</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <code className="flex-1 font-mono text-lg font-semibold">
                            {affiliate.code}
                        </code>
                        <CopyCodeButton code={affiliate.code} />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium">How to use:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                            <li>Add <code className="px-1 py-0.5 bg-muted rounded">?referral={affiliate.code}</code> to any product URL</li>
                            <li>Request admin to link coupons to your affiliate account</li>
                            <li>Earn <Badge variant="secondary" className="ml-1">{affiliate.commissionRate}%</Badge> commission on referred sales</li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                        <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                            <Link href="/products">
                                <Package className="h-4 w-4 mr-2" />
                                Browse Products to Promote
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* How to Create Affiliate Links Guide */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LinkIcon className="h-5 w-5" />
                        How to Create Affiliate Links
                    </CardTitle>
                    <CardDescription>
                        Learn how to generate affiliate links and start earning commissions
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div className="border-l-4 border-blue-500 pl-4 py-2">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs">1</span>
                                Method 1: Add to Product URLs
                            </h4>
                            <p className="text-sm text-muted-foreground mt-2">
                                Add your affiliate code to any product URL:
                            </p>
                            <div className="mt-2 p-2 bg-muted rounded-md">
                                <code className="text-xs break-all">
                                    https://example.com/products/product-name<span className="text-green-600 font-semibold">?referral={affiliate.code}</span>
                                </code>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                When customers click this link and make a purchase, you earn {affiliate.commissionRate}% commission!
                            </p>
                        </div>

                        <div className="border-l-4 border-purple-500 pl-4 py-2">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 bg-purple-500 text-white rounded-full text-xs">2</span>
                                Method 2: Linked Coupons
                            </h4>
                            <p className="text-sm text-muted-foreground mt-2">
                                Ask admin to link discount coupons to your affiliate account. When customers use your linked coupon code, you automatically earn commissions!
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                                <Tag className="h-4 w-4 text-purple-500" />
                                <span className="text-xs text-muted-foreground">No URL modification needed - works with any coupon code</span>
                            </div>
                        </div>

                        <div className="border-l-4 border-green-500 pl-4 py-2">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full text-xs">3</span>
                                How It Works
                            </h4>
                            <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                                <li>Customer visits your affiliate link or uses your coupon</li>
                                <li>System tracks them as your referral</li>
                                <li>When they complete a purchase, you earn {affiliate.commissionRate}% commission</li>
                                <li>Track all your earnings and referrals in this dashboard</li>
                            </ul>
                        </div>

                        <div className="border-l-4 border-orange-500 pl-4 py-2">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 bg-orange-500 text-white rounded-full text-xs">4</span>
                                Best Practices
                            </h4>
                            <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                                <li>Share links on social media, blogs, or websites</li>
                                <li>Promote products you genuinely recommend</li>
                                <li>Provide value to your audience with honest reviews</li>
                                <li>Check your dashboard regularly to track performance</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <Button variant="outline" size="sm" className="w-full" asChild>
                            <Link href="/products">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Start Creating Affiliate Links
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Product Search & QR Code Tools */}
            <div className="grid gap-6 lg:grid-cols-2">
                <AffiliateProductSearch affiliateCode={affiliate.code} />
                <AffiliateQRCode affiliateCode={affiliate.code} />
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Earnings
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(Number(affiliate.totalEarnings), "৳")}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {affiliate.commissionRate}% commission rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Referrals
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.stats.totalReferrals}</div>
                        <p className="text-xs text-muted-foreground">
                            Successful orders
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(Number(stats.stats.approvedEarnings), "৳")}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Generated from referrals
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Product Views
                        </CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.stats.totalViews}</div>
                        <p className="text-xs text-muted-foreground">
                            Via your links
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Referrals */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Referrals</CardTitle>
                    <CardDescription>Your latest successful referrals</CardDescription>
                </CardHeader>
                <CardContent>
                    {stats.referrals.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No referrals yet</p>
                            <p className="text-sm mt-1">Start sharing your affiliate links to earn commissions!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {stats.referrals.map((referral) => (
                                <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            Order #{referral.order.orderNumber}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(referral.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-sm font-medium">
                                            {formatCurrency(Number(referral.order.total), "৳")}
                                        </p>
                                        <p className="text-xs text-green-600 dark:text-green-400">
                                            +{formatCurrency(Number(referral.commissionAmount), "৳")} earned
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Status Badge */}
            {!affiliate.isActive && (
                <Card className="border-yellow-200 dark:border-yellow-900">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:text-yellow-400">
                                Inactive
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                                Your affiliate account is currently inactive. Contact admin for assistance.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
