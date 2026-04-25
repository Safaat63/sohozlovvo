"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, RefreshCw, FileText, Undo2 } from "lucide-react"
import { getSteadfastBalance, getSteadfastPayments, getReturnRequests, type SteadfastReturnRequest } from "@/actions/admin-steadfast"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

type SteadfastPayment = {
    id: number
    amount: number
    created_at: string
}

export function SteadfastDashboard({ balance }: { balance: number | null }) {
    const [isPending, startTransition] = useTransition()
    const [currentBalance, setCurrentBalance] = useState(balance)
    const [payments, setPayments] = useState<SteadfastPayment[] | null>(null)
    const [returnRequests, setReturnRequests] = useState<SteadfastReturnRequest[] | null>(null)
    const [paymentsOpen, setPaymentsOpen] = useState(false)
    const [returnsOpen, setReturnsOpen] = useState(false)

    const refreshBalance = () => {
        startTransition(async () => {
            const result = await getSteadfastBalance()
            if (result.success) {
                setCurrentBalance(result.balance ?? null)
            }
        })
    }

    const loadPayments = () => {
        startTransition(async () => {
            const result = await getSteadfastPayments()
            if (result.success) {
                setPayments(result.payments)
            }
        })
    }

    const loadReturnRequests = () => {
        startTransition(async () => {
            const result = await getReturnRequests()
            if (result.success) {
                setReturnRequests(result.returnRequests ?? null)
            }
        })
    }

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {/* Balance Card */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium dark:text-white">Current Balance</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {currentBalance !== null ? `৳${currentBalance.toFixed(2)}` : "Unable to fetch"}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 p-0 h-auto text-xs text-muted-foreground hover:text-foreground"
                        onClick={refreshBalance}
                        disabled={isPending}
                    >
                        <RefreshCw className={`h-3 w-3 mr-1 ${isPending ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </CardContent>
            </Card>

            {/* Payments Card */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium dark:text-white">Payments</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Dialog open={paymentsOpen} onOpenChange={setPaymentsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={loadPayments} disabled={isPending}>
                                View Payments
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Steadfast Payments</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4">
                                {isPending ? (
                                    <div className="text-center py-4 text-muted-foreground">Loading...</div>
                                ) : payments && payments.length > 0 ? (
                                    <div className="space-y-3">
                                        {payments.map((payment, index) => (
                                            <div
                                                key={payment.id || index}
                                                className="p-3 border rounded-lg dark:border-gray-700"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium">
                                                        Payment #{payment.id || index + 1}
                                                    </span>
                                                    <span className="text-green-600 font-semibold">
                                                        ৳{payment.amount || "N/A"}
                                                    </span>
                                                </div>
                                                {payment.created_at && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {new Date(payment.created_at).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground">
                                        No payments found
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>

            {/* Return Requests Card */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium dark:text-white">Return Requests</CardTitle>
                    <Undo2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Dialog open={returnsOpen} onOpenChange={setReturnsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={loadReturnRequests} disabled={isPending}>
                                View Returns
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Return Requests</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4">
                                {isPending ? (
                                    <div className="text-center py-4 text-muted-foreground">Loading...</div>
                                ) : returnRequests && returnRequests.length > 0 ? (
                                    <div className="space-y-3">
                                        {returnRequests.map((request) => (
                                            <div
                                                key={request.id}
                                                className="p-3 border rounded-lg dark:border-gray-700"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium">
                                                        Request #{request.id}
                                                    </span>
                                                    <Badge
                                                        variant={
                                                            request.status === "completed"
                                                                ? "success"
                                                                : request.status === "cancelled"
                                                                    ? "destructive"
                                                                    : "default"
                                                        }
                                                    >
                                                        {request.status}
                                                    </Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    Consignment ID: {request.consignment_id}
                                                </div>
                                                {request.reason && (
                                                    <div className="text-sm mt-1">Reason: {request.reason}</div>
                                                )}
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {new Date(request.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground">
                                        No return requests found
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    )
}
