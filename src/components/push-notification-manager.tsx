'use client';

import { useEffect, useState } from 'react';
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from '@/actions/push-notifications';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';

type PushNotificationManagerProps = {
    userId?: string;
};

export function PushNotificationManager({ userId }: PushNotificationManagerProps) {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            checkSubscription();
        } else {
            setIsLoading(false);
        }
    }, []);

    const checkSubscription = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.getSubscription();
            setSubscription(sub);
        } catch (error) {
            console.error('Error checking subscription:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const subscribe = async () => {
        try {
            setIsLoading(true);

            // Request notification permission
            const permission = await Notification.requestPermission();

            if (permission !== 'granted') {
                toast.error('Notification permission denied');
                return;
            }

            // Get service worker registration
            const registration = await navigator.serviceWorker.ready;

            // Subscribe to push notifications
            const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!publicKey) {
                toast.error('VAPID public key not configured');
                return;
            }

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey),
            });

            // Save subscription to server with serializable payload
            const subJson = sub.toJSON();
            const result = await subscribeToPushNotifications({
                endpoint: subJson.endpoint,
                keys: {
                    p256dh: subJson.keys?.p256dh ?? '',
                    auth: subJson.keys?.auth ?? '',
                },
                userAgent: navigator.userAgent,
            }, userId);

            if (result.success) {
                setSubscription(sub);
                toast.success('Successfully subscribed to notifications');
            } else {
                toast.error(result.error || 'Failed to subscribe');
            }
        } catch (error) {
            console.error('Error subscribing:', error);
            toast.error('Failed to subscribe to notifications');
        } finally {
            setIsLoading(false);
        }
    };

    const unsubscribe = async () => {
        try {
            setIsLoading(true);

            if (subscription) {
                const endpoint = subscription.endpoint;
                await subscription.unsubscribe();

                // Remove subscription from server
                const result = await unsubscribeFromPushNotifications(endpoint);

                if (result.success) {
                    setSubscription(null);
                    toast.success('Successfully unsubscribed from notifications');
                } else {
                    toast.error(result.error || 'Failed to unsubscribe');
                }
            }
        } catch (error) {
            console.error('Error unsubscribing:', error);
            toast.error('Failed to unsubscribe from notifications');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isSupported) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            {subscription ? (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={unsubscribe}
                    disabled={isLoading}
                >
                    <BellOff className="h-4 w-4 mr-2" />
                    Disable Notifications
                </Button>
            ) : (
                <Button
                    variant="default"
                    size="sm"
                    onClick={subscribe}
                    disabled={isLoading}
                >
                    <Bell className="h-4 w-4 mr-2" />
                    Enable Notifications
                </Button>
            )}
        </div>
    );
}
