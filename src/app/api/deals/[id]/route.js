import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// GET /api/deals/:id - Get deal details
export async function GET(request, { params }) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const deal = await prisma.deal.findFirst({
            where: {
                id: params.id,
                tenantId: session.user.tenantId,
            },
            include: {
                activities: {
                    orderBy: { createdAt: 'desc' },
                },
                notes: {
                    orderBy: { createdAt: 'desc' },
                },
                attachments: true,
            },
        });

        if (!deal) {
            return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
        }

        return NextResponse.json(deal);
    } catch (error) {
        console.error('Error fetching deal:', error);
        return NextResponse.json({ error: 'Failed to fetch deal' }, { status: 500 });
    }
}

// PUT /api/deals/:id - Update deal
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { company, contactPerson, email, phone, value, priority, stage } = body;

        const existingDeal = await prisma.deal.findFirst({
            where: {
                id: params.id,
                tenantId: session.user.tenantId,
            },
        });

        if (!existingDeal) {
            return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
        }

        const deal = await prisma.deal.update({
            where: { id: params.id },
            data: {
                company,
                contactPerson,
                email,
                phone,
                value: value ? parseFloat(value) : undefined,
                priority,
                stage,
            },
        });

        // Create activity for update
        await prisma.dealActivity.create({
            data: {
                dealId: deal.id,
                type: 'updated',
                description: `Deal updated by ${session.user.name}`,
                userId: session.user.id,
            },
        });

        return NextResponse.json(deal);
    } catch (error) {
        console.error('Error updating deal:', error);
        return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 });
    }
}

// DELETE /api/deals/:id - Delete deal
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const deal = await prisma.deal.findFirst({
            where: {
                id: params.id,
                tenantId: session.user.tenantId,
            },
        });

        if (!deal) {
            return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
        }

        await prisma.deal.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Deal deleted successfully' });
    } catch (error) {
        console.error('Error deleting deal:', error);
        return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 });
    }
}
