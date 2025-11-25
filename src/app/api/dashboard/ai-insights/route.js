import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
    try {
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Follow-up Suggestions
        const opportunities = await prisma.opportunity.findMany({
            where: {
                stage: { notIn: ['won', 'lost'] },
                updatedAt: { lt: sevenDaysAgo }
            },
            include: {
                customer: true
            },
            orderBy: {
                value: 'desc'
            },
            take: 20
        });

        const followUpSuggestions = {
            high: opportunities.filter(opp => opp.value > 50000 && opp.probability >= 70).slice(0, 5).map(opp => ({
                id: opp.id,
                title: opp.title,
                customer: opp.customer?.name,
                value: opp.value,
                lastContact: opp.updatedAt,
                reason: 'High-value deal with strong probability - immediate follow-up recommended'
            })),
            medium: opportunities.filter(opp => (opp.value > 20000 && opp.value <= 50000) || (opp.probability >= 50 && opp.probability < 70)).slice(0, 5).map(opp => ({
                id: opp.id,
                title: opp.title,
                customer: opp.customer?.name,
                value: opp.value,
                lastContact: opp.updatedAt,
                reason: 'Moderate opportunity - follow-up within 48 hours'
            })),
            low: opportunities.filter(opp => opp.value <= 20000 && opp.probability < 50).slice(0, 5).map(opp => ({
                id: opp.id,
                title: opp.title,
                customer: opp.customer?.name,
                value: opp.value,
                lastContact: opp.updatedAt,
                reason: 'Low priority - schedule follow-up when convenient'
            }))
        };

        // At-risk Clients (no activity in 30+ days)
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const atRiskClients = await prisma.customer.findMany({
            where: {
                status: 'active',
                updatedAt: { lt: thirtyDaysAgo }
            },
            include: {
                invoices: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                opportunities: {
                    where: { stage: { notIn: ['won', 'lost'] } },
                    orderBy: { value: 'desc' },
                    take: 1
                }
            },
            take: 10
        });

        // High-potential Opportunities
        const highPotentialOpportunities = await prisma.opportunity.findMany({
            where: {
                stage: { in: ['proposal', 'negotiation'] },
                probability: { gte: 70 },
                value: { gte: 30000 }
            },
            include: {
                customer: true
            },
            orderBy: [
                { probability: 'desc' },
                { value: 'desc' }
            ],
            take: 10
        });

        // Performance Notes (AI-generated insights)
        const totalDeals = await prisma.opportunity.count();
        const wonDeals = await prisma.opportunity.count({ where: { stage: 'won' } });
        const avgDealValue = await prisma.opportunity.aggregate({
            where: { stage: 'won' },
            _avg: { value: true }
        });

        const performanceNotes = [
            totalDeals > 0 && wonDeals / totalDeals > 0.3
                ? `Strong conversion rate of ${Math.round((wonDeals / totalDeals) * 100)}% - keep up the momentum!`
                : `Conversion rate at ${Math.round((wonDeals / totalDeals) * 100)}% - consider reviewing sales process`,
            avgDealValue._avg.value > 40000
                ? `Average deal value of $${Math.round(avgDealValue._avg.value).toLocaleString()} is above target`
                : `Average deal value could be improved through upselling strategies`,
            atRiskClients.length > 5
                ? `${atRiskClients.length} clients show no recent activity - prioritize re-engagement`
                : `Client engagement is healthy across the board`,
            highPotentialOpportunities.length > 0
                ? `${highPotentialOpportunities.length} high-potential deals in pipeline - focus resources here`
                : `Pipeline needs more qualified opportunities`
        ].filter(Boolean);

        return NextResponse.json({
            success: true,
            data: {
                followUpSuggestions,
                atRiskClients: atRiskClients.map(client => ({
                    id: client.id,
                    name: client.name,
                    lastActivity: client.updatedAt,
                    lastInvoice: client.invoices[0]?.createdAt,
                    openDeals: client.opportunities.length,
                    riskLevel: client.updatedAt < new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000) ? 'high' : 'medium'
                })),
                highPotentialOpportunities: highPotentialOpportunities.map(opp => ({
                    id: opp.id,
                    title: opp.title,
                    customer: opp.customer?.name,
                    value: opp.value,
                    probability: opp.probability,
                    stage: opp.stage,
                    potentialScore: Math.round((opp.probability * opp.value) / 1000)
                })),
                performanceNotes
            }
        });
    } catch (error) {
        console.error('Error fetching AI insights:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch AI insights' },
            { status: 500 }
        );
    }
}
