"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"

interface CopyCodeButtonProps {
    code: string
}

export function CopyCodeButton({ code }: CopyCodeButtonProps) {
    const [copied, setCopied] = useState(false)

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            toast.success("Code copied to clipboard!")
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            toast.error("Failed to copy code")
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="shrink-0"
        >
            {copied ? (
                <Check className="h-4 w-4" />
            ) : (
                <Copy className="h-4 w-4" />
            )}
        </Button>
    )
}
