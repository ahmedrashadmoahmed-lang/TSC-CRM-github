import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const history = await prisma.stageHistory.findMany({
            where: {
                opportunityId: params.id,
            },
            orderBy: {
                changedAt: 'desc',
            },
        });

        return NextResponse.json(history);
    } catch (error) {
        console.error('Error fetching stage history:', error);
        return NextResponse.json({ error: 'Failed to fetch stage history' }, { status: 500 });
    }
}
