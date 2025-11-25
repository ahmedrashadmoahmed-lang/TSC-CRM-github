import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all clients
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const status = searchParams.get('status');
        const skip = (page - 1) * limit;

        const where = status ? { status } : {};

        const [clients, total] = await Promise.all([
            prisma.customer.findMany({
                where,
                include: {
                    opportunities: {
                        where: { stage: { notIn: ['won', 'lost'] } },
                        select: { id: true, value: true }
                    },
                    tasks: {
                        where: { status: { in: ['pending', 'in_progress'] } },
                        select: { id: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.customer.count({ where })
        ]);

        return NextResponse.json({
            success: true,
            data: {
                clients: clients.map(c => ({
                    ...c,
                    openDealsCount: c.opportunities.length,
                    openDealsValue: c.opportunities.reduce((sum, o) => sum + o.value, 0),
                    pendingTasksCount: c.tasks.length
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching clients:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch clients' },
            { status: 500 }
        );
    }
}

// POST create new client
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, phone, address, taxNumber } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, error: 'Name is required' },
                { status: 400 }
            );
        }

        const client = await prisma.customer.create({
            data: {
                name,
                email,
                phone,
                address,
                taxNumber,
                status: 'active',
                tenantId: 'demo' // TODO: Get from auth context
            }
        });

        // Create activity
        await prisma.activity.create({
            data: {
                type: 'client_added',
                description: `New client added: ${name}`,
                userId: 'demo-user', // TODO: Get from auth context
                entityType: 'client',
                entityId: client.id,
                tenantId: 'demo'
            }
        });

        return NextResponse.json({
            success: true,
            data: client
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating client:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create client' },
            { status: 500 }
        );
    }
}
