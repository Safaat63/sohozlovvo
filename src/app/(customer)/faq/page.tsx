import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function FAQPage() {
    const faqs = [
        {
            category: "Orders & Shipping",
            questions: [
                {
                    q: "How long does shipping take?",
                    a: "Standard shipping typically takes 3-5 business days within Bangladesh. Express shipping is available for 1-2 business day delivery."
                },
                {
                    q: "Do you offer Free Shipping?",
                    a: "Yes! We offer Free Shipping on all orders over ৳10000. For orders under ৳10000, a flat shipping fee applies."
                },
                {
                    q: "Can I track my order?",
                    a: "Absolutely! Once your order ships, you'll receive a tracking number via email. You can also track your order from your account dashboard."
                },
                {
                    q: "Can I change my shipping address after ordering?",
                    a: "You can change your shipping address within 1 hour of placing your order. Please contact us immediately if you need to make changes."
                }
            ]
        },
        {
            category: "Payment",
            questions: [
                {
                    q: "What payment methods do you accept?",
                    a: "We accept bKash, Nagad, Rocket, credit/debit cards, and Cash on Delivery (COD)."
                },
                {
                    q: "Is it safe to use my card on your website?",
                    a: "Yes, all transactions are secured with SSL encryption. We never store your full card details on our servers."
                },
                {
                    q: "Do you charge extra for Cash on Delivery?",
                    a: "No additional charges are applied for COD orders."
                }
            ]
        },
        {
            category: "Returns & Refunds",
            questions: [
                {
                    q: "What is your return policy?",
                    a: "We offer a 7-day return policy for most items. Products must be unused and in original packaging. See our Returns page for full details."
                },
                {
                    q: "How do I initiate a return?",
                    a: "Go to your order history, select the order, and click 'Request Return'. You can also contact our customer support for assistance."
                },
                {
                    q: "When will I receive my refund?",
                    a: "Refunds are processed within 5-7 business days after we receive and inspect the returned item. The refund will be issued to your original payment method."
                },
                {
                    q: "Are there items that cannot be returned?",
                    a: "Yes, certain items like personal care products, perishables, and intimate items cannot be returned due to hygiene reasons."
                }
            ]
        },
        {
            category: "Account & Privacy",
            questions: [
                {
                    q: "Do I need an account to make a purchase?",
                    a: "No, you can checkout as a guest. However, creating an account allows you to track orders, save addresses, and earn loyalty points."
                },
                {
                    q: "How is my personal information protected?",
                    a: "We take privacy seriously. Your data is encrypted and we never share your information with third parties without consent. See our Privacy Policy for details."
                },
                {
                    q: "Can I delete my account?",
                    a: "Yes, you can request account deletion by contacting our support team. Please note this action is irreversible."
                }
            ]
        },
        {
            category: "Products",
            questions: [
                {
                    q: "Are all products authentic?",
                    a: "Yes, we guarantee 100% authentic products. All items are sourced directly from authorized distributors and manufacturers."
                },
                {
                    q: "How do I know if an item is in stock?",
                    a: "Product pages show real-time stock availability. If an item is out of stock, you can sign up for restock notifications."
                },
                {
                    q: "Do you offer product warranties?",
                    a: "Yes, most products come with manufacturer warranties. Warranty details are listed on individual product pages."
                }
            ]
        }
    ]

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8 md:mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">Frequently Asked Questions</h1>
                    <p className="text-muted-foreground text-lg">
                        Find answers to common questions about our services
                    </p>
                </div>

                <div className="space-y-8">
                    {faqs.map((category, idx) => (
                        <Card key={idx}>
                            <CardHeader>
                                <CardTitle>{category.category}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    {category.questions.map((faq, qIdx) => (
                                        <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                                            <AccordionTrigger className="text-left">
                                                {faq.q}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-muted-foreground">
                                                {faq.a}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="mt-8">
                    <CardContent className="p-6 text-center">
                        <h3 className="font-semibold text-lg mb-2">Still have questions?</h3>
                        <p className="text-muted-foreground mb-4">
                            Can&apos;t find the answer you&apos;re looking for? Our customer support team is here to help.
                        </p>
                        <a href="/contact" className="text-primary hover:underline font-medium">
                            Contact Support →
                        </a>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
