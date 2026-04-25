'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sendPushNotificationToAll } from '@/actions/push-notifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const notificationSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
    body: z.string().min(1, 'Message is required').max(500, 'Message must be less than 500 characters'),
    url: z.string().optional(),
    icon: z.string().optional(),
    image: z.string().optional(),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

export function SendNotificationForm() {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<NotificationFormValues>({
        resolver: zodResolver(notificationSchema),
        defaultValues: {
            title: '',
            body: '',
            url: '',
            icon: '/icon-192x192.png',
            image: '',
        },
    });

    const onSubmit = async (data: NotificationFormValues) => {
        try {
            setIsLoading(true);

            const result = await sendPushNotificationToAll({
                title: data.title,
                body: data.body,
                url: data.url || undefined,
                icon: data.icon || undefined,
                image: data.image || undefined,
            });

            if (result.success) {
                toast.success(`Notification sent to ${result.sent} subscriber(s)`);
                if (result.failed > 0) {
                    toast.warning(`Failed to send to ${result.failed} subscriber(s)`);
                }
                form.reset();
            } else {
                toast.error(result.error || 'Failed to send notification');
            }
        } catch (error) {
            console.error('Error sending notification:', error);
            toast.error('Failed to send notification');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title *</FormLabel>
                            <FormControl>
                                <Input placeholder="New products available!" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Message *</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Check out our latest collection with amazing discounts!"
                                    className="min-h-25"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Keep it concise and engaging
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="/products" {...field} />
                            </FormControl>
                            <FormDescription>
                                URL to open when notification is clicked
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Image URL (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="https://example.com/image.jpg" {...field} />
                            </FormControl>
                            <FormDescription>
                                Large image to display in notification
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Notification
                        </>
                    )}
                </Button>
            </form>
        </Form>
    );
}
