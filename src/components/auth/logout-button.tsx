"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react"
import { Button } from "../ui/button"

export function LogoutButton() {
    const handleSignOut = async () => {
        // Use window.location.origin to ensure we redirect to the current domain
        const redirectUrl = `${window.location.origin}/`
        await signOut({ callbackUrl: redirectUrl, redirect: true })
    }

    return (
        <DropdownMenuItem
            className="text-destructive"
            onSelect={(e) => {
                e.preventDefault()
                handleSignOut()
            }}
        >
            <Button variant="destructive" onClick={handleSignOut} className="w-full justify-start">
                Log out
            </Button>
        </DropdownMenuItem>
    )
}
