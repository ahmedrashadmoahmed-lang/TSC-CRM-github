import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET Dashboard Summary with Real KPIs
export async function GET(request) {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // 1. Revenue MTD (إيرادات هذا الشهر)
        const invoicesMTD = await prisma.invoice.findMany({
            where: {
                issueDate: { gte: startOfMonth },
                status: { in: ['paid', 'partial'] },
            },
        });
        const revenueMTD = invoicesMTD.reduce((sum, inv) => sum + inv.total, 0);

        // Previous month for trend
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        const invoicesPrevMonth = await prisma.invoice.findMany({
            where: {
                issueDate: { gte: prevMonthStart, lte: prevMonthEnd },
                status: { in: ['paid', 'partial'] },
            },
        });
        const revenuePrevMonth = invoicesPrevMonth.reduce((sum, inv) => sum + inv.total, 0);
        const revenueTrend = revenuePrevMonth > 0
            ? ((revenueMTD - revenuePrevMonth) / revenuePrevMonth) * 100
            : 0;

        // 2. New Opportunities (This month)
        // Note: Opportunity model not yet implemented in schema
        const newOpportunities = 0;

        // 3. Win Rate (%) — خلال 30 يوم
        // Note: Opportunity model not yet implemented in schema
        const winRate = 0;

        // 4. Avg Sales Cycle (days)
        // Note: Opportunity model not yet implemented in schema
        const avgSalesCycle = 0;

        // 5. Overdue Invoices (count + total EGP)
        const overdueInvoices = await prisma.invoice.findMany({
            where: {
                dueDate: { lt: now },
                status: { in: ['pending', 'partial'] },
            },
            include: {
                customer: true,
            },
        });
        const overdueCount = overdueInvoices.length;
        const overdueTotal = overdueInvoices.reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0);

        // 6. Low Stock SKUs (count)
        const lowStockProducts = await prisma.product.count({
            where: {
                OR: [
                    { quantity: { lte: 10 } }, // Low stock threshold
                    { quantity: 0 }, // Out of stock
                ],
            },
        });

        // 7. Top 5 Customers by value (MTD)
        const topCustomers = await prisma.invoice.groupBy({
            by: ['customerId'],
            where: {
                issueDate: { gte: startOfMonth },
                status: { in: ['paid', 'partial'] },
            },
            _sum: {
                total: true,
            },
            orderBy: {
                _sum: {
                    total: 'desc',
                },
            },
            take: 5,
        });

        const topCustomersWithDetails = await Promise.all(
            topCustomers.map(async (item) => {
                const customer = await prisma.customer.findUnique({
                    where: { id: item.customerId },
                });
                return {
                    id: customer.id,
                    name: customer.name,
                    value: item._sum.total,
                };
            })
        );

        // 8. Top 5 Open Deals (value + stage)
        // Note: Opportunity model not yet implemented in schema
        const topDeals = [];

        // 9. Cash Collections (YTD)
        const cashCollections = await prisma.invoice.findMany({
            where: {
                issueDate: { gte: startOfYear },
                status: { in: ['paid', 'partial'] },
            },
        });
        const cashCollectedYTD = cashCollections.reduce((sum, inv) => sum + inv.paidAmount, 0);

        // 10. RFQs Pending Response (count)
        // Note: RFQ model not yet implemented in schema
        const pendingRFQs = 0;

        // Recent Activity (last 20 events)
        const recentInvoices = await prisma.invoice.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { customer: true },
        });

        // Note: Opportunity model not yet implemented in schema
        const recentOpportunities = [];

        const recentPOs = await prisma.purchaseOrder.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { supplier: true },
        });

        const activities = [
            ...recentInvoices.map(inv => ({
                id: inv.id,
                type: 'invoice',
                description: `فاتورة جديدة #${inv.invoiceNumber} - ${inv.customer?.name}`,
                timestamp: inv.createdAt,
                amount: inv.total,
            })),
            ...recentOpportunities.map(opp => ({
                id: opp.id,
                type: 'opportunity',
                description: `فرصة جديدة: ${opp.title} - ${opp.customer?.name}`,
                timestamp: opp.createdAt,
                amount: opp.value,
            })),
            ...recentPOs.map(po => ({
                id: po.id,
                type: 'purchase_order',
                description: `أمر شراء #${po.poNumber} - ${po.supplier?.name}`,
                timestamp: po.createdAt,
                amount: po.total,
            })),
        ]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 20);

        return NextResponse.json({
            success: true,
            data: {
                kpis: {
                    revenueMTD: {
                        value: Math.round(revenueMTD * 100) / 100,
                        trend: Math.round(revenueTrend * 10) / 10,
                        label: 'إيرادات الشهر',
                        action: '/invoicing?filter=paid',
                    },
                    newOpportunities: {
                        value: newOpportunities,
                        label: 'فرص جديدة',
                        action: '/pipeline?filter=new',
                    },
                    winRate: {
                        value: Math.round(winRate * 10) / 10,
                        label: 'معدل الفوز',
                        unit: '%',
                        action: '/pipeline?filter=won',
                    },
                    avgSalesCycle: {
                        value: Math.round(avgSalesCycle),
                        label: 'متوسط دورة المبيعات',
                        unit: 'يوم',
                        action: '/pipeline',
                    },
                    overdueInvoices: {
                        count: overdueCount,
                        total: Math.round(overdueTotal * 100) / 100,
                        label: 'فواتير متأخرة',
                        action: '/invoicing?filter=overdue',
                        status: overdueCount > 0 ? 'warning' : 'success',
                    },
                    lowStock: {
                        value: lowStockProducts,
                        label: 'منتجات منخفضة المخزون',
                        action: '/inventory?filter=low',
                        status: lowStockProducts > 0 ? 'warning' : 'success',
                    },
                    cashCollections: {
                        value: Math.round(cashCollectedYTD * 100) / 100,
                        label: 'التحصيلات النقدية',
                        action: '/invoicing?filter=paid',
                    },
                    pendingRFQs: {
                        value: pendingRFQs,
                        label: 'طلبات عروض معلقة',
                        action: '/rfq?filter=pending',
                        status: pendingRFQs > 5 ? 'warning' : 'normal',
                    },
                },
                topCustomers: topCustomersWithDetails,
                topDeals: topDeals.map(deal => ({
                    id: deal.id,
                    title: deal.title,
                    customer: deal.customer?.name,
                    value: deal.value,
                    stage: deal.stage,
                    probability: deal.probability,
                })),
                activities,
                alerts: {
                    lowStock: lowStockProducts > 0,
                    overdueInvoices: overdueCount > 0,
                    pendingRFQs: pendingRFQs > 5,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}
