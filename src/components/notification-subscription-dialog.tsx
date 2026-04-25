'use client';

import { useState } from 'react';
import { PushNotificationManager } from './push-notification-manager';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

type NotificationSubscriptionDialogProps = {
    userId?: string;
};

export function NotificationSubscriptionDialog({ userId }: NotificationSubscriptionDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Push Notifications</DialogTitle>
                    <DialogDescription>
                        Stay updated with the latest products, offers, and order updates.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <h4 className="font-medium">Benefits of enabling notifications:</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            <li>Get notified about flash sales and special offers</li>
                            <li>Receive updates on your order status</li>
                            <li>Be the first to know about new product launches</li>
                            <li>Never miss exclusive discounts</li>
                        </ul>
                    </div>
                    <PushNotificationManager userId={userId} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
