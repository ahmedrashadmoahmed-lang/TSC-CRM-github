import { getTenantPrisma } from '@/lib/prisma';
import { logAudit, AUDIT_ACTIONS } from '@/lib/auditLogger';

export class AnalyticsService {
    constructor(tenantId, tenantSettings, userId, userName, userEmail) {
        this.tenantId = tenantId;
        this.tenantSettings = tenantSettings;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.prisma = getTenantPrisma(tenantId);
    }

    /**
     * Get dashboard statistics
     */
    async getDashboardStats() {
        try {
            const [
                totalCustomers,
                totalInvoices,
                totalRevenue,
                pendingInvoices,
                overdueInvoices,
                topCustomers,
                recentInvoices,
                monthlyRevenue,
            ] = await Promise.all([
                // Total customers
                this.prisma.customer.count({
                    where: { status: 'active' },
                }),

                // Total invoices
                this.prisma.invoice.count(),

                // Total revenue
                this.prisma.invoice.aggregate({
                    _sum: { finalValue: true },
                    where: { status: { in: ['paid', 'partial'] } },
                }),

                // Pending invoices
                this.prisma.invoice.count({
                    where: { status: 'pending' },
                }),

                // Overdue invoices
                this.prisma.invoice.count({
                    where: {
                        status: { in: ['pending', 'partial'] },
                        date: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                    },
                }),

                // Top 5 customers
                this.prisma.customer.findMany({
                    take: 5,
                    orderBy: { totalValue: 'desc' },
                    select: {
                        id: true,
                        name: true,
                        totalValue: true,
                        totalInvoices: true,
                    },
                }),

                // Recent 10 invoices
                this.prisma.invoice.findMany({
                    take: 10,
                    orderBy: { date: 'desc' },
                    include: {
                        customer: {
                            select: { name: true },
                        },
                    },
                }),

                // Monthly revenue (last 12 months)
                this.getMonthlyRevenue(12),
            ]);

            return {
                overview: {
                    totalCustomers,
                    totalInvoices,
                    totalRevenue: totalRevenue._sum.finalValue || 0,
                    pendingInvoices,
                    overdueInvoices,
                },
                topCustomers,
                recentInvoices,
                monthlyRevenue,
            };
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            throw new Error('فشل في جلب إحصائيات لوحة التحكم');
        }
    }

    /**
     * Get monthly revenue for the last N months
     */
    async getMonthlyRevenue(months = 12) {
        try {
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - months);

            const invoices = await this.prisma.invoice.findMany({
                where: {
                    date: { gte: startDate },
                    status: { in: ['paid', 'partial'] },
                },
                select: {
                    date: true,
                    finalValue: true,
                },
            });

            // Group by month
            const monthlyData = {};
            invoices.forEach((invoice) => {
                const monthKey = `${invoice.date.getFullYear()}-${String(
                    invoice.date.getMonth() + 1
                ).padStart(2, '0')}`;

                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = 0;
                }
                monthlyData[monthKey] += invoice.finalValue;
            });

