"use client"

import { useState } from "react"
import { subscribeToNewsletter } from "@/actions/newsletter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface NewsletterSignupProps {
  variant?: "default" | "footer"
}

export function NewsletterSignup({ variant = "default" }: NewsletterSignupProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const result = await subscribeToNewsletter(email)

    setMessage({
      type: result.success ? "success" : "error",
      text: result.message,
    })

    if (result.success) {
      setEmail("")
    }

    setLoading(false)
  }

  if (variant === "footer") {
    return (
      <div className="w-full">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-3 rounded-xl border-none bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 ring-1 ring-white/20 dark:ring-gray-700 focus:ring-2 focus:ring-white/40 dark:focus:ring-gray-600 outline-none transition-shadow"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "Subscribe"}
          </button>
        </form>
        {message && (
          <p
            className={`mt-2 text-sm ${message.type === "success"
              ? "text-white dark:text-white"
              : "text-red-600 dark:text-red-300"
              }`}
          >
            {message.text}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3 sm:gap-2"
      >
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 w-full"
          disabled={loading}
        />
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>
      {message && (
        <p
          className={`mt-2 text-sm text-center sm:text-left ${message.type === "success"
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400"
            }`}
        >
          {message.text}
        </p>
      )}
    </div>
  )
}
