import webPush from 'web-push';

// Configure VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

if (vapidPublicKey && vapidPrivateKey) {
    webPush.setVapidDetails(
        vapidSubject,
        vapidPublicKey,
        vapidPrivateKey
    );
}

export interface PushNotificationPayload {
    title: string;
    body: string;
    icon?: string;
    image?: string;
    badge?: string;
    url?: string;
    tag?: string;
    data?: any;
}

export interface PushSubscriptionData {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

/**
 * Send push notification to a single subscription
 */
export async function sendPushNotification(
    subscription: PushSubscriptionData,
    payload: PushNotificationPayload
): Promise<{ success: boolean; error?: string }> {
    try {
        const notificationPayload = JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: payload.icon || '/icon-192x192.png',
            badge: payload.badge || '/badge-72x72.png',
            image: payload.image,
            url: payload.url,
            tag: payload.tag,
            data: payload.data,
        });

        await webPush.sendNotification(
            {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth,
                },
            },
            notificationPayload
        );

        return { success: true };
    } catch (error: any) {
        console.error('Error sending push notification:', error);

        // Handle subscription expiration/invalidity
        if (error.statusCode === 410 || error.statusCode === 404) {
            return { success: false, error: 'subscription_expired' };
        }

        return { success: false, error: error.message };
    }
}

/**
 * Send push notification to multiple subscriptions
 */
export async function sendBulkPushNotifications(
    subscriptions: PushSubscriptionData[],
    payload: PushNotificationPayload
): Promise<{ sent: number; failed: number; expiredSubscriptions: string[] }> {
    let sent = 0;
    let failed = 0;
    const expiredSubscriptions: string[] = [];

    await Promise.allSettled(
        subscriptions.map(async (subscription) => {
            const result = await sendPushNotification(subscription, payload);

            if (result.success) {
                sent++;
            } else {
                failed++;
                if (result.error === 'subscription_expired') {
                    expiredSubscriptions.push(subscription.endpoint);
                }
            }

            return result;
        })
    );

    return { sent, failed, expiredSubscriptions };
}

/**
 * Validate subscription format
 */
export function validateSubscription(subscription: any): boolean {
    return (
        subscription &&
        typeof subscription.endpoint === 'string' &&
        subscription.keys &&
        typeof subscription.keys.p256dh === 'string' &&
        typeof subscription.keys.auth === 'string'
    );
}
