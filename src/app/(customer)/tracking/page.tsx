import { TrackingClient } from "./client"

export default async function TrackingPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
    const params = await searchParams
    const initialOrderNumber = params?.order ?? ""

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
            <TrackingClient initialOrderNumber={initialOrderNumber} />
        </div>
    )
}