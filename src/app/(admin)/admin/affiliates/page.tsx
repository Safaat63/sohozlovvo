import { getAffiliates } from "@/actions/affiliates"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, DollarSign } from "lucide-react"
import Link from "next/link"

export default async function AffiliatesPage() {
    const affiliates = await getAffiliates()

    const totalEarnings = affiliates.reduce((sum, a) => sum + Number(a.totalEarnings), 0)
    const activeAffiliates = affiliates.filter((a) => a.isActive).length

    return (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Affiliate Program</h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1">
                        Manage affiliates and track commissions
                    </p>
                </div>
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/admin/affiliates/new">Add Affiliate</Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Affiliates
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{affiliates.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {activeAffiliates} active
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Earnings
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${totalEarnings.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            All time
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Referrals
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {affiliates.reduce((sum, a) => sum + a._count.referrals, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Successful orders
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Affiliates Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Affiliates</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {affiliates.map((affiliate) => (
                            <div
                                key={affiliate.id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 last:border-0 gap-3"
                            >
                                <div className="space-y-2 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-medium text-sm sm:text-base">
                                            {affiliate.user.name || affiliate.user.email}
                                        </h3>
                                        <Badge variant={affiliate.isActive ? "default" : "secondary"} className="text-xs">
                                            {affiliate.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                                        <span className="col-span-2">Code: <code className="font-mono bg-muted px-1 rounded text-xs">{affiliate.code}</code></span>
                                        <span>Rate: {affiliate.commissionRate}%</span>
                                        <span>{affiliate._count.referrals} referrals</span>
                                        <span className="hidden sm:inline">{affiliate._count.productViews} views</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-4">
                                    <div className="text-left sm:text-right">
                                        <div className="font-medium text-sm sm:text-base">
                                            ${Number(affiliate.totalEarnings).toFixed(2)}
                                        </div>
                                        <div className="text-xs sm:text-sm text-muted-foreground">
                                            Available: ${Number(affiliate.availableBalance).toFixed(2)}
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" asChild className="shrink-0">
                                        <Link href={`/admin/affiliates/${affiliate.id}`}>
                                            Details
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {affiliates.length === 0 && (
                            <p className="text-center text-muted-foreground py-8 text-sm sm:text-base">
                                No affiliates yet. Click &quot;Add Affiliate&quot; to get started.
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
