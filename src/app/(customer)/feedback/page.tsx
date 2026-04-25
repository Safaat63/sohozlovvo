import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { MessageSquare, Send } from "lucide-react"
import { submitFeedback } from "@/actions/feedback"

export default function FeedbackPage() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8 md:mb-12">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-full bg-primary/10">
                            <MessageSquare className="h-10 w-10 md:h-12 md:w-12 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 dark:text-white">
                        Complaints & Suggestions
                    </h1>
                    <p className="text-muted-foreground dark:text-gray-400 text-lg max-w-2xl mx-auto">
                        Your feedback helps us improve. Share your complaints, suggestions, or general feedback with us.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Send Us Your Feedback</CardTitle>
                        <CardDescription>
                            All fields are optional. You can submit feedback anonymously if you prefer.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={submitFeedback} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name" className="text-sm font-medium">
                                        Your Name <span className="text-muted-foreground font-normal">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Enter your name"
                                        className="mt-1.5"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Leave blank to submit anonymously
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="email" className="text-sm font-medium">
                                        Email Address <span className="text-muted-foreground font-normal">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="your.email@example.com"
                                        className="mt-1.5"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Provide your email if you want us to respond
                                    </p>
                                </div>
                                
                                <div>
                                    <Label htmlFor="phone" className="text-sm font-medium">
                                        Phone Number <span className="text-muted-foreground font-normal">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="text"
                                        placeholder="+8801xxxxxxxxx"
                                        className="mt-1.5"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Provide your phone if you want us to respond over phone
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="subject" className="text-sm font-medium">
                                        Subject <span className="text-muted-foreground font-normal">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="subject"
                                        name="subject"
                                        placeholder="Brief description of your feedback"
                                        className="mt-1.5"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="message" className="text-sm font-medium">
                                        Message <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        required
                                        placeholder="Tell us what's on your mind..."
                                        className="mt-1.5 min-h-40 resize-none"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        This is the only required field
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="type" className="text-sm font-medium">
                                        Feedback Type
                                    </Label>
                                    <select
                                        id="type"
                                        name="type"
                                        className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        defaultValue={'general'}
                                    >
                                        <option value="general">General Feedback</option>
                                        <option value="complaint">Complaint</option>
                                        <option value="suggestion">Suggestion</option>
                                        <option value="appreciation">Appreciation</option>
                                        <option value="bug">Report a Bug</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <p className="text-sm text-blue-900 dark:text-blue-100">
                                    <strong>Privacy Note:</strong> Your feedback is confidential and will only be used to improve our services.
                                    If you provide contact information, we may reach out to address your concerns.
                                </p>
                            </div>

                            <Button type="submit" className="w-full md:w-auto" size="lg">
                                <Send className="h-4 w-4 mr-2" />
                                Submit Feedback
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="text-center p-4">
                        <div className="text-2xl font-bold text-primary mb-1">24/7</div>
                        <div className="text-sm text-muted-foreground">We read all feedback</div>
                    </Card>
                    <Card className="text-center p-4">
                        <div className="text-2xl font-bold text-primary mb-1">48hrs</div>
                        <div className="text-sm text-muted-foreground">Average response time</div>
                    </Card>
                    <Card className="text-center p-4">
                        <div className="text-2xl font-bold text-primary mb-1">100%</div>
                        <div className="text-sm text-muted-foreground">Confidential</div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
