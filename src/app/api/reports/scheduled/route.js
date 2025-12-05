import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET all scheduled reports for current user
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tenantId = session.user.tenantId;

        // Note: ScheduledReport model needs to be added to Prisma schema
        // For now, return mock data structure
        const scheduledReports = [
            {
                id: '1',
                name: 'ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ù…Ø¨ÙŠØ¹Ø§Øª Ø§Ù„Ø´Ù‡Ø±ÙŠ',
                type: 'sales',
                frequency: 'monthly',
                recipients: ['admin@erp.com'],
                format: 'pdf',
                enabled: true,
                nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                lastRun: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000),
                createdAt: new Date('2025-01-01'),
            },
            {
                id: '2',
                name: 'ØªÙ‚Ø±ÙŠØ± Ø§Ù„ÙÙˆØ§ØªÙŠØ± Ø§Ù„Ù…ØªØ£Ø®Ø±Ø©',
                type: 'invoices',
                frequency: 'weekly',
                recipients: ['finance@erp.com'],
                format: 'excel',
                enabled: true,
                nextRun: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                lastRun: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                createdAt: new Date('2025-01-15'),
            }
        ];

        return NextResponse.json({
            success: true,
            data: scheduledReports
        });

    } catch (error) {
        console.error('Error fetching scheduled reports:', error);
        return NextResponse.json(
            { error: 'Failed to fetch scheduled reports' },
            { status: 500 }
        );
    }
}

// POST create new scheduled report
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, type, frequency, recipients, format, filters } = body;

        // Validate required fields
        if (!name || !type || !frequency || !recipients || !format) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Calculate next run time based on frequency
        const nextRun = calculateNextRun(frequency);

        // Create scheduled report
        const scheduledReport = {
            id: Date.now().toString(),
            name,
            type,
            frequency,
            recipients: Array.isArray(recipients) ? recipients : [recipients],
            format,
            filters: filters || {},
            enabled: true,
            nextRun,
            createdBy: session.user.id,
            tenantId: session.user.tenantId,
            createdAt: new Date(),
        };

        // TODO: Save to database when ScheduledReport model is added
        // await prisma.scheduledReport.create({ data: scheduledReport });

        return NextResponse.json({
            success: true,
            data: scheduledReport,
            message: 'ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ù…Ø¬Ø¯ÙˆÙ„ Ø¨Ù†Ø¬Ø§Ø­'
        });

    } catch (error) {
        console.error('Error creating scheduled report:', error);
        return NextResponse.json(
            { error: 'Failed to create scheduled report' },
            { status: 500 }
        );
    }
}

// PATCH update scheduled report
export async function PATCH(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Report ID is required' },
                { status: 400 }
            );
        }

        // TODO: Update in database
        // const updated = await prisma.scheduledReport.update({
        //   where: { id },
        //   data: updates
        // });

        return NextResponse.json({
            success: true,
            message: 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„ØªÙ‚Ø±ÙŠØ± Ø¨Ù†Ø¬Ø§Ø­'
        });

    } catch (error) {
        console.error('Error updating scheduled report:', error);
        return NextResponse.json(
            { error: 'Failed to update scheduled report' },
            { status: 500 }
        );
    }
}

// DELETE scheduled report
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
                { error: 'Report ID is required' },
                { status: 400 }
            );
        }

        // TODO: Delete from database
        // await prisma.scheduledReport.delete({ where: { id } });

        return NextResponse.json({
            success: true,
            message: 'ØªÙ… Ø­Ø°Ù Ø§Ù„ØªÙ‚Ø±ÙŠØ± Ø¨Ù†Ø¬Ø§Ø­'
        });

    } catch (error) {
        console.error('Error deleting scheduled report:', error);
        return NextResponse.json(
            { error: 'Failed to delete scheduled report' },
            { status: 500 }
        );
    }
}

// Helper function to calculate next run time
function calculateNextRun(frequency) {
    const now = new Date();

    switch (frequency) {
        case 'daily':
            return new Date(now.getTime() + 24 * 60 * 60 * 1000);
        case 'weekly':
            return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        case 'monthly':
            const nextMonth = new Date(now);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            return nextMonth;
        case 'quarterly':
            const nextQuarter = new Date(now);
            nextQuarter.setMonth(nextQuarter.getMonth() + 3);
            return nextQuarter;
        default:
            return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
}
