import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { checkAdminAccess, updateFeedbackStatus } from "@/actions/admin"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateTimeDhaka } from "@/lib/utils"
import { ArrowLeft, Mail, User, Calendar, MessageSquare, Tag, Phone } from "lucide-react"
import Link from "next/link"
import { revalidatePath } from "next/cache"

async function updateStatusAction(id: string, formData: FormData) {
    "use server"
    const status = formData.get("status") as string
    await updateFeedbackStatus({ ids: [id], status })
    revalidatePath("/(admin)/admin/feedback/[id]", 'page')
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" {
    switch (status) {
        case "pending":
            return "warning"
        case "reviewed":
            return "default"
        case "resolved":
            return "success"
        case "dismissed":
            return "destructive"
        default:
            return "default"
    }
}

function getTypeVariant(type: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" {
    switch (type) {
        case "general":
            return "default"
        case "complaint":
            return "destructive"
        case "suggestion":
            return "secondary"
        case "appreciation":
            return "success"
        case "bug":
            return "warning"
        default:
            return "default"
    }
}

export default async function FeedbackDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    await checkAdminAccess()

    const feedback = await prisma.feedback.findUnique({
        where: { id },
    })

    if (!feedback) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="sm">
                    <Link href="/admin/feedback">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Feedback
                    </Link>
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold dark:text-white">Feedback Details</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl">
                                        {feedback.subject || "No Subject"}
                                    </CardTitle>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        {formatDateTimeDhaka(feedback.createdAt)}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant={getTypeVariant(feedback.type)} className="capitalize">
                                        <Tag className="mr-1 h-3 w-3" />
                                        {feedback.type}
                                    </Badge>
                                    <Badge variant={getStatusVariant(feedback.status)} className="capitalize">
                                        {feedback.status}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="prose dark:prose-invert max-w-none">
                                <p className="whitespace-pre-wrap">{feedback.message}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <div className="text-sm font-medium">Name</div>
                                <div className="text-sm text-muted-foreground">
                                    {feedback.name || "Anonymous"}
                                </div>
                            </div>
                            {feedback.email && (
                                <div>
                                    <div className="text-sm font-medium flex items-center gap-1">
                                        <Mail className="h-4 w-4" />
                                        Email
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        <Link href={`mailto:${feedback.email}`} className="hover:underline">
                                            {feedback.email}
                                        </Link>
                                    </div>
                                </div>
                            )}
                            {feedback.phone && (
                                <div>
                                    <div className="text-sm font-medium flex items-center gap-1">
                                        <Phone className="h-4 w-4" />
                                        Phone
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        <Link href={`tel:${feedback.phone}`} className="hover:underline">
                                            {feedback.phone}
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Update Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form action={updateStatusAction.bind(null, id)} className="space-y-3">
                                <select
                                    name="status"
                                    defaultValue={feedback.status}
                                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="reviewed">Reviewed</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="dismissed">Dismissed</option>
                                </select>
                                <Button type="submit" className="w-full">
                                    Update Status
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}