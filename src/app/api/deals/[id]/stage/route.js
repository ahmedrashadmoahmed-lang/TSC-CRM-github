import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// PATCH /api/deals/:id/stage - Move deal to different stage
export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { stage } = body;

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
            data: { stage },
        });

        // Create activity for stage change
        await prisma.dealActivity.create({
            data: {
                dealId: deal.id,
                type: 'moved',
                description: `Deal moved from ${existingDeal.stage} to ${stage} by ${session.user.name}`,
                userId: session.user.id,
            },
        });

        return NextResponse.json(deal);
    } catch (error) {
        console.error('Error moving deal:', error);
        return NextResponse.json({ error: 'Failed to move deal' }, { status: 500 });
    }
}
