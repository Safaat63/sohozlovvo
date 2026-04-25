"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

async function checkAdminAccess() {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/")
    }
    return session
}

// Generate a unique affiliate code
function generateAffiliateCode(name: string): string {
    const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, "")
    const random = Math.random().toString(36).substring(2, 8)
    return `${sanitized}-${random}`
}

export async function createAffiliate(userId: string, commissionRate: number = 10.0) {
    await checkAdminAccess()

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) {
            return { error: "User not found" }
        }

        // Check if user already has an affiliate account
        const existingAffiliate = await prisma.affiliate.findUnique({
            where: { userId },
        })

        if (existingAffiliate) {
            return { error: "User already has an affiliate account" }
        }

        const code = generateAffiliateCode(user.name || user.email)

        const affiliate = await prisma.affiliate.create({
            data: {
                userId,
                code,
                commissionRate,
            },
        })

        revalidatePath("/admin/affiliates")
        return { success: true, affiliate }
    } catch (error) {
        console.error("Error creating affiliate:", error)
        return { error: "Failed to create affiliate" }
    }
}

export async function createAffiliateByEmail(email: string, commissionRate: number = 10.0) {
    await checkAdminAccess()

    try {
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            return { error: "User not found with this email" }
        }

        // Check if user already has an affiliate account
        const existingAffiliate = await prisma.affiliate.findUnique({
            where: { userId: user.id },
        })

        if (existingAffiliate) {
            return { error: "User already has an affiliate account" }
        }

        const code = generateAffiliateCode(user.name || user.email)

        const affiliate = await prisma.affiliate.create({
            data: {
                userId: user.id,
                code,
                commissionRate,
            },
        })

        revalidatePath("/admin/affiliates")
        return { success: true, affiliate }
    } catch (error) {
        console.error("Error creating affiliate:", error)
        return { error: "Failed to create affiliate" }
    }
}

export async function updateAffiliate(affiliateId: string, data: { commissionRate?: number; isActive?: boolean }) {
    await checkAdminAccess()

    try {
        const affiliate = await prisma.affiliate.update({
            where: { id: affiliateId },
            data,
        })

        revalidatePath("/admin/affiliates")
        return { success: true, affiliate }
    } catch (error) {
        console.error("Error updating affiliate:", error)
        return { error: "Failed to update affiliate" }
    }
}

export async function getAffiliates() {
    await checkAdminAccess()

    return prisma.affiliate.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            _count: {
                select: {
                    referrals: true,
                    productViews: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    })
}

export async function getAffiliateByCode(code: string) {
    return prisma.affiliate.findUnique({
        where: { code, isActive: true },
        select: {
            id: true,
            code: true,
            commissionRate: true,
        },
    })
}

export async function getUserAffiliate(userId: string) {
    return prisma.affiliate.findUnique({
        where: { userId },
        include: {
            _count: {
                select: {
                    referrals: true,
                    productViews: true,
                },
            },
        },
    })
}

