import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all deals
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const stage = searchParams.get('stage');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const where = stage ? { stage } : {};

        const [deals, total] = await Promise.all([
            prisma.opportunity.findMany({
                where,
                include: {
                    customer: {
                        select: { id: true, name: true, email: true }
                    },
                    tasks: {
                        where: { status: { in: ['pending', 'in_progress'] } },
                        select: { id: true, title: true, dueDate: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.opportunity.count({ where })
        ]);

        return NextResponse.json({
            success: true,
            data: {
                deals,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching deals:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch deals' },
            { status: 500 }
        );
    }
}

// POST create new deal
export async function POST(request) {
    try {
        const body = await request.json();
        const { title, customerId, value, stage, probability } = body;

        if (!title || !customerId || !value) {
            return NextResponse.json(
                { success: false, error: 'Title, customer, and value are required' },
                { status: 400 }
            );
        }

        const deal = await prisma.opportunity.create({
            data: {
                title,
                customerId,
                value: parseFloat(value),
                stage: stage || 'lead',
                probability: probability || 0,
                tenantId: 'demo' // TODO: Get from auth context
            },
            include: {
                customer: true
            }
        });

        // Create activity
        await prisma.activity.create({
            data: {
                type: 'deal_created',
                description: `New deal created: ${title} - $${value}`,
                userId: 'demo-user', // TODO: Get from auth context
                entityType: 'deal',
                entityId: deal.id,
                metadata: { value, stage: deal.stage },
                tenantId: 'demo'
            }
        });

        return NextResponse.json({
            success: true,
            data: deal
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating deal:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create deal' },
            { status: 500 }
        );
    }
}
