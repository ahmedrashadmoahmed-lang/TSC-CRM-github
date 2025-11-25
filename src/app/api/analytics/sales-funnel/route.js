import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
    try {
        // Get all opportunities grouped by stage
        const opportunities = await prisma.opportunity.findMany({
            where: {
                stage: { notIn: ['lost'] }
            },
            select: {
                stage: true,
                value: true
            }
        });

        // Define stage order
        const stageOrder = ['lead', 'qualified', 'proposal', 'negotiation', 'won'];
        const stageLabels = {
            lead: 'Lead',
            qualified: 'Qualified',
            proposal: 'Proposal',
            negotiation: 'Negotiation',
            won: 'Won'
        };

        // Group by stage
        const grouped = {};
        stageOrder.forEach(stage => {
            grouped[stage] = {
                stage: stageLabels[stage],
                count: 0,
                value: 0
            };
        });

        opportunities.forEach(opp => {
            const stage = opp.stage.toLowerCase();
            if (grouped[stage]) {
                grouped[stage].count++;
                grouped[stage].value += opp.value || 0;
            }
        });

        // Calculate conversion rates
        const totalLeads = grouped.lead.count || 1;
        const funnelData = stageOrder.map(stage => {
            const data = grouped[stage];
            return {
                stage: data.stage,
                count: data.count,
                value: Math.round(data.value),
                conversionRate: Math.round((data.count / totalLeads) * 100)
            };
        });

        return NextResponse.json({
            success: true,
            data: funnelData
        });

    } catch (error) {
        console.error('Error fetching sales funnel:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch sales funnel data'
        }, { status: 500 });
    }
}
