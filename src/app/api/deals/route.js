import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// GET /api/deals - List all deals
export async function GET(request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const stage = searchParams.get('stage');
        const priority = searchParams.get('priority');
        const search = searchParams.get('search');

        const where = {
            tenantId: session.user.tenantId,
        };

        if (stage) where.stage = stage;
        if (priority) where.priority = priority;
        if (search) {
            where.OR = [
                { company: { contains: search, mode: 'insensitive' } },
                { contactPerson: { contains: search, mode: 'insensitive' } },
            ];
        }

        const deals = await prisma.deal.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                activities: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
                notes: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        return NextResponse.json(deals);
    } catch (error) {
        console.error('Error fetching deals:', error);
        return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
    }
}

// POST /api/deals - Create new deal
export async function POST(request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { company, contactPerson, email, phone, value, priority, stage = 'leads' } = body;

        const deal = await prisma.deal.create({
            data: {
                company,
                contactPerson,
                email,
                phone,
                value: parseFloat(value),
                priority,
                stage,
                tenantId: session.user.tenantId,
                assignedTo: session.user.id,
            },
        });

        // Create activity
        await prisma.dealActivity.create({
            data: {
                dealId: deal.id,
                type: 'created',
                description: `Deal created by ${session.user.name}`,
                userId: session.user.id,
            },
        });

        return NextResponse.json(deal, { status: 201 });
    } catch (error) {
        console.error('Error creating deal:', error);
        return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
    }
}
