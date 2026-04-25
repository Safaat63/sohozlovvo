"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

type SpecialOffer = {
    id: string
    title: string
    productLink: string | null
    endDate: Date
}

export function OfferCountdownWidget({ offers }: { offers: SpecialOffer[] }) {
    if (offers.length === 0) {
        return null
    }

    return (
        <div className="grid-cols-1 md:grid-cols-2 grid gap-2">
            {offers.map((offer) => (
                <OfferCountdown key={offer.id} offer={offer} />
            ))}
        </div>
    )
}

function OfferCountdown({ offer }: { offer: SpecialOffer }) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number
        hours: number
        minutes: number
        seconds: number
    } | null>(null)

    useEffect(() => {
        const calculateTimeLeft = () => {
            // Get current time in GMT+6 (Dhaka timezone)
            const now = new Date()
            const gmtPlus6Offset = 6 * 60 // GMT+6 in minutes
            const localOffset = now.getTimezoneOffset() // Local offset in minutes (negative for east of UTC)
            const offsetDifference = gmtPlus6Offset + localOffset
            const currentTimeGMTPlus6 = new Date(now.getTime() + offsetDifference * 60 * 1000)

            const difference = new Date(offer.endDate).getTime() - currentTimeGMTPlus6.getTime()

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                })
            } else {
                setTimeLeft(null)
            }
        }

        calculateTimeLeft()
        const timer = setInterval(calculateTimeLeft, 1000)

        return () => clearInterval(timer)
    }, [offer.endDate])

    if (!timeLeft) {
        return null
    }

    return (
        <div className="rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30 p-4 md:p-6">
            <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-red-600 dark:text-red-400" />
                <h3 className="font-bold text-lg md:text-xl text-gray-900 dark:text-white">{offer.title}</h3>
            </div>

            <div className="flex items-center gap-4 mb-4 mx-auto">
                <div className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-orange-100 dark:border-orange-800 min-w-17.5">
                    <span className="text-2xl font-black text-red-600 dark:text-red-400 font-mono">{String(timeLeft.hours).padStart(2, "0")}</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-600 dark:text-gray-400">Hrs</span>
                </div>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">:</span>
                <div className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-orange-100 dark:border-orange-800 min-w-17.5">
                    <span className="text-2xl font-black text-red-600 dark:text-red-400 font-mono">{String(timeLeft.minutes).padStart(2, "0")}</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-600 dark:text-gray-400">Mins</span>
                </div>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">:</span>
                <div className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-orange-100 dark:border-orange-800 min-w-17.5">
                    <span className="text-2xl font-black text-red-600 dark:text-red-400 font-mono">{String(timeLeft.seconds).padStart(2, "0")}</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-600 dark:text-gray-400">Secs</span>
                </div>
            </div>

            {offer.productLink && (
                <Link href={offer.productLink}>
                    <Button className="w-full rounded-3xl hover:bg-accent" variant="default">
                        Shop Now
                    </Button>
                </Link>
            )}
        </div>
    )
}
