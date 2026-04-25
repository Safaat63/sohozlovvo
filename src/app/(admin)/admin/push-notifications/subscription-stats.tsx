'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Users, UserCheck, UserX } from 'lucide-react';

interface SubscriptionStatsProps {
    stats: {
        total: number;
        active: number;
        withUsers: number;
        anonymous: number;
        inactive: number;
    };
}

export function SubscriptionStats({ stats }: SubscriptionStatsProps) {
    const statCards = [
        {
            title: 'Total Subscriptions',
            value: stats.total,
            icon: Bell,
            color: 'text-blue-500',
        },
        {
            title: 'Active Subscriptions',
            value: stats.active,
            icon: Users,
            color: 'text-green-500',
        },
        {
            title: 'Registered Users',
            value: stats.withUsers,
            icon: UserCheck,
            color: 'text-purple-500',
        },
        {
            title: 'Inactive',
            value: stats.inactive,
            icon: UserX,
            color: 'text-gray-500',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <Icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
