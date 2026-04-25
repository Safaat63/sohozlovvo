import { HeroBannerForm } from "../hero-banner-form";

export default function NewHeroBannerPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Add Hero Banner</h1>
                <p className="text-sm text-muted-foreground">
                    Create a new hero banner for your homepage
                </p>
            </div>

            <HeroBannerForm />
        </div>
    )
}
