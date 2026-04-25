import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

interface TopPagesViewsProps {
    pages: Array<{
        path: string
        views: number
    }>
}

export function TopPagesViews({ pages }: TopPagesViewsProps) {
    const maxViews = Math.max(...pages.map((p) => p.views), 1)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Top Visited Pages
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {pages.map((page, index) => (
                        <div key={page.path} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                        {index + 1}
                                    </span>
                                    <span className="truncate font-medium">
                                        {page.path === "/" ? "Homepage" : page.path}
                                    </span>
                                </div>
                                <span className="text-muted-foreground">
                                    {page.views.toLocaleString()}
                                </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full bg-primary transition-all"
                                    style={{
                                        width: `${(page.views / maxViews) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                    {pages.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground">
                            No page views yet
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
