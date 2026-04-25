"use client"

import { deleteNewsletterSubscriber, toggleNewsletterStatus } from "@/actions/admin-newsletter"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { useState } from "react"

interface NewsletterActionsProps {
    id: string
    isActive: boolean
}

export default function NewsletterActions({ id, isActive }: NewsletterActionsProps) {
    const [loading, setLoading] = useState(false)

    const handleToggle = async () => {
        setLoading(true)
        await toggleNewsletterStatus(id, !isActive)
        setLoading(false)
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this subscriber?")) return
        setLoading(true)
        await deleteNewsletterSubscriber(id)
        setLoading(false)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={loading}>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleToggle}>
                    {isActive ? (
                        <>
                            <ToggleLeft className="h-4 w-4 mr-2" />
                            Deactivate
                        </>
                    ) : (
                        <>
                            <ToggleRight className="h-4 w-4 mr-2" />
                            Activate
                        </>
                    )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
