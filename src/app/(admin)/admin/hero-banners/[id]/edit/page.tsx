import { getHeroBanner } from "@/actions/admin-hero-banners"
import { notFound } from "next/navigation"
import { HeroBannerForm } from "../../hero-banner-form"

export default async function EditHeroBannerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const banner = await getHeroBanner(id)

    if (!banner) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Edit Hero Banner</h1>
                <p className="text-sm text-muted-foreground">
                    Update hero banner details
                </p>
            </div>

            <HeroBannerForm banner={banner} />
        </div>
    )
}
