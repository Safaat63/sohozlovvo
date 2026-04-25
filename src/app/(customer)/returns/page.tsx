import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"

export default function ReturnsPage() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8 md:mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">Return & Refund Policy</h1>
                    <p className="text-muted-foreground text-lg">
                        Your satisfaction is our priority. Review our return policy below.
                    </p>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Return Window</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                You have <strong className="text-foreground">7 days</strong> from the date of delivery to return most items.
                                Items must be unused, in original condition, and in original packaging with all tags attached.
                            </p>
                            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <div className="flex gap-2">
                                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                    <p className="text-sm text-blue-900 dark:text-blue-100">
                                        The 7-day return period begins from the date you receive your order, not from the date of purchase.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Eligible Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Electronics & Appliances</p>
                                        <p className="text-sm text-muted-foreground">Must be in original packaging with all accessories and manuals</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Clothing & Accessories</p>
                                        <p className="text-sm text-muted-foreground">Unworn, unwashed, with original tags attached</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Home & Kitchen Items</p>
                                        <p className="text-sm text-muted-foreground">Unused and in original packaging</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Books & Media</p>
                                        <p className="text-sm text-muted-foreground">Unopened or in original shrink wrap</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Non-Returnable Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Personal Care & Beauty Products</p>
                                        <p className="text-sm text-muted-foreground">Due to hygiene reasons</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Intimate Apparel & Swimwear</p>
                                        <p className="text-sm text-muted-foreground">Unless unopened in original packaging</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Perishable Goods</p>
                                        <p className="text-sm text-muted-foreground">Food items, flowers, etc.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Digital Products</p>
                                        <p className="text-sm text-muted-foreground">Software, gift cards, downloaded content</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Custom or Personalized Items</p>
                                        <p className="text-sm text-muted-foreground">Items made to order or with custom engraving</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>How to Return an Item</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ol className="space-y-4">
                                <li className="flex gap-3">
                                    <Badge className="h-6 w-6 rounded-full shrink-0 flex items-center justify-center">1</Badge>
                                    <div>
                                        <p className="font-medium mb-1">Initiate Return Request</p>
                                        <p className="text-sm text-muted-foreground">
                                            Log in to your account, go to Order History, select the order, and click &ldquo;Request Return&quot;
                                        </p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <Badge className="h-6 w-6 rounded-full shrink-0 flex items-center justify-center">2</Badge>
                                    <div>
                                        <p className="font-medium mb-1">Pack the Item</p>
                                        <p className="text-sm text-muted-foreground">
                                            Securely pack the item in its original packaging with all accessories, tags, and documentation
                                        </p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <Badge className="h-6 w-6 rounded-full shrink-0 flex items-center justify-center">3</Badge>
                                    <div>
                                        <p className="font-medium mb-1">Ship or Schedule Pickup</p>
                                        <p className="text-sm text-muted-foreground">
                                            Either drop off the package at our designated location or schedule a free pickup from your address
                                        </p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <Badge className="h-6 w-6 rounded-full shrink-0 flex items-center justify-center">4</Badge>
                                    <div>
                                        <p className="font-medium mb-1">Inspection & Refund</p>
                                        <p className="text-sm text-muted-foreground">
                                            Once we receive and inspect your return, we&apos;ll process your refund within 5-7 business days
                                        </p>
                                    </div>
                                </li>
                            </ol>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Refund Processing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Refunds will be issued to your original payment method:
                            </p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex gap-2">
                                    <span className="text-muted-foreground">•</span>
                                    <span><strong>bKash/Nagad/Rocket:</strong> 3-5 business days</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-muted-foreground">•</span>
                                    <span><strong>Credit/Debit Card:</strong> 7-10 business days</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-muted-foreground">•</span>
                                    <span><strong>Cash on Delivery:</strong> Bank transfer within 5-7 business days</span>
                                </li>
                            </ul>
                            <p className="text-sm text-muted-foreground">
                                Shipping costs are non-refundable unless the return is due to our error (wrong item, defective product, etc.)
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Exchanges</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                We currently don&apos;t offer direct exchanges. If you need a different size, color, or variant:
                            </p>
                            <ol className="space-y-2 text-sm list-decimal list-inside text-muted-foreground">
                                <li>Return the original item following our return process</li>
                                <li>Place a new order for the desired item</li>
                                <li>Your refund will be processed once we receive the return</li>
                            </ol>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
                        <CardContent className="p-6">
                            <h3 className="font-semibold mb-2">Need Help?</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                If you have questions about returns or need assistance with a return request, our customer support team is ready to help.
                            </p>
                            <a href="/contact" className="text-primary hover:underline font-medium text-sm">
                                Contact Customer Support →
                            </a>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
