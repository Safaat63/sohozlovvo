"use client"

import {
    ResponsiveContainer,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Bar,
    ComposedChart,
} from "recharts"

interface SalesPoint {
    date: string
    total: number
    orders: number
}

interface SalesChartProps {
    data: SalesPoint[]
}

export function SalesChart({ data }: SalesChartProps) {
    if (!data || data.length === 0) {
        return <p className="text-sm text-muted-foreground">No paid orders in the selected range.</p>
    }

    // Format date labels as short month/day
    const formatted = data.map((d) => ({
        ...d,
        label: new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    }))

    return (
        <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={formatted} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 12 }} width={55} />
                    <Tooltip formatter={(value: number, name) => (name === "Revenue" ? `৳${value.toFixed(0)}` : value)} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="orders" name="Orders" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={14} />
                    <Line type="monotone" dataKey="total" name="Revenue" stroke="#2563eb" strokeWidth={2} dot={false} />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )
}
