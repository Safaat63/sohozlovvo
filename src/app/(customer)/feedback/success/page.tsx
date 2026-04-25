import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Home, MessageSquare } from "lucide-react"

export default function FeedbackSuccessPage() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-2xl mx-auto">
                <Card className="text-center p-8 md:p-12">
                    <CardContent className="space-y-6">
                        <div className="flex justify-center">
                            <div className="p-4 rounded-full bg-green-100 dark:bg-green-900">
                                <CheckCircle2 className="h-16 w-16 md:h-20 md:w-20 text-green-600 dark:text-green-400" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl md:text-3xl font-bold dark:text-white">
                                Thank You for Your Feedback!
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Your feedback has been successfully submitted.
                            </p>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                We appreciate you taking the time to share your thoughts with us.
                                {" "}If you provided your email, we&apos;ll get back to you within 48 hours.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                            <Button asChild size="lg">
                                <Link href="/">
                                    <Home className="h-4 w-4 mr-2" />
                                    Back to Home
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link href="/feedback">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Submit Another
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
