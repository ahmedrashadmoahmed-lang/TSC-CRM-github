import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET executive dashboard data
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tenantId = session.user.tenantId;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        // Get data
        const [invoices, customers, expenses, employees] = await Promise.all([
            prisma.invoice.findMany({ where: { tenantId } }),
            prisma.customer.findMany({ where: { tenantId } }),
            prisma.expense.findMany({ where: { tenantId } }),
            prisma.employee.findMany({ where: { tenantId } })
        ]);

        // Calculate KPIs
        const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
        const totalCollected = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const netProfit = totalCollected - totalExpenses;
        const profitMargin = totalCollected > 0 ? (netProfit / totalCollected) * 100 : 0;

        // Monthly revenue
        const monthlyRevenue = invoices
            .filter(inv => new Date(inv.issueDate) >= startOfMonth)
            .reduce((sum, inv) => sum + inv.total, 0);

        // YTD revenue
        const ytdRevenue = invoices
            .filter(inv => new Date(inv.issueDate) >= startOfYear)
            .reduce((sum, inv) => sum + inv.total, 0);

        // Collection rate
        const collectionRate = totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0;

        // Active customers
        const activeCustomers = customers.filter(c => c.status === 'active').length;

        // Average deal size
        const avgDealSize = invoices.length > 0 ? totalRevenue / invoices.length : 0;

        // Top performing metrics
        const topCustomers = customers
            .sort((a, b) => b.totalValue - a.totalValue)
            .slice(0, 5)
            .map(c => ({
                name: c.name,
                value: c.totalValue
            }));

        // Monthly trends (last 6 months)
        const monthlyTrends = [];
        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

            const monthInvoices = invoices.filter(inv => {
                const invDate = new Date(inv.issueDate);
                return invDate >= monthDate && invDate < nextMonth;
            });

            const monthExpenses = expenses.filter(exp => {
                const expDate = new Date(exp.date);
                return expDate >= monthDate && expDate < nextMonth;
            });

            monthlyTrends.push({
                month: monthDate.toLocaleDateString('ar-EG', { month: 'short' }),
                revenue: monthInvoices.reduce((sum, inv) => sum + inv.total, 0),
                expenses: monthExpenses.reduce((sum, exp) => sum + exp.amount, 0),
                profit: monthInvoices.reduce((sum, inv) => sum + inv.total, 0) -
                    monthExpenses.reduce((sum, exp) => sum + exp.amount, 0)
            });
        }

        // Growth metrics
        const lastMonthRevenue = monthlyTrends[monthlyTrends.length - 2]?.revenue || 0;
        const currentMonthRevenue = monthlyTrends[monthlyTrends.length - 1]?.revenue || 0;
        const revenueGrowth = lastMonthRevenue > 0
            ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
            : 0;

        return NextResponse.json({
            success: true,
            data: {
                kpis: {
                    totalRevenue: Math.round(totalRevenue),
                    totalCollected: Math.round(totalCollected),
                    netProfit: Math.round(netProfit),
                    profitMargin: Math.round(profitMargin * 10) / 10,
                    monthlyRevenue: Math.round(monthlyRevenue),
                    ytdRevenue: Math.round(ytdRevenue),
                    collectionRate: Math.round(collectionRate),
                    activeCustomers,
                    avgDealSize: Math.round(avgDealSize),
                    revenueGrowth: Math.round(revenueGrowth * 10) / 10
                },
                topCustomers,
                monthlyTrends,
                summary: {
                    totalInvoices: invoices.length,
                    totalCustomers: customers.length,
                    totalEmployees: employees.length,
                    pendingInvoices: invoices.filter(inv => inv.status === 'pending').length
                }
            }
        });

    } catch (error) {
        console.error('Error fetching executive dashboard:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}
