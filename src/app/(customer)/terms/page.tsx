import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsOfServicePage() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8 md:mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">Terms of Service</h1>
                    <p className="text-muted-foreground">
                        Last updated: December 31, 2025
                    </p>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Agreement to Terms</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground text-sm">
                            <p>
                                By accessing and using this e-commerce platform, you accept and agree to be bound by the terms and provisions
                                of this agreement. If you do not agree to these Terms of Service, please do not use our website or services.
                            </p>
                            <p>
                                We reserve the right to update, change, or replace any part of these Terms of Service by posting updates
                                and/or changes to our website. It is your responsibility to check this page periodically for changes.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Use of Our Services</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Eligibility</h4>
                                <p className="text-sm text-muted-foreground">
                                    You must be at least 18 years old to use our services. By using our platform, you represent and warrant
                                    that you meet this requirement.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Account Registration</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                    <li>You must provide accurate and complete information during registration</li>
                                    <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                                    <li>You agree to notify us immediately of any unauthorized use of your account</li>
                                    <li>You are responsible for all activities that occur under your account</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Prohibited Activities</h4>
                                <p className="text-sm text-muted-foreground mb-2">You agree not to:</p>
                                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                    <li>Use our services for any unlawful purpose</li>
                                    <li>Attempt to gain unauthorized access to our systems</li>
                                    <li>Interfere with or disrupt our services</li>
                                    <li>Use automated systems to access our platform without permission</li>
                                    <li>Impersonate another person or entity</li>
                                    <li>Transmit viruses, malware, or other harmful code</li>
                                    <li>Collect or harvest information about other users</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Products and Pricing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground text-sm">
                            <ul className="space-y-2 list-disc list-inside">
                                <li>We reserve the right to modify prices at any time without prior notice</li>
                                <li>All prices are in Bangladeshi Taka (BDT) unless otherwise stated</li>
                                <li>We strive to display accurate product information, but cannot guarantee 100% accuracy</li>
                                <li>Product availability is subject to change without notice</li>
                                <li>We reserve the right to limit quantities purchased per person or order</li>
                                <li>In case of pricing errors, we reserve the right to cancel or refuse orders</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Orders and Payment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Order Acceptance</h4>
                                <p className="text-sm text-muted-foreground">
                                    All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order
                                    for any reason, including but not limited to product availability, errors in pricing or product information,
                                    or suspected fraudulent transactions.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Payment Terms</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                    <li>Payment must be received before order processing</li>
                                    <li>We accept various payment methods as displayed during checkout</li>
                                    <li>All transactions are processed securely through encrypted connections</li>
                                    <li>You authorize us to charge your selected payment method for the total order amount</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping and Delivery</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground text-sm">
                            <ul className="space-y-2 list-disc list-inside">
                                <li>Delivery times are estimates and not guaranteed</li>
                                <li>We are not responsible for delays caused by shipping carriers or circumstances beyond our control</li>
                                <li>Risk of loss and title for products pass to you upon delivery to the shipping carrier</li>
                                <li>You must provide accurate shipping information; we are not responsible for failed deliveries due to incorrect addresses</li>
                                <li>Shipping costs are non-refundable unless the return is due to our error</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Returns and Refunds</CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-sm">
                            <p>
                                Our return and refund policy is outlined in detail on our Returns page. By making a purchase, you agree to our
                                return policy terms. Please review the Returns page before making a purchase.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Intellectual Property</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground text-sm">
                            <p>
                                All content on this website, including but not limited to text, graphics, logos, images, videos, and software,
                                is the property of our company or our content suppliers and is protected by international copyright laws.
                            </p>
                            <ul className="space-y-2 list-disc list-inside">
                                <li>You may not reproduce, distribute, or create derivative works without our written permission</li>
                                <li>Trademarks and logos displayed are the property of their respective owners</li>
                                <li>Any unauthorized use may violate copyright, trademark, and other laws</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Limitation of Liability</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground text-sm">
                            <p>
                                To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special,
                                consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly,
                                or any loss of data, use, goodwill, or other intangible losses resulting from:
                            </p>
                            <ul className="space-y-2 list-disc list-inside">
                                <li>Your use or inability to use our services</li>
                                <li>Unauthorized access to or alteration of your data</li>
                                <li>Statements or conduct of any third party on our services</li>
                                <li>Any other matter relating to our services</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Disclaimer of Warranties</CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-sm">
                            <p>
                                Our services are provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied.
                                We do not warrant that our services will be uninterrupted, secure, or error-free. We make no warranties about
                                the accuracy, reliability, or completeness of any content on our platform.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Indemnification</CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-sm">
                            <p>
                                You agree to indemnify and hold harmless our company, its officers, directors, employees, and agents from any
                                claims, damages, losses, liabilities, and expenses (including legal fees) arising out of your use of our services,
                                violation of these Terms of Service, or violation of any rights of another party.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Governing Law</CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-sm">
                            <p>
                                These Terms of Service shall be governed by and construed in accordance with the laws of Bangladesh.
                                Any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction
                                of the courts of Bangladesh.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Severability</CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-sm">
                            <p>
                                If any provision of these Terms of Service is found to be unenforceable or invalid, that provision shall be
                                limited or eliminated to the minimum extent necessary so that the Terms of Service shall otherwise remain in
                                full force and effect.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Termination</CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-sm">
                            <p>
                                We may terminate or suspend your account and access to our services immediately, without prior notice or liability,
                                for any reason, including if you breach these Terms of Service. Upon termination, your right to use our services
                                will immediately cease.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                            <p className="mb-4">
                                If you have any questions about these Terms of Service, please contact us:
                            </p>
                            <ul className="space-y-2">
                                <li><strong>Email:</strong> legal@example.com</li>
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
