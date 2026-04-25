"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { addNewsletterSubscriber } from "@/actions/newsletter"
import { toast } from "sonner"

export function AddSubscriberButton() {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            const result = await addNewsletterSubscriber(formData)
            if (result.success) {
                toast.success(result.message)
                setOpen(false)
            } else if (result.error) {
                toast.error(result.error)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subscriber
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Newsletter Subscriber</DialogTitle>
                    <DialogDescription>
                        Add a new email address to the newsletter subscribers list
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Input
                            name="email"
                            type="email"
                            placeholder="subscriber@example.com"
                            required
                            disabled={isPending}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Adding..." : "Add Subscriber"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
