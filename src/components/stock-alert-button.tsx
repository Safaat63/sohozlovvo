"use client"

import { useState } from "react"
import { createStockAlert } from "@/actions/stock-alerts"
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
import { Bell } from "lucide-react"

interface StockAlertButtonProps {
  productId: string
  productName: string
}

export function StockAlertButton({ productId, productName }: StockAlertButtonProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [open, setOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const result = await createStockAlert(email, productId)

    setMessage({
      type: result.success ? "success" : "error",
      text: result.message,
    })

    if (result.success) {
      setEmail("")
      setTimeout(() => setOpen(false), 2000)
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Bell className="mr-2 h-4 w-4" />
          Notify When Available
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stock Alert for {productName}</DialogTitle>
          <DialogDescription>
            Enter your email and we&apos;ll notify you when this product is back in stock.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Setting up alert..." : "Notify Me"}
          </Button>
          {message && (
            <p className={`text-sm ${message.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {message.text}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
