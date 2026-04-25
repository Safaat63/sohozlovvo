import { TrackingClient } from "./client"

export default async function TrackingPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
    const params = await searchParams
    const initialOrderNumber = params?.order ?? ""

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 py-10">
                <div className="space-y-2 mb-6">
                    <h1 className="text-3xl font-bold">Public Order Tracking</h1>
                    <p className="text-muted-foreground text-sm">
                        Enter your order number to see payment and shipping status plus product details.
                    </p>
                </div>
                <TrackingClient initialOrderNumber={initialOrderNumber} />
            </div>
        </div>
    )
}