            // Convert to array and sort
            return Object.entries(monthlyData)
                .map(([month, revenue]) => ({ month, revenue }))
                .sort((a, b) => a.month.localeCompare(b.month));
        } catch (error) {
            console.error('Error getting monthly revenue:', error);
            throw new Error('فشل في جلب الإيرادات الشهرية');
        }
    }

    /**
     * Get sales analytics
     */
    async getSalesAnalytics(startDate, endDate) {
        try {
            const where = {
                date: {
                    gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    lte: endDate || new Date(),
                },
            };

            const [totalSales, paidSales, pendingSales, salesByType] = await Promise.all([
                this.prisma.invoice.aggregate({
                    _sum: { finalValue: true },
                    _count: true,
                    where,
                }),

                this.prisma.invoice.aggregate({
                    _sum: { finalValue: true },
                    _count: true,
                    where: { ...where, status: 'paid' },
                }),

                this.prisma.invoice.aggregate({
                    _sum: { finalValue: true },
                    _count: true,
                    where: { ...where, status: 'pending' },
                }),

                this.prisma.invoice.groupBy({
                    by: ['type'],
                    _sum: { finalValue: true },
                    _count: true,
                    where,
                }),
            ]);

            return {
                total: {
                    value: totalSales._sum.finalValue || 0,
                    count: totalSales._count,
                },
                paid: {
                    value: paidSales._sum.finalValue || 0,
                    count: paidSales._count,
                },
                pending: {
                    value: pendingSales._sum.finalValue || 0,
                    count: pendingSales._count,
                },
                byType: salesByType.map((item) => ({
                    type: item.type,
                    value: item._sum.finalValue || 0,
                    count: item._count,
                })),
            };
        } catch (error) {
            console.error('Error getting sales analytics:', error);
            throw new Error('فشل في جلب تحليلات المبيعات');
        }
    }

    /**
     * Get customer analytics
     */
    async getCustomerAnalytics() {
        try {
            const [totalCustomers, activeCustomers, topCustomers, customersByType] =
                await Promise.all([
                    this.prisma.customer.count(),

                    this.prisma.customer.count({
                        where: { status: 'active' },
                    }),

                    this.prisma.customer.findMany({
                        take: 10,
                        orderBy: { totalValue: 'desc' },
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            totalValue: true,
                            totalInvoices: true,
                        },
                    }),

                    this.prisma.customer.groupBy({
                        by: ['type'],
                        _count: true,
                    }),
                ]);

            return {
                total: totalCustomers,
                active: activeCustomers,
                inactive: totalCustomers - activeCustomers,
                topCustomers,
                byType: customersByType.map((item) => ({
                    type: item.type,
                    count: item._count,
                })),
            };
        } catch (error) {
            console.error('Error getting customer analytics:', error);
            throw new Error('فشل في جلب تحليلات العملاء');
        }
    }

    /**
     * Get inventory analytics
     */
    async getInventoryAnalytics() {
        try {
            // Get all products with their stock levels
            const products = await this.prisma.product.findMany({
                select: {
                    id: true,
                    name: true,
                    price: true,
                },
            });

            // Get stock levels for each product
            const stockLevels = await Promise.all(
                products.map(async (product) => {
                    const movements = await this.prisma.inventoryMovement.findMany({
                        where: { productId: product.id },
                        select: {
                            type: true,
                            quantity: true,
                        },
                    });

                    let stock = 0;
                    movements.forEach((movement) => {
                        if (['PURCHASE', 'TRANSFER_IN', 'ADJUSTMENT'].includes(movement.type)) {
                            stock += movement.quantity;
                        } else {
                            stock -= movement.quantity;
                        }
                    });

                    return {
                        productId: product.id,
                        productName: product.name,
                        stock,
                        value: stock * product.price,
                    };
                })
            );

            const totalValue = stockLevels.reduce((sum, item) => sum + item.value, 0);
            const lowStock = stockLevels.filter((item) => item.stock < 10);

            return {
                totalProducts: products.length,
                totalValue,
                lowStockCount: lowStock.length,
                lowStockProducts: lowStock,
                topValueProducts: stockLevels
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 10),
            };
        } catch (error) {
            console.error('Error getting inventory analytics:', error);
            throw new Error('فشل في جلب تحليلات المخزون');
        }
    }

    /**
     * Get financial summary
     */
    async getFinancialSummary(startDate, endDate) {
        try {
            const where = {
                date: {
                    gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    lte: endDate || new Date(),
                },
            };

            const [revenue, expenses, invoices] = await Promise.all([
                this.prisma.invoice.aggregate({
                    _sum: {
                        salesValue: true,
                        vat: true,
                        profitTax: true,
                        finalValue: true,
                    },
                    where: { ...where, status: { in: ['paid', 'partial'] } },
                }),

                this.prisma.purchaseOrder.aggregate({
                    _sum: { total: true },
                    where: { ...where, status: 'received' },
                }),

                this.prisma.invoice.findMany({
                    where,
                    select: {
                        status: true,
                        finalValue: true,
                        collected: true,
                    },
                }),
            ]);

            const totalRevenue = revenue._sum.finalValue || 0;
            const totalExpenses = expenses._sum.total || 0;
            const netProfit = totalRevenue - totalExpenses;

            const collected = invoices.reduce((sum, inv) => sum + inv.collected, 0);
            const outstanding = invoices.reduce(
                (sum, inv) => sum + (inv.finalValue - inv.collected),
                0
            );

            return {
                revenue: {
                    sales: revenue._sum.salesValue || 0,
                    vat: revenue._sum.vat || 0,
                    tax: revenue._sum.profitTax || 0,
                    total: totalRevenue,
                },
                expenses: totalExpenses,
                profit: {
                    gross: totalRevenue - totalExpenses,
                    net: netProfit,
                    margin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
                },
                collections: {
                    collected,
                    outstanding,
                    collectionRate: totalRevenue > 0 ? (collected / totalRevenue) * 100 : 0,
                },
            };
        } catch (error) {
            console.error('Error getting financial summary:', error);
            throw new Error('فشل في جلب الملخص المالي');
        }
    }

    /**
     * Get performance metrics
     */
    async getPerformanceMetrics() {
        try {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

            const [currentPeriod, previousPeriod] = await Promise.all([
                this.getSalesAnalytics(thirtyDaysAgo, new Date()),
                this.getSalesAnalytics(sixtyDaysAgo, thirtyDaysAgo),
            ]);

            const revenueGrowth =
                previousPeriod.total.value > 0
                    ? ((currentPeriod.total.value - previousPeriod.total.value) /
                        previousPeriod.total.value) *
                    100
                    : 0;

            const salesGrowth =
                previousPeriod.total.count > 0
                    ? ((currentPeriod.total.count - previousPeriod.total.count) /
                        previousPeriod.total.count) *
                    100
                    : 0;

            return {
                currentPeriod: {
                    revenue: currentPeriod.total.value,
                    sales: currentPeriod.total.count,
                },
                previousPeriod: {
                    revenue: previousPeriod.total.value,
                    sales: previousPeriod.total.count,
                },
                growth: {
                    revenue: revenueGrowth,
                    sales: salesGrowth,
                },
            };
        } catch (error) {
            console.error('Error getting performance metrics:', error);
            throw new Error('فشل في جلب مقاييس الأداء');
        }
    }
}
