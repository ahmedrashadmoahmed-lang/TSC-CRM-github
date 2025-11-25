import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// GET /api/deals/analytics - Get pipeline analytics
export async function GET(request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tenantId = session.user.tenantId;

        // Get all deals
        const deals = await prisma.deal.findMany({
            where: { tenantId },
        });

        // Calculate metrics by stage
        const stageMetrics = {
            leads: { count: 0, value: 0 },
            quotes: { count: 0, value: 0 },
            negotiations: { count: 0, value: 0 },
            won: { count: 0, value: 0 },
            lost: { count: 0, value: 0 },
        };

        deals.forEach(deal => {
            if (stageMetrics[deal.stage]) {
                stageMetrics[deal.stage].count++;
                stageMetrics[deal.stage].value += Number(deal.value);
            }
        });

        // Calculate conversion rates
        const totalDeals = deals.length;
        const wonDeals = stageMetrics.won.count;
        const winRate = totalDeals > 0 ? ((wonDeals / totalDeals) * 100).toFixed(1) : 0;

        // Calculate average deal size
        const totalValue = deals.reduce((sum, deal) => sum + Number(deal.value), 0);
        const avgDealSize = totalDeals > 0 ? (totalValue / totalDeals).toFixed(0) : 0;

        // Calculate sales velocity (average days to close)
        const wonDealsWithDates = await prisma.deal.findMany({
            where: {
                tenantId,
                stage: 'won',
                actualCloseDate: { not: null },
            },
        });

        let avgDaysToClose = 0;
        if (wonDealsWithDates.length > 0) {
            const totalDays = wonDealsWithDates.reduce((sum, deal) => {
                const created = new Date(deal.createdAt);
                const closed = new Date(deal.actualCloseDate);
                const days = Math.floor((closed - created) / (1000 * 60 * 60 * 24));
                return sum + days;
            }, 0);
            avgDaysToClose = Math.floor(totalDays / wonDealsWithDates.length);
        }

        return NextResponse.json({
            stageMetrics,
            totalValue,
            totalDeals,
            wonDeals,
            winRate: parseFloat(winRate),
            avgDealSize: parseFloat(avgDealSize),
            avgDaysToClose,
            conversionRates: {
                leadsToQuotes: stageMetrics.leads.count > 0
                    ? ((stageMetrics.quotes.count / stageMetrics.leads.count) * 100).toFixed(1)
                    : 0,
                quotesToNegotiations: stageMetrics.quotes.count > 0
                    ? ((stageMetrics.negotiations.count / stageMetrics.quotes.count) * 100).toFixed(1)
                    : 0,
                negotiationsToWon: stageMetrics.negotiations.count > 0
                    ? ((stageMetrics.won.count / stageMetrics.negotiations.count) * 100).toFixed(1)
                    : 0,
            },
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
