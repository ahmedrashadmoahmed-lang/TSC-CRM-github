import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/analytics/funnel - Get conversion funnel data
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build date filter
        const dateFilter = {};
        if (startDate) dateFilter.gte = new Date(startDate);
        if (endDate) dateFilter.lte = new Date(endDate);

        // Get deals by stage
        const stages = ['leads', 'qualified', 'proposal', 'closed'];
        const funnelData = [];

        for (const stage of stages) {
            const deals = await prisma.deal.findMany({
                where: {
                    stage,
                    ...(Object.keys(dateFilter).length > 0 && {
                        createdAt: dateFilter,
                    }),
                },
            });

            const count = deals.length;
            const value = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);

            funnelData.push({
                stage: stage.charAt(0).toUpperCase() + stage.slice(1),
                count,
                value,
            });
        }

        return NextResponse.json(funnelData);
    } catch (error) {
        console.error('Error fetching funnel data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch funnel data' },
            { status: 500 }
        );
    }
}
