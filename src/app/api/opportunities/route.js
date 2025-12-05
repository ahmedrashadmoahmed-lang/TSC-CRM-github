import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        console.log('API Debug - Session:', JSON.stringify(session, null, 2));
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const tenantId = session.user.tenantId;

        const opportunities = await prisma.opportunity.findMany({
            where: {
                tenantId,
            },
            include: {
                customer: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(opportunities);
    } catch (error) {
        console.error('Error fetching opportunities:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch opportunities' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const tenantId = session.user.tenantId;
        const data = await request.json();

        const opportunity = await prisma.opportunity.create({
            data: {
                ...data,
                tenantId,
                ownerId: session.user.id,
            },
        });

        return NextResponse.json(opportunity);
    } catch (error) {
        console.error('Error creating opportunity:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create opportunity' },
            { status: 500 }
        );
    }
}
