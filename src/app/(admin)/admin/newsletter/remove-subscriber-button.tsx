"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { removeNewsletterSubscriber } from "@/actions/newsletter"
import { toast } from "sonner"

export function RemoveSubscriberButton({ email }: { email: string }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleRemove = () => {
        if (!confirm(`Remove ${email} from newsletter?`)) return

        startTransition(async () => {
            const result = await removeNewsletterSubscriber(email)
            if (result.success) {
                toast.success(result.message)
                router.refresh()
            } else if (result.error) {
                toast.error(result.error)
            }
        })
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={isPending}
            className="text-red-600 hover:text-red-700"
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
