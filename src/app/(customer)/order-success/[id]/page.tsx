import Link from "next/link"
import { getOrder } from "@/actions/orders"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Home, Package, Truck, Phone, MapPin, Receipt, ShoppingBag } from "lucide-react"
import { notFound } from "next/navigation"
import { Currency } from "@/components/providers/currency-provider"

interface OrderSuccessPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50/50 dark:bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30 animate-in zoom-in duration-500">
              <CheckCircle2 className="h-16 w-16 md:h-20 md:w-20 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Order Confirmed!
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              Thank you, <span className="font-semibold text-gray-900 dark:text-white">{order.customerName}</span>! Your order is being processed.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-2 rounded-full font-bold text-lg border border-primary/20">
            <Receipt className="h-5 w-5" />
            Order #{order.orderNumber}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <Card className="border-none shadow-md bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Shipping Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">{order.customerName}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {order.shippingAddress}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
                <p className="text-sm font-medium">{order.customerPhone}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-4 text-sm">
                    <div className="flex gap-3">
                      {item.image && (
                        <div className="w-10 h-10 rounded border overflow-hidden shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <Currency value={Number(item.price) * item.quantity} className="font-bold whitespace-nowrap" />
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <Currency value={Number(order.subtotal)} className="font-medium" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <Currency value={Number(order.shippingCost)} className="font-medium" />
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Discount</span>
                    <span>-<Currency value={Number(order.discount)} /></span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xl border-t border-gray-100 dark:border-gray-800 pt-3 mt-2">
                  <span>Total Amount</span>
                  <Currency value={Number(order.total)} className="text-primary" />
                </div>
              </div>
              <div className="pt-3 text-[10px] uppercase tracking-wider text-muted-foreground text-center bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg font-bold">
                Payment: <span className="text-gray-900 dark:text-white">{order.paymentMethod}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <Button asChild size="lg" className="h-14 px-10 rounded-full text-lg shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            <Link href="/">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Continue Shopping
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-full text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Link href="/orders">
              <Package className="h-5 w-5 mr-2" />
              My Orders
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
