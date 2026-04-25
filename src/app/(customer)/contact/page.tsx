import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import Form from 'next/form'
import { submitFeedback } from "@/actions/feedback"
export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8 md:mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 dark:text-white">Contact Us</h1>
                    <p className="text-muted-foreground dark:text-gray-400 text-lg">
                        We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Contact Information */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Get in Touch</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="font-medium">Email</p>
                                        <p className="text-sm text-muted-foreground">support@example.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="font-medium">Phone</p>
                                        <p className="text-sm text-muted-foreground">+880 1234-567890</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="font-medium">Address</p>
                                        <p className="text-sm text-muted-foreground">
                                            123 Main Street<br />
                                            Dhaka 1000, Bangladesh
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="font-medium">Business Hours</p>
                                        <p className="text-sm text-muted-foreground">
                                            Mon - Fri: 9:00 AM - 6:00 PM<br />
                                            Sat: 10:00 AM - 4:00 PM
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Send us a Message</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Form action={submitFeedback} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name *</Label>
                                            <Input id="name" name="name" placeholder="Your name" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email *</Label>
                                            <Input name="email" id="email" type="email" placeholder="yourmail@gmail.com" required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input name="phone" id="phone" type="tel" placeholder="+880 1234-567890" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject *</Label>
                                        <Input id="subject" name='subject' placeholder="What is this regarding?" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message *</Label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows={6}
                                            className="w-full rounded-md border px-3 py-2 text-sm"
                                            placeholder="Your message..."
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <input
                                            id="type"
                                            name="type"
                                            className="w-full rounded-md border px-3 py-2 text-sm"
                                            placeholder="Your message..."
                                            hidden
                                            defaultValue={'contact-form'}
                                        />
                                    </div>
                                    <Button type="submit" size="lg" className="w-full md:w-auto">
                                        Send Message
                                    </Button>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
