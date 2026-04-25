import { getAllNewsletterSubscribers } from "@/actions/admin-newsletter"
import { exportNewsletterToCSV } from "@/actions/admin-export"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExportButton } from "@/components/export-button"
import { Mail, Trash2, Users } from "lucide-react"
import { redirect } from "next/navigation"
import { AddSubscriberButton } from "./add-subscriber-button"
import { SendNewsletterButton } from "./send-newsletter-button"
import { NewsletterTable } from "./newsletter-table"

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const limit = parseInt(params.limit || "20")

  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  const { subscribers, pagination } = await getAllNewsletterSubscribers({ page, limit })

  const stats = await prisma.newsletter.aggregate({
    where: { isActive: true },
    _count: true,
  })

  const totalSubscribers = pagination.total
  const activeSubscribers = stats._count || 0

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl md:text-3xl font-bold dark:text-white">Newsletter Subscribers</h1>
        <div className="flex flex-wrap gap-2">
          <AddSubscriberButton />
          <ExportButton onExport={exportNewsletterToCSV} filename="newsletter-subscribers" label="Export CSV" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscribers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              {totalSubscribers > 0
                ? Math.round((activeSubscribers / totalSubscribers) * 100)
                : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscribers - activeSubscribers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Subscribers Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Subscribers</CardTitle>
            <SendNewsletterButton activeCount={activeSubscribers} />
          </div>
        </CardHeader>
        <CardContent>
          <NewsletterTable
            subscribers={subscribers}
            pagination={pagination}
            currentLimit={limit}
          />
        </CardContent>
      </Card>
    </div>
  )
}