export async function getAffiliateStats(affiliateId: string) {
    const affiliate = await prisma.affiliate.findUnique({
        where: { id: affiliateId },
        include: {
            referrals: {
                include: {
                    order: {
                        select: {
                            id: true,
                            orderNumber: true,
                            total: true,
                            createdAt: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 10,
            },
            productViews: {
                select: {
                    createdAt: true,
                },
                orderBy: { createdAt: "desc" },
                take: 100,
            },
        },
    })

    if (!affiliate) {
        return null
    }

    const totalReferrals = await prisma.affiliateReferral.count({
        where: { affiliateId },
    })

    const totalViews = await prisma.productView.count({
        where: { affiliateId },
    })

    const pendingEarnings = await prisma.affiliateReferral.aggregate({
        where: { affiliateId, status: "pending" },
        _sum: { commissionAmount: true },
    })

    const approvedEarnings = await prisma.affiliateReferral.aggregate({
        where: { affiliateId, status: "approved" },
        _sum: { commissionAmount: true },
    })

    return {
        ...affiliate,
        stats: {
            totalReferrals,
            totalViews,
            pendingEarnings: pendingEarnings._sum.commissionAmount || 0,
            approvedEarnings: approvedEarnings._sum.commissionAmount || 0,
        },
    }
}

// Admin-only version for affiliate management
export async function getAdminAffiliateStats(affiliateId: string) {
    await checkAdminAccess()
    return getAffiliateStats(affiliateId)
}

export async function trackAffiliateOrder(orderId: string, affiliateCode: string) {
    try {
        const affiliate = await getAffiliateByCode(affiliateCode)
        if (!affiliate) {
            return { error: "Invalid affiliate code" }
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
        })

        if (!order) {
            return { error: "Order not found" }
        }

        const commissionAmount = (Number(order.total) * affiliate.commissionRate) / 100

        await prisma.affiliateReferral.create({
            data: {
                affiliateId: affiliate.id,
                orderId,
                orderTotal: Number(order.total),
                commissionAmount,
                commissionRate: affiliate.commissionRate,
            },
        })

        await prisma.affiliate.update({
            where: { id: affiliate.id },
            data: {
                totalEarnings: {
                    increment: commissionAmount,
                },
            },
        })

        return { success: true }
    } catch (error) {
        console.error("Error tracking affiliate order:", error)
        return { error: "Failed to track affiliate order" }
    }
}

export async function approveAffiliateReferral(referralId: string) {
    await checkAdminAccess()

    try {
        const referral = await prisma.affiliateReferral.update({
            where: { id: referralId },
            data: { status: "approved" },
        })

        await prisma.affiliate.update({
            where: { id: referral.affiliateId },
            data: {
                availableBalance: {
                    increment: referral.commissionAmount,
                },
            },
        })

        revalidatePath("/admin/affiliates")
        return { success: true }
    } catch (error) {
        console.error("Error approving referral:", error)
        return { error: "Failed to approve referral" }
    }
}

export async function createAffiliatePayout(
    affiliateId: string,
    amount: number,
    method: string,
    accountInfo?: string
) {
    await checkAdminAccess()

    try {
        const affiliate = await prisma.affiliate.findUnique({
            where: { id: affiliateId },
        })

        if (!affiliate) {
            return { error: "Affiliate not found" }
        }

        if (affiliate.availableBalance < amount) {
            return { error: "Insufficient balance" }
        }

        const payout = await prisma.affiliatePayout.create({
            data: {
                affiliateId,
                amount,
                method,
                accountInfo,
            },
        })

        await prisma.affiliate.update({
            where: { id: affiliateId },
            data: {
                availableBalance: {
                    decrement: amount,
                },
            },
        })

        revalidatePath("/admin/affiliates")
        return { success: true, payout }
    } catch (error) {
        console.error("Error creating payout:", error)
        return { error: "Failed to create payout" }
    }
}

export async function linkAffiliateToCoupon(affiliateId: string, couponId: string) {
    await checkAdminAccess()

    try {
        const link = await prisma.affiliateCoupon.create({
            data: {
                affiliateId,
                couponId,
            },
        })

        revalidatePath("/admin/affiliates")
        revalidatePath("/admin/coupons")
        return { success: true, link }
    } catch (error: unknown) {
        if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
            return { error: "Coupon already linked to this affiliate" }
        }
        console.error("Error linking coupon:", error)
        return { error: "Failed to link coupon" }
    }
}

export async function unlinkAffiliateCoupon(affiliateId: string, couponId: string) {
    await checkAdminAccess()

    try {
        await prisma.affiliateCoupon.deleteMany({
            where: {
                affiliateId,
                couponId,
            },
        })

        revalidatePath("/admin/affiliates")
        revalidatePath("/admin/coupons")
        return { success: true }
    } catch (error) {
        console.error("Error unlinking coupon:", error)
        return { error: "Failed to unlink coupon" }
    }
}

export async function getAffiliateByCoupon(couponCode: string) {
    const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
        include: {
            affiliateCoupons: {
                where: { isActive: true },
                include: {
                    affiliate: {
                        select: {
                            id: true,
                            code: true,
                            commissionRate: true,
                        },
                    },
                },
                take: 1,
            },
        },
    })

    if (!coupon || coupon.affiliateCoupons.length === 0) {
        return null
    }

    return coupon.affiliateCoupons[0].affiliate
}
