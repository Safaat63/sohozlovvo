"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type PromotionalSection = {
    id: string
    title: string
    subtitle: string | null
    description: string | null
    discount: string | null
    image: string | null
    link: string | null
    buttonText: string | null
}

export function PromotionalSectionsDisplay({ sections }: { sections: PromotionalSection[] }) {
    if (sections.length === 0) {
        return null
    }

    return (
        <section className="py-8 md:py-12">
            <div className="container max-w-360 mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-8">
                    {sections.map((section) => (
                        <div
                            key={section.id}
                            className="rounded-lg border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Content */}
                                <div className="p-6 md:p-8 flex flex-col justify-center order-2 md:order-1">
                                    <h3 className="text-xl md:text-2xl font-bold mb-2">
                                        {section.title}
                                    </h3>
                                    {section.subtitle && (
                                        <p className="text-sm md:text-base text-muted-foreground mb-3">
                                            {section.subtitle}
                                        </p>
                                    )}
                                    {section.discount && (
                                        <div className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400 mb-3">
                                            {section.discount}
                                        </div>
                                    )}
                                    {section.description && (
                                        <p className="text-sm text-muted-foreground mb-4">
                                            {section.description}
                                        </p>
                                    )}
                                    {section.link && (
                                        <Link href={section.link} className="inline-block">
                                            <Button>
                                                {section.buttonText || "Shop Now"}
                                            </Button>
                                        </Link>
                                    )}
                                </div>

                                {/* Image */}
                                {section.image && (
                                    <div className="relative aspect-square md:aspect-auto order-1 md:order-2">
                                        <Image
                                            src={section.image}
                                            alt={section.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
