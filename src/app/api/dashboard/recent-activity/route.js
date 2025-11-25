import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const employee = searchParams.get('employee');
        const team = searchParams.get('team');
        const stage = searchParams.get('stage');
        const type = searchParams.get('type');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // Build filter conditions
        const where = {};
        if (employee) where.userId = employee;
        if (type) where.type = { contains: type };
        if (stage) where.metadata = { path: ['stage'], equals: stage };

        // Fetch activities
        const [activities, total] = await Promise.all([
            prisma.activity.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.activity.count({ where })
        ]);

        // Format activities
        const formattedActivities = activities.map(activity => ({
            id: activity.id,
            type: activity.type,
            description: activity.description,
            user: {
                id: activity.user.id,
                name: activity.user.name
            },
            entityType: activity.entityType,
            entityId: activity.entityId,
            metadata: activity.metadata,
            timestamp: activity.createdAt,
            icon: getActivityIcon(activity.type),
            color: getActivityColor(activity.type)
        }));

        return NextResponse.json({
            success: true,
            data: {
                activities: formattedActivities,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasMore: skip + limit < total
                }
            }
        });
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch recent activity' },
            { status: 500 }
        );
    }
}

function getActivityIcon(type) {
    const icons = {
        client_added: '👤',
        deal_created: '💼',
        deal_won: '🎉',
        deal_lost: '😞',
        task_completed: '✅',
        task_created: '📝',
        ticket_created: '🎫',
        ticket_resolved: '✔️',
        invoice_sent: '📧',
        payment_received: '💰'
    };
    return icons[type] || '📌';
}

function getActivityColor(type) {
    const colors = {
        client_added: 'blue',
        deal_created: 'purple',
        deal_won: 'green',
        deal_lost: 'red',
        task_completed: 'green',
        task_created: 'blue',
        ticket_created: 'orange',
        ticket_resolved: 'green',
        invoice_sent: 'blue',
        payment_received: 'green'
    };
    return colors[type] || 'gray';
}
