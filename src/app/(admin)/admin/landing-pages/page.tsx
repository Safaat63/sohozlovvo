import { getAdminLandingPages } from "@/actions/admin-landing-pages"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LandingPagesTable } from "./landing-pages-table"
import { Plus } from "lucide-react"

export default async function AdminLandingPagesPage() {
  const { landingPages } = await getAdminLandingPages()

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Landing Pages</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage product landing pages
          </p>
        </div>
        <Link href="/admin/landing-pages/new">
          <Button size="sm" className="md:hidden">
            <Plus className="h-4 w-4" />
          </Button>
          <Button className="hidden md:flex">Create Landing Page</Button>
        </Link>
      </div>

      <LandingPagesTable landingPages={landingPages} />
    </div>
  )
}
