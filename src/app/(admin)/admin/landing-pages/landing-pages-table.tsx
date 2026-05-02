"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { deleteLandingPage } from "@/actions/admin-landing-pages"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, Eye, ExternalLink } from "lucide-react"

interface LandingPage {
  id: string
  title: string
  slug: string
  description: string | null
  heroImage: string | null
  isActive: boolean
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
  products: {
    product: {
      id: string
      name: string
      slug: string
      images: string[]
    }
  }[]
  _count: {
    orders: number
  }
}

export function LandingPagesTable({ landingPages }: { landingPages: LandingPage[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = () => {
    if (!deleteId) return
    startTransition(async () => {
      await deleteLandingPage(deleteId)
      setDeleteId(null)
      router.refresh()
    })
  }

  if (landingPages.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No landing pages created yet.</p>
        <Link href="/admin/landing-pages/new">
          <Button className="mt-4">Create Your First Landing Page</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {landingPages.map((lp) => (
              <TableRow key={lp.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {lp.heroImage ? (
                      <div className="w-10 h-10 rounded overflow-hidden shrink-0">
                        <Image
                          src={lp.heroImage}
                          alt={lp.title}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-100 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium truncate">{lp.title}</p>
                      <p className="text-xs text-muted-foreground">/lp/{lp.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{lp.products.length} product(s)</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        lp.isPublished
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {lp.isPublished ? "Published" : "Draft"}
                    </span>
                    {!lp.isActive && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Inactive
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{lp._count.orders} order(s)</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {new Date(lp.createdAt).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/lp/${lp.slug}`} target="_blank">
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/landing-pages/${lp.id}`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(lp.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Landing Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this landing page? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
