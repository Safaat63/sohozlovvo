import { Suspense } from 'react';
import { checkAdminAccess } from '@/actions/admin';
import { getSubscriptionStats, getPushNotificationHistory } from '@/actions/push-notifications';
import { SendNotificationForm } from './send-notification-form';
import { NotificationHistory } from './notification-history';
import { SubscriptionStats } from './subscription-stats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default async function PushNotificationsPage() {
    await checkAdminAccess();

    const [statsResult, historyResult] = await Promise.all([
        getSubscriptionStats(),
        getPushNotificationHistory(20),
    ]);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Push Notifications</h1>
                <p className="text-muted-foreground mt-2">
                    Send push notifications to your customers
                </p>
            </div>

            {/* Statistics */}
            <Suspense fallback={<StatsLoading />}>
                {statsResult.success && <SubscriptionStats stats={statsResult.stats} />}
            </Suspense>

            {/* Send Notification Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Send Notification</CardTitle>
                    <CardDescription>
                        Send a push notification to all subscribed users
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SendNotificationForm />
                </CardContent>
            </Card>

            {/* Notification History */}
            <Suspense fallback={<HistoryLoading />}>
                {historyResult.success && (
                    <NotificationHistory notifications={historyResult.notifications || []} />
                )}
            </Suspense>
        </div>
    );
}

function StatsLoading() {
    return (
        <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i}>
                    <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-20" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-16" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function HistoryLoading() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
