import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { AnalyticsService } from '@/services/AnalyticsService';

// GET /api/reports/profitability
export const GET = withAuth(async (request) => {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const service = new AnalyticsService(
            request.tenantId,
            request.tenantSettings,
            request.userId,
            request.userName,
            request.userEmail
        );

        // Get financial summary
        const financialData = await service.getFinancialSummary(
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined
        );

        // Get monthly data for comparison chart
        const monthlyRevenue = await service.getMonthlyRevenue(12);

        // Calculate monthly expenses (simplified - you may want to enhance this)
        const prisma = service.prisma;
        const monthlyExpenses = await prisma.purchaseOrder.findMany({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000),
                },
                status: 'received',
            },
            select: {
                createdAt: true,
                total: true,
            },
        });

        // Group expenses by month
        const expensesByMonth = {};
        monthlyExpenses.forEach((po) => {
            const monthKey = `${po.createdAt.getFullYear()}-${String(po.createdAt.getMonth() + 1).padStart(2, '0')}`;
            if (!expensesByMonth[monthKey]) {
                expensesByMonth[monthKey] = 0;
            }
            expensesByMonth[monthKey] += po.total || 0;
        });

        // Combine revenue and expenses for comparison
        const comparison = monthlyRevenue.map(item => ({
            month: item.month,
            revenue: item.revenue,
            expenses: expensesByMonth[item.month] || 0,
        }));

        // Calculate profit margin trend
        const profitTrend = comparison.map(item => ({
            month: item.month,
            margin: item.revenue > 0 ? ((item.revenue - item.expenses) / item.revenue) * 100 : 0,
        }));

        return NextResponse.json({
            success: true,
            data: {
                revenue: financialData.revenue,
                expenses: financialData.expenses,
                profit: financialData.profit,
                collections: financialData.collections,
                comparison,
                profitTrend,
            },
        });
    } catch (error) {
        console.error('Error fetching profitability analytics:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch profitability analytics',
            },
            { status: 500 }
        );
    }
}, ['analytics:read']);
