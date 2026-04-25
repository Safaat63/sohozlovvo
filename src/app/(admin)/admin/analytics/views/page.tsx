import { getViewAnalyticsDashboard } from "@/actions/admin-analytics"
import { TopPagesViews } from "@/components/admin/top-pages-views"
import { TopProductsViews } from "@/components/admin/top-products-views"
import { ViewsChart } from "@/components/admin/views-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, TrendingUp } from "lucide-react"

export default async function ViewAnalyticsPage() {
    const data = await getViewAnalyticsDashboard(30)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Visitor Analytics</h1>
                <p className="text-muted-foreground">
                    Track page views and product visits for the last 30 days
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Page Views
                        </CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data.totalPageViews.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Last 30 days
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Product Views
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data.totalProductViews.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Last 30 days
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Views
                        </CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(data.totalPageViews + data.totalProductViews).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Combined page + product
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Daily Views Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Daily Visitor Trends</CardTitle>
                </CardHeader>
                <CardContent>
                    <ViewsChart data={data.dailyViews} />
                </CardContent>
            </Card>

            {/* Top Products and Pages */}
            <div className="grid gap-4 md:grid-cols-2">
                <TopProductsViews products={data.topProducts} />
                <TopPagesViews pages={data.topPages} />
            </div>
        </div>
    )
}
