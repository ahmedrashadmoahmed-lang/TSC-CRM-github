import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET activity logs
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const module = searchParams.get('module');
        const userId = searchParams.get('userId');
        const limit = parseInt(searchParams.get('limit') || '50');

        // Mock activity logs (will be replaced with database)
        const allLogs = [
            {
                id: '1',
                userId: session.user.id,
                userName: session.user.name,
                action: 'create',
                module: 'invoices',
                entityType: 'Invoice',
                entityId: 'INV-001',
                description: 'Ø£Ù†Ø´Ø£ ÙØ§ØªÙˆØ±Ø© Ø¬Ø¯ÙŠØ¯Ø© #INV-001',
                metadata: { total: 15000, customer: 'Ø´Ø±ÙƒØ© Ø§Ù„Ø¥Ø³ÙƒÙ†Ø¯Ø±ÙŠØ©' },
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0...',
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
            },
            {
                id: '2',
                userId: session.user.id,
                userName: session.user.name,
                action: 'update',
                module: 'customers',
                entityType: 'Customer',
                entityId: 'CUST-001',
                description: 'Ø­Ø¯Ù‘Ø« Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¹Ù…ÙŠÙ„ "Ø´Ø±ÙƒØ© Ø§Ù„Ø¥Ø³ÙƒÙ†Ø¯Ø±ÙŠØ©"',
                metadata: { field: 'phone', oldValue: '123', newValue: '456' },
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0...',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
            },
            {
                id: '3',
                userId: session.user.id,
                userName: session.user.name,
                action: 'delete',
                module: 'expenses',
                entityType: 'Expense',
                entityId: 'EXP-015',
                description: 'Ø­Ø°Ù Ù…ØµØ±ÙˆÙ #EXP-015',
                metadata: { amount: 500, category: 'Ù…ÙˆØ§ØµÙ„Ø§Øª' },
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0...',
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
            },
            {
                id: '4',
                userId: session.user.id,
                userName: session.user.name,
                action: 'login',
                module: 'auth',
                entityType: 'User',
                entityId: session.user.id,
                description: 'ØªØ³Ø¬ÙŠÙ„ Ø¯Ø®ÙˆÙ„ Ù†Ø§Ø¬Ø­',
                metadata: {},
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0...',
                timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000)
            },
            {
                id: '5',
                userId: session.user.id,
                userName: session.user.name,
                action: 'export',
                module: 'reports',
                entityType: 'Report',
                entityId: 'RPT-001',
                description: 'ØµØ¯Ù‘Ø± ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ù…Ø¨ÙŠØ¹Ø§Øª Ø§Ù„Ø´Ù‡Ø±ÙŠ',
                metadata: { format: 'PDF', period: 'November 2025' },
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0...',
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            }
        ];

        let logs = allLogs;

        // Filter by module
        if (module) {
            logs = logs.filter(log => log.module === module);
        }

        // Filter by user
        if (userId) {
            logs = logs.filter(log => log.userId === userId);
        }

        // Limit results
        logs = logs.slice(0, limit);

        return NextResponse.json({
            success: true,
            data: logs,
            total: allLogs.length
        });

    } catch (error) {
        console.error('Error fetching activity logs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch activity logs' },
            { status: 500 }
        );
    }
}

// POST create activity log
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action, module, entityType, entityId, description, metadata } = body;

        const log = {
            id: Date.now().toString(),
            userId: session.user.id,
            userName: session.user.name,
            action,
            module,
            entityType,
            entityId,
            description,
            metadata: metadata || {},
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
            tenantId: session.user.tenantId,
            timestamp: new Date()
        };

        // TODO: Save to database
        // await prisma.activityLog.create({ data: log });

        return NextResponse.json({
            success: true,
            data: log
        });

    } catch (error) {
        console.error('Error creating activity log:', error);
        return NextResponse.json(
            { error: 'Failed to create activity log' },
            { status: 500 }
        );
    }
}
