import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const where = status ? { status } : {};

        const [tickets, total] = await Promise.all([
            prisma.ticket.findMany({
                where,
                include: {
                    client: { select: { id: true, name: true } },
                    assignee: { select: { id: true, name: true } }
                },
                orderBy: [
                    { priority: 'desc' },
                    { createdAt: 'desc' }
                ],
                skip,
                take: limit
            }),
            prisma.ticket.count({ where })
        ]);

        return NextResponse.json({
            success: true,
            data: { tickets, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
        });
    } catch (error) {
        console.error('Error fetching tickets:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch tickets' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { subject, description, priority, clientId, assignedTo } = await request.json();

        if (!subject || !description) {
            return NextResponse.json({ success: false, error: 'Subject and description are required' }, { status: 400 });
        }

        // Generate ticket number
        const count = await prisma.ticket.count();
        const ticketNumber = `TKT-${String(count + 1).padStart(6, '0')}`;

        const ticket = await prisma.ticket.create({
            data: {
                ticketNumber,
                subject,
                description,
                priority: priority || 'medium',
                clientId,
                assignedTo,
                tenantId: 'demo'
            },
            include: { client: true, assignee: true }
        });

        await prisma.activity.create({
            data: {
                type: 'ticket_created',
                description: `New ticket created: ${ticketNumber} - ${subject}`,
                userId: 'demo-user',
                entityType: 'ticket',
                entityId: ticket.id,
                tenantId: 'demo'
            }
        });

        return NextResponse.json({ success: true, data: ticket }, { status: 201 });
    } catch (error) {
        console.error('Error creating ticket:', error);
        return NextResponse.json({ success: false, error: 'Failed to create ticket' }, { status: 500 });
    }
}
