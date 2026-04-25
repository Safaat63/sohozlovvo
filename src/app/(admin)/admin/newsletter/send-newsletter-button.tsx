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
import { Mail } from "lucide-react"
import { sendBulkNewsletter } from "@/actions/newsletter"
import { toast } from "sonner"

export function SendNewsletterButton({ activeCount }: { activeCount: number }) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const subject = formData.get("subject") as string
        const message = formData.get("message") as string

        if (!subject || !message) {
            toast.error("Subject and message are required")
            return
        }

        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #2563eb, #7c3aed); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { color: white; margin: 0; }
          .content { padding: 30px; background: #fff; border: 1px solid #e5e7eb; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .unsubscribe { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Sohozlovvo Newsletter</h1>
          </div>
          <div class="content">
            <div style="white-space: pre-line;">${message}</div>
            <div class="unsubscribe">
              <p>You received this email because you subscribed to our newsletter.</p>
              <p>If you no longer wish to receive these emails, you can unsubscribe from your account settings.</p>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Sohozlovvo. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

        const newFormData = new FormData()
        newFormData.set("subject", subject)
        newFormData.set("htmlContent", htmlContent)

        startTransition(async () => {
            const result = await sendBulkNewsletter(newFormData)
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
                <Button disabled={activeCount === 0}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Newsletter ({activeCount})
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Send Newsletter Campaign</DialogTitle>
                    <DialogDescription>
                        Send an email to all {activeCount} active subscribers
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Subject</label>
                        <Input
                            name="subject"
                            placeholder="Enter email subject"
                            required
                            disabled={isPending}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Message</label>
                        <textarea
                            name="message"
                            className="w-full min-h-50 rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                            placeholder="Enter your message here..."
                            required
                            disabled={isPending}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Sending..." : `Send to ${activeCount} Subscribers`}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
