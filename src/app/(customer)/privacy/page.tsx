import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPolicyPage() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8 md:mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">Privacy Policy</h1>
                    <p className="text-muted-foreground">
                        Last updated: December 31, 2025
                    </p>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Introduction</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground">
                            <p>
                                Welcome to our e-commerce platform. We respect your privacy and are committed to protecting your personal data.
                                This privacy policy will inform you about how we look after your personal data when you visit our website
                                and tell you about your privacy rights and how the law protects you.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Information We Collect</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Personal Information</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                    <li>Name and contact details (email, phone number, address)</li>
                                    <li>Account credentials (username, password)</li>
                                    <li>Payment information (securely processed through third-party payment processors)</li>
                                    <li>Order history and preferences</li>
                                    <li>Communication preferences</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Automatically Collected Information</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                    <li>IP address and browser type</li>
                                    <li>Device information and operating system</li>
                                    <li>Pages visited and time spent on our site</li>
                                    <li>Referring website addresses</li>
                                    <li>Cookies and similar tracking technologies</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>How We Use Your Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                <li>To process and fulfill your orders</li>
                                <li>To communicate with you about your orders and account</li>
                                <li>To provide customer support and respond to your inquiries</li>
                                <li>To send you marketing communications (with your consent)</li>
                                <li>To improve our website, products, and services</li>
                                <li>To detect and prevent fraud and security issues</li>
                                <li>To comply with legal obligations</li>
                                <li>To analyze user behavior and preferences</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Data Sharing and Disclosure</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground text-sm">
                            <p>We may share your personal information with:</p>
                            <ul className="space-y-2 list-disc list-inside">
                                <li><strong>Service Providers:</strong> Payment processors, shipping companies, email service providers</li>
                                <li><strong>Business Partners:</strong> Only when necessary to provide our services</li>
                                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
                                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                            </ul>
                            <p className="mt-4">
                                We do not sell your personal information to third parties for their marketing purposes.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Data Security</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground text-sm">
                            <p>
                                We implement appropriate technical and organizational measures to protect your personal data against
                                unauthorized or unlawful processing, accidental loss, destruction, or damage. These measures include:
                            </p>
                            <ul className="space-y-2 list-disc list-inside">
                                <li>SSL/TLS encryption for data transmission</li>
                                <li>Secure password hashing</li>
                                <li>Regular security audits and updates</li>
                                <li>Access controls and authentication measures</li>
                                <li>Employee training on data protection</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Your Rights</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground text-sm">
                            <p>You have the following rights regarding your personal data:</p>
                            <ul className="space-y-2 list-disc list-inside">
                                <li><strong>Access:</strong> Request copies of your personal data</li>
                                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                                <li><strong>Restriction:</strong> Request restriction of processing your data</li>
                                <li><strong>Portability:</strong> Request transfer of your data to another organization</li>
                                <li><strong>Objection:</strong> Object to processing of your data</li>
                                <li><strong>Withdraw Consent:</strong> Withdraw consent for marketing communications</li>
                            </ul>
                            <p className="mt-4">
                                To exercise any of these rights, please contact us using the information provided at the end of this policy.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cookies and Tracking</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground text-sm">
                            <p>
                                We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic,
                                and understand user preferences. You can control cookie settings through your browser preferences.
                            </p>
                            <div>
                                <h4 className="font-semibold mb-2 text-foreground">Types of cookies we use:</h4>
                                <ul className="space-y-2 list-disc list-inside">
                                    <li><strong>Essential Cookies:</strong> Required for website functionality</li>
                                    <li><strong>Performance Cookies:</strong> Help us understand how visitors use our site</li>
                                    <li><strong>Functional Cookies:</strong> Remember your preferences</li>
                                    <li><strong>Marketing Cookies:</strong> Track your browsing habits for targeted advertising</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Data Retention</CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-sm">
                            <p>
                                We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy,
                                unless a longer retention period is required by law. Account information is retained while your account is active
                                and for a reasonable period thereafter. Order history is retained for tax and legal compliance purposes.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Children&apos;s Privacy</CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-sm">
                            <p>
                                Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information
                                from children. If you are a parent or guardian and believe your child has provided us with personal information,
                                please contact us, and we will delete such information.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Changes to This Policy</CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-sm">
                            <p>
                                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy
                                on this page and updating the &quot;Last updated&quot; date. We encourage you to review this policy periodically for any changes.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
                        <CardHeader>
                            <CardTitle>Contact Us</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                            <p className="mb-4">
                                If you have any questions about this Privacy Policy or our data practices, please contact us:
                            </p>
                            <ul className="space-y-2">
                                <li><strong>Email:</strong> privacy@example.com</li>
                                <li><strong>Phone:</strong> +880 1234-567890</li>
                                <li><strong>Address:</strong> 123 Main Street, Dhaka 1000, Bangladesh</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
