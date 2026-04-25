"use client"

import { signOut } from "next-auth/react"

export function MobileLogoutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center py-2 px-2 text-sm font-medium text-destructive hover:text-destructive/80 hover:bg-red-50 dark:hover:bg-red-950 rounded-md w-full text-left"
        >
            Sign out
        </button>
    )
}
