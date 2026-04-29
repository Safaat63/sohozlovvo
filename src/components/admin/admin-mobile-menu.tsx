"use client"

import { useState } from "react"
import Link from "next/link"
import * as LucideIcons from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

type NavItem = {
    href: string
    label: string
    icon: string
    group: string
}

export function AdminMobileMenu({ navItems }: { navItems: NavItem[] }) {
    const [open, setOpen] = useState(false)

    const groups = navItems.reduce((acc, item) => {
        if (!acc[item.group]) acc[item.group] = []
        acc[item.group].push(item)
        return acc
    }, {} as Record<string, typeof navItems>)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                    <LucideIcons.Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-65">
                <SheetHeader>
                    <SheetTitle className="text-left">Admin Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 overflow-y-auto max-h-[calc(100vh-80px)]">
                    <nav className="space-y-4">
                        {Object.entries(groups).map(([groupName, items]) => (
                            <div key={groupName}>
                                <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {groupName}
                                </h3>
                                <div className="space-y-1">
                                    {items.map((item) => {
                                        const Icon = (LucideIcons as any)[item.icon]
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-md text-sm"
                                                onClick={() => setOpen(false)}
                                            >
                                                {Icon && <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                                                <span className="font-medium">{item.label}</span>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>
            </SheetContent>
        </Sheet>
    )
}
