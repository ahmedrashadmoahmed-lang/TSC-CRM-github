import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET all notifications for current user
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const unreadOnly = searchParams.get('unread') === 'true';

        // Mock notifications (will be replaced with database)
        const allNotifications = [
            {
                id: '1',
                type: 'invoice_overdue',
                title: 'ÙØ§ØªÙˆØ±Ø© Ù…ØªØ£Ø®Ø±Ø©',
                message: 'ÙØ§ØªÙˆØ±Ø© #INV-001 Ù…ØªØ£Ø®Ø±Ø© 7 Ø£ÙŠØ§Ù…',
                priority: 'high',
                read: false,
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
                link: '/invoicing?id=1'
            },
            {
                id: '2',
                type: 'low_stock',
                title: 'Ù…Ø®Ø²ÙˆÙ† Ù…Ù†Ø®ÙØ¶',
                message: 'Ù…Ù†ØªØ¬ "ÙƒØ§Ø¨Ù„ ÙƒÙ‡Ø±Ø¨Ø§Ø¡" ÙˆØµÙ„ Ù„Ù„Ø­Ø¯ Ø§Ù„Ø£Ø¯Ù†Ù‰',
                priority: 'medium',
                read: false,
                createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
                link: '/inventory'
            },
            {
                id: '3',
                type: 'payment_received',
                title: 'ØªÙ… Ø§Ø³ØªÙ„Ø§Ù… Ø¯ÙØ¹Ø©',
                message: 'ØªÙ… Ø§Ø³ØªÙ„Ø§Ù… 15,000 Ø¬Ù†ÙŠÙ‡ Ù…Ù† Ø´Ø±ÙƒØ© Ø§Ù„Ø¥Ø³ÙƒÙ†Ø¯Ø±ÙŠØ©',
                priority: 'low',
                read: true,
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                link: '/invoicing'
            },
            {
                id: '4',
                type: 'new_rfq',
                title: 'Ø·Ù„Ø¨ Ø¹Ø±Ø¶ Ø£Ø³Ø¹Ø§Ø± Ø¬Ø¯ÙŠØ¯',
                message: 'Ø·Ù„Ø¨ Ø¹Ø±Ø¶ Ø£Ø³Ø¹Ø§Ø± Ø¬Ø¯ÙŠØ¯ Ù…Ù† Ø¹Ù…ÙŠÙ„ Ø¬Ø¯ÙŠØ¯',
                priority: 'medium',
                read: false,
                createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
                link: '/rfq'
            },
            {
                id: '5',
                type: 'system',
                title: 'ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù†Ø¸Ø§Ù…',
                message: 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù†Ø¸Ø§Ù… Ø¥Ù„Ù‰ Ø§Ù„Ø¥ØµØ¯Ø§Ø± 5.1.0',
                priority: 'low',
                read: true,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                link: null
            }
        ];

        const notifications = unreadOnly
            ? allNotifications.filter(n => !n.read)
            : allNotifications;

        const unreadCount = allNotifications.filter(n => !n.read).length;

        return NextResponse.json({
            success: true,
            data: notifications,
            unreadCount
        });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

// POST create notification
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { type, title, message, priority, link } = body;

        const notification = {
            id: Date.now().toString(),
            type,
            title,
            message,
            priority: priority || 'low',
            link: link || null,
            read: false,
            userId: session.user.id,
            tenantId: session.user.tenantId,
            createdAt: new Date()
        };

        // TODO: Save to database
        // await prisma.notification.create({ data: notification });

        return NextResponse.json({
            success: true,
            data: notification,
            message: 'ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø¥Ø´Ø¹Ø§Ø± Ø¨Ù†Ø¬Ø§Ø­'
        });

    } catch (error) {
        console.error('Error creating notification:', error);
        return NextResponse.json(
            { error: 'Failed to create notification' },
            { status: 500 }
        );
    }
}

// PATCH mark as read
export async function PATCH(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, read } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Notification ID required' },
                { status: 400 }
            );
        }

        // TODO: Update in database
        // await prisma.notification.update({
        //   where: { id },
        //   data: { read }
        // });

        return NextResponse.json({
            success: true,
            message: 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±'
        });

    } catch (error) {
        console.error('Error updating notification:', error);
        return NextResponse.json(
            { error: 'Failed to update notification' },
            { status: 500 }
        );
    }
}

// DELETE notification
export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Notification ID required' },
                { status: 400 }
            );
        }

        // TODO: Delete from database
        // await prisma.notification.delete({ where: { id } });

        return NextResponse.json({
            success: true,
            message: 'ØªÙ… Ø­Ø°Ù Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±'
        });

    } catch (error) {
        console.error('Error deleting notification:', error);
        return NextResponse.json(
            { error: 'Failed to delete notification' },
            { status: 500 }
        );
    }
}
