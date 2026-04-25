'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, XCircle, Clock, Send } from 'lucide-react';

interface Notification {
    id: string;
    title: string;
    body: string;
    url: string | null;
    sentCount: number;
    failCount: number;
    status: string;
    createdAt: Date;
    sentAt: Date | null;
}

interface NotificationHistoryProps {
    notifications: Notification[];
}

export function NotificationHistory({ notifications }: NotificationHistoryProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'sent':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'sending':
                return <Send className="h-4 w-4 text-blue-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'sent':
                return <Badge variant="default" className="bg-green-500">Sent</Badge>;
            case 'failed':
                return <Badge variant="destructive">Failed</Badge>;
            case 'sending':
                return <Badge variant="secondary">Sending</Badge>;
            default:
                return <Badge variant="outline">Pending</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notification History</CardTitle>
            </CardHeader>
            <CardContent>
                {notifications.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        No notifications sent yet
                    </p>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="mt-1">{getStatusIcon(notification.status)}</div>

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h4 className="font-semibold">{notification.title}</h4>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {notification.body}
                                            </p>
                                            {notification.url && (
                                                <p className="text-xs text-blue-500 mt-1">
                                                    URL: {notification.url}
                                                </p>
                                            )}
                                        </div>
                                        {getStatusBadge(notification.status)}
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                        <span>
                                            Sent: {notification.sentCount} | Failed: {notification.failCount}
                                        </span>
                                        <span>•</span>
                                        <span>
                                            {notification.sentAt
                                                ? formatDistanceToNow(new Date(notification.sentAt), {
                                                    addSuffix: true,
                                                })
                                                : formatDistanceToNow(new Date(notification.createdAt), {
                                                    addSuffix: true,
                                                })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
