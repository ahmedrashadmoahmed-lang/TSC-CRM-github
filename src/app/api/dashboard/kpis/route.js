import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Total Clients
        const totalClients = await prisma.customer.count({
            where: { status: 'active' }
        });
        const lastMonthClients = await prisma.customer.count({
            where: {
                status: 'active',
                createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
            }
        });
        const clientsTrend = lastMonthClients > 0
            ? ((totalClients - lastMonthClients) / lastMonthClients) * 100
            : 0;

        // New Leads (this month)
        const newLeads = await prisma.opportunity.count({
            where: {
                stage: 'lead',
                createdAt: { gte: startOfMonth }
            }
        });
        const lastMonthLeads = await prisma.opportunity.count({
            where: {
                stage: 'lead',
                createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
            }
        });
        const leadsTrend = lastMonthLeads > 0
            ? ((newLeads - lastMonthLeads) / lastMonthLeads) * 100
            : 0;

        // Open Deals
        const openDeals = await prisma.opportunity.findMany({
            where: {
                stage: { notIn: ['won', 'lost'] }
            }
        });
        const openDealsCount = openDeals.length;
        const openDealsValue = openDeals.reduce((sum, deal) => sum + deal.value, 0);

        const lastMonthOpenDeals = await prisma.opportunity.count({
            where: {
                stage: { notIn: ['won', 'lost'] },
                createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
            }
        });
        const dealsTrend = lastMonthOpenDeals > 0
            ? ((openDealsCount - lastMonthOpenDeals) / lastMonthOpenDeals) * 100
            : 0;

        // Conversion Rate (last 30 days)
        const closedDeals = await prisma.opportunity.findMany({
            where: {
                updatedAt: { gte: thirtyDaysAgo },
                stage: { in: ['won', 'lost'] }
            }
        });
        const wonDeals = closedDeals.filter(d => d.stage === 'won').length;
        const conversionRate = closedDeals.length > 0
            ? (wonDeals / closedDeals.length) * 100
            : 0;

        // Previous period for trend
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        const previousClosedDeals = await prisma.opportunity.findMany({
            where: {
                updatedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
                stage: { in: ['won', 'lost'] }
            }
        });
        const previousWonDeals = previousClosedDeals.filter(d => d.stage === 'won').length;
        const previousConversionRate = previousClosedDeals.length > 0
            ? (previousWonDeals / previousClosedDeals.length) * 100
            : 0;
        const conversionTrend = previousConversionRate > 0
            ? ((conversionRate - previousConversionRate) / previousConversionRate) * 100
            : 0;

        // Pending Tasks
        const pendingTasks = await prisma.task.count({
            where: {
                status: { in: ['pending', 'in_progress'] }
            }
        });
        const overdueTasks = await prisma.task.count({
            where: {
                status: { in: ['pending', 'in_progress'] },
                dueDate: { lt: now }
            }
        });

        // Generate sparkline data (last 7 days)
        const generateSparkline = async (model, field = 'createdAt') => {
            const sparkline = [];
            for (let i = 6; i >= 0; i--) {
                const dayStart = new Date(now);
                dayStart.setDate(dayStart.getDate() - i);
                dayStart.setHours(0, 0, 0, 0);

                const dayEnd = new Date(dayStart);
                dayEnd.setHours(23, 59, 59, 999);

                const count = await prisma[model].count({
                    where: {
                        [field]: { gte: dayStart, lte: dayEnd }
                    }
                });
                sparkline.push(count);
            }
            return sparkline;
        };

        const clientsSparkline = await generateSparkline('customer');
        const leadsSparkline = await generateSparkline('opportunity');
        const dealsSparkline = await generateSparkline('opportunity');

        return NextResponse.json({
            success: true,
            data: {
                totalClients: {
                    value: totalClients,
                    trend: Math.round(clientsTrend * 10) / 10,
                    sparkline: clientsSparkline
                },
                newLeads: {
                    value: newLeads,
                    trend: Math.round(leadsTrend * 10) / 10,
                    sparkline: leadsSparkline
                },
                openDeals: {
                    value: openDealsCount,
                    totalValue: Math.round(openDealsValue * 100) / 100,
                    trend: Math.round(dealsTrend * 10) / 10,
                    sparkline: dealsSparkline
                },
                conversionRate: {
                    value: Math.round(conversionRate * 10) / 10,
                    trend: Math.round(conversionTrend * 10) / 10,
                    sparkline: [conversionRate, conversionRate, conversionRate, conversionRate, conversionRate, conversionRate, conversionRate]
                },
                pendingTasks: {
                    value: pendingTasks,
                    overdue: overdueTasks,
                    sparkline: await generateSparkline('task')
                }
            }
        });
    } catch (error) {
        console.error('Error fetching KPIs:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch KPIs' },
            { status: 500 }
        );
    }
}
