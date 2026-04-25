"use client"

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"

interface ViewsChartProps {
    data: Array<{
        date: string
        pageViews: number
        productViews: number
        totalViews: number
    }>
}

export function ViewsChart({ data }: ViewsChartProps) {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                    dataKey="date"
                    className="text-xs"
                    tickFormatter={(value) => {
                        const date = new Date(value)
                        return `${date.getMonth() + 1}/${date.getDate()}`
                    }}
                />
                <YAxis className="text-xs" />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="pageViews"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Page Views"
                />
                <Line
                    type="monotone"
                    dataKey="productViews"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    name="Product Views"
                />
                <Line
                    type="monotone"
                    dataKey="totalViews"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    name="Total Views"
                    strokeDasharray="5 5"
                />
            </LineChart>
        </ResponsiveContainer>
    )
}
