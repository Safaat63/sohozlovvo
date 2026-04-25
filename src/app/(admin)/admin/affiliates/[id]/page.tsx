import { getAffiliates, getAdminAffiliateStats } from "@/actions/affiliates"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"
import { DollarSign, Users, TrendingUp, Eye, Mail, Calendar, ArrowLeft } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import Link from "next/link"
import { AffiliateToggleButton } from "./affiliate-toggle-button"
import { AffiliateRateEditor } from "./affiliate-rate-editor"

export default async function AffiliateDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const affiliates = await getAffiliates()
    const affiliate = affiliates.find(a => a.id === id)

    if (!affiliate) {
        notFound()
    }

    const stats = await getAdminAffiliateStats(affiliate.id)

    if (!stats) {
        notFound()
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/affiliates">
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back
                            </Link>
                        </Button>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Affiliate Details</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        {affiliate.user.name || affiliate.user.email}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={affiliate.isActive ? "default" : "secondary"}>
                        {affiliate.isActive ? "Active" : "Inactive"}
                    </Badge>
                </div>
            </div>

            {/* User Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Affiliate Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium">{affiliate.user.name || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                Email
                            </p>
                            <p className="font-medium">{affiliate.user.email}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Affiliate Code</p>
                            <code className="font-mono text-sm font-semibold bg-muted px-2 py-1 rounded">
                                {affiliate.code}
                            </code>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Joined
                            </p>
                            <p className="font-medium">
                                {new Date(affiliate.createdAt).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 border-t space-y-3">
                        <AffiliateRateEditor
                            affiliateId={affiliate.id}
                            currentRate={affiliate.commissionRate}
                        />
                        <AffiliateToggleButton
                            affiliateId={affiliate.id}
                            isActive={affiliate.isActive}
                        />
                    </div>
                </CardContent>
            </Card>

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
                            Via affiliate links
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Referrals */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Referrals</CardTitle>
                    <CardDescription>Latest successful referrals from this affiliate</CardDescription>
                </CardHeader>
                <CardContent>
                    {stats.referrals.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No referrals yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {stats.referrals.map((referral) => (
                                <div key={referral.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 border rounded-lg">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            Order #{referral.order.orderNumber}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(referral.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right space-y-1">
                                            <p className="text-sm font-medium">
                                                Order: {formatCurrency(Number(referral.order.total), "৳")}
                                            </p>
                                            <p className="text-xs text-green-600 dark:text-green-400">
                                                Commission: {formatCurrency(Number(referral.commissionAmount), "৳")}
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/orders/${referral.orderId}`}>
                                                View Order
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
