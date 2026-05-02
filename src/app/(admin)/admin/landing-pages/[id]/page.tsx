import { notFound } from "next/navigation"
import { getAdminLandingPage } from "@/actions/admin-landing-pages"
import { LandingPageForm } from "../landing-page-form"

interface EditLandingPageProps {
  params: Promise<{ id: string }>
}

export default async function EditLandingPage({ params }: EditLandingPageProps) {
  const { id } = await params
  const landingPage = await getAdminLandingPage(id)

  if (!landingPage) {
    notFound()
  }

  const serializedLandingPage = {
    ...landingPage,
    products: landingPage.products.map((p) => ({
      ...p,
      product: {
        ...p.product,
        price: Number(p.product.price),
      },
    })),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Edit Landing Page</h1>
        <p className="text-sm text-muted-foreground">
          Update landing page details
        </p>
      </div>
      <LandingPageForm landingPage={serializedLandingPage} />
    </div>
  )
}
