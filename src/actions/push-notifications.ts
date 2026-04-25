'use server';

import { revalidatePath } from 'next/cache';
import { checkAdminAccess } from './admin';
import {
    sendBulkPushNotifications,
    validateSubscription,
    type PushNotificationPayload,
    type PushSubscriptionData
} from '@/lib/push-notifications';
import { prisma } from '@/lib/prisma';

/**
 * Subscribe to push notifications
 */
type SerializableSubscription = {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
    userAgent?: string;
};

export async function subscribeToPushNotifications(
    subscription: SerializableSubscription,
    userId?: string
) {
    try {
        if (!validateSubscription(subscription)) {
            return { success: false, error: 'Invalid subscription format' };
        }

        const subscriptionData = subscription;

        // Check if subscription already exists
        const existingSubscription = await prisma.pushSubscription.findUnique({
            where: { endpoint: subscriptionData.endpoint },
        });

        if (existingSubscription) {
            // Update existing subscription
            await prisma.pushSubscription.update({
                where: { endpoint: subscriptionData.endpoint },
                data: {
                    userId: userId || existingSubscription.userId,
                    p256dh: subscriptionData.keys.p256dh,
                    auth: subscriptionData.keys.auth,
                    isActive: true,
                    updatedAt: new Date(),
                },
            });
        } else {
            // Create new subscription
            await prisma.pushSubscription.create({
                data: {
                    userId,
                    endpoint: subscriptionData.endpoint,
                    p256dh: subscriptionData.keys.p256dh,
                    auth: subscriptionData.keys.auth,
                    userAgent: subscription.userAgent,
                },
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Error subscribing to push notifications:', error);
        return { success: false, error: 'Failed to subscribe to push notifications' };
    }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(endpoint: string) {
    try {
        await prisma.pushSubscription.update({
            where: { endpoint },
            data: { isActive: false },
        });

        return { success: true };
    } catch (error) {
        console.error('Error unsubscribing from push notifications:', error);
        return { success: false, error: 'Failed to unsubscribe from push notifications' };
    }
}

/**
 * Get all active subscriptions (Admin only)
 */
export async function getAllActiveSubscriptions() {
    await checkAdminAccess();

    try {
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { isActive: true },
            select: {
                id: true,
                userId: true,
                endpoint: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return { success: true, subscriptions };
    } catch (error) {
        console.error('Error getting subscriptions:', error);
        return { success: false, error: 'Failed to get subscriptions' };
    }
}

/**
 * Send push notification to all subscribers (Admin only)
 */
export async function sendPushNotificationToAll(payload: PushNotificationPayload) {
    await checkAdminAccess();

    try {
        // Get all active subscriptions
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { isActive: true },
            select: {
                id: true,
                endpoint: true,
                p256dh: true,
                auth: true,
            },
        });

        if (subscriptions.length === 0) {
            return { success: false, error: 'No active subscriptions found' };
        }

        // Create notification record
        const notification = await prisma.pushNotification.create({
            data: {
                title: payload.title,
                body: payload.body,
                icon: payload.icon,
                image: payload.image,
                badge: payload.badge,
                url: payload.url,
                tag: payload.tag,
                data: payload.data ? JSON.stringify(payload.data) : null,
                status: 'sending',
            },
        });

        // Convert to subscription format
        const subscriptionData: PushSubscriptionData[] = subscriptions.map(sub => ({
            endpoint: sub.endpoint,
            keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
            },
        }));

        // Send notifications
        const result = await sendBulkPushNotifications(subscriptionData, payload);

        // Remove expired subscriptions
        if (result.expiredSubscriptions.length > 0) {
            await prisma.pushSubscription.updateMany({
                where: {
                    endpoint: { in: result.expiredSubscriptions },
                },
                data: { isActive: false },
            });
        }

        // Update notification status
        await prisma.pushNotification.update({
            where: { id: notification.id },
            data: {
                status: result.failed === 0 ? 'sent' : result.sent > 0 ? 'sent' : 'failed',
                sentCount: result.sent,
                failCount: result.failed,
                sentAt: new Date(),
            },
        });

        revalidatePath('/admin/push-notifications');

        return {
            success: true,
            sent: result.sent,
            failed: result.failed,
            total: subscriptions.length,
        };
    } catch (error) {
        console.error('Error sending push notifications:', error);
        return { success: false, error: 'Failed to send push notifications' };
    }
}

/**
 * Send push notification to specific user (Admin only)
 */
export async function sendPushNotificationToUser(
    userId: string,
    payload: PushNotificationPayload
) {
    await checkAdminAccess();

    try {
        // Get user's active subscriptions
        const subscriptions = await prisma.pushSubscription.findMany({
            where: {
                userId,
                isActive: true,
            },
            select: {
                endpoint: true,
                p256dh: true,
                auth: true,
            },
        });

        if (subscriptions.length === 0) {
            return { success: false, error: 'No active subscriptions found for this user' };
        }

        // Create notification record
        const notification = await prisma.pushNotification.create({
            data: {
                title: payload.title,
                body: payload.body,
                icon: payload.icon,
                image: payload.image,
                badge: payload.badge,
                url: payload.url,
                tag: payload.tag,
                data: payload.data ? JSON.stringify(payload.data) : null,
                status: 'sending',
            },
        });

        // Convert to subscription format
        const subscriptionData: PushSubscriptionData[] = subscriptions.map(sub => ({
            endpoint: sub.endpoint,
            keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
            },
        }));

        // Send notifications
        const result = await sendBulkPushNotifications(subscriptionData, payload);

        // Remove expired subscriptions
        if (result.expiredSubscriptions.length > 0) {
            await prisma.pushSubscription.updateMany({
                where: {
                    endpoint: { in: result.expiredSubscriptions },
                },
                data: { isActive: false },
            });
        }

        // Update notification status
        await prisma.pushNotification.update({
            where: { id: notification.id },
            data: {
                status: result.failed === 0 ? 'sent' : result.sent > 0 ? 'sent' : 'failed',
                sentCount: result.sent,
                failCount: result.failed,
                sentAt: new Date(),
            },
        });

        revalidatePath('/admin/push-notifications');

        return {
            success: true,
            sent: result.sent,
            failed: result.failed,
        };
    } catch (error) {
        console.error('Error sending push notification to user:', error);
        return { success: false, error: 'Failed to send push notification' };
    }
}

/**
 * Get notification history (Admin only)
 */
export async function getPushNotificationHistory(limit = 50) {
    await checkAdminAccess();

    try {
        const notifications = await prisma.pushNotification.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return { success: true, notifications };
    } catch (error) {
        console.error('Error getting notification history:', error);
        return { success: false, error: 'Failed to get notification history' };
    }
}

/**
 * Get subscription statistics (Admin only)
 */
export async function getSubscriptionStats() {
    await checkAdminAccess();

    try {
        const [total, active, withUsers, anonymous] = await Promise.all([
            prisma.pushSubscription.count(),
            prisma.pushSubscription.count({ where: { isActive: true } }),
            prisma.pushSubscription.count({ where: { userId: { not: null }, isActive: true } }),
            prisma.pushSubscription.count({ where: { userId: null, isActive: true } }),
        ]);

        return {
            success: true,
            stats: {
                total,
                active,
                withUsers,
                anonymous,
                inactive: total - active,
            },
        };
    } catch (error) {
        console.error('Error getting subscription stats:', error);
        return { success: false, error: 'Failed to get subscription stats' };
    }
}

/**
 * Delete inactive subscriptions (Admin only)
 */
export async function cleanupInactiveSubscriptions() {
    await checkAdminAccess();

    try {
        const result = await prisma.pushSubscription.deleteMany({
            where: { isActive: false },
        });

        revalidatePath('/admin/push-notifications');

        return { success: true, deleted: result.count };
    } catch (error) {
        console.error('Error cleaning up subscriptions:', error);
        return { success: false, error: 'Failed to cleanup subscriptions' };
    }
}

/**
 * Send push notification to all admin users
 * Used for important events like new orders
 */
export async function sendPushNotificationToAdmins(payload: PushNotificationPayload) {
    try {
        // Get all admin user IDs
        const adminUsers = await prisma.user.findMany({
            where: {
                role: 'ADMIN',
            },
            select: {
                id: true,
            },
        });

        const adminUserIds = adminUsers.map(user => user.id);

        if (adminUserIds.length === 0) {
            return { success: false, error: 'No admin users found' };
        }

        // Get all admin users with active push subscriptions
        const adminSubscriptions = await prisma.pushSubscription.findMany({
            where: {
                isActive: true,
                userId: {
                    in: adminUserIds,
                },
            },
            select: {
                endpoint: true,
                p256dh: true,
                auth: true,
            },
        });

        if (adminSubscriptions.length === 0) {
            return { success: false, error: 'No active admin subscriptions found' };
        }

        // Create notification record
        const notification = await prisma.pushNotification.create({
            data: {
                title: payload.title,
                body: payload.body,
                icon: payload.icon,
                image: payload.image,
                badge: payload.badge,
                url: payload.url,
                tag: payload.tag,
                data: payload.data ? JSON.stringify(payload.data) : null,
                status: 'sending',
            },
        });

        // Convert to subscription format
        const subscriptionData: PushSubscriptionData[] = adminSubscriptions.map(sub => ({
            endpoint: sub.endpoint,
            keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
            },
        }));

        // Send notifications
        const result = await sendBulkPushNotifications(subscriptionData, payload);

        // Remove expired subscriptions
        if (result.expiredSubscriptions.length > 0) {
            await prisma.pushSubscription.updateMany({
                where: {
                    endpoint: { in: result.expiredSubscriptions },
                },
                data: { isActive: false },
            });
        }

        // Update notification status
        await prisma.pushNotification.update({
            where: { id: notification.id },
            data: {
                status: result.failed === 0 ? 'sent' : result.sent > 0 ? 'sent' : 'failed',
                sentCount: result.sent,
                failCount: result.failed,
                sentAt: new Date(),
            },
        });

        return {
            success: true,
            sent: result.sent,
            failed: result.failed,
        };
    } catch (error) {
        console.error('Error sending push notification to admins:', error);
        return { success: false, error: 'Failed to send push notification to admins' };
    }
}
