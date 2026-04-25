import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AffiliateCouponUnlinkButton } from "./unlink-button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function AdminAffiliateCouponsPage() {
    const affiliateCoupons = await prisma.affiliateCoupon.findMany({
        include: {
            affiliate: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            coupon: {
                select: {
                    id: true,
                    code: true,
                    description: true,
                    discountType: true,
                    discountValue: true,
                    isActive: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Affiliate Coupons</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage coupon-to-affiliate linkings
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/coupons">
                        <Plus className="h-4 w-4 mr-2" />
                        Link Coupon
                    </Link>
                </Button>
            </div>

            {affiliateCoupons.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">
                            No affiliate coupons linked yet. Go to Coupons to link them to affiliates.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href="/admin/coupons">Manage Coupons</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {affiliateCoupons.map((link) => (
                        <Card key={link.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-mono">
                                            {link.coupon.code}
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            {link.coupon.description || "No description"}
                                        </CardDescription>
                                    </div>
                                    <Badge variant={link.isActive ? "success" : "secondary"}>
                                        {link.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="text-sm font-medium">Affiliate</div>
                                    <div className="text-sm text-muted-foreground">
                                        <div className="font-medium">
                                            {link.affiliate.user.name || link.affiliate.user.email}
                                        </div>
                                        <div className="text-xs">
                                            Code: <code className="bg-muted px-1 rounded">{link.affiliate.code}</code>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm font-medium">Coupon Details</div>
                                    <div className="text-sm text-muted-foreground">
                                        {link.coupon.discountType === "PERCENTAGE"
                                            ? `${link.coupon.discountValue}% off`
                                            : `৳${link.coupon.discountValue} off`
                                        }
                                    </div>
                                    <Badge variant={link.coupon.isActive ? "default" : "secondary"}>
                                        Coupon {link.coupon.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>

                                <div className="flex gap-2 pt-2 border-t">
                                    <Button asChild variant="outline" size="sm" className="flex-1">
                                        <Link href={`/admin/coupons/${link.coupon.id}/edit`}>
                                            Edit Coupon
                                        </Link>
                                    </Button>
                                    <AffiliateCouponUnlinkButton
                                        affiliateId={link.affiliateId}
                                        couponId={link.couponId}
                                        couponCode={link.coupon.code}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
