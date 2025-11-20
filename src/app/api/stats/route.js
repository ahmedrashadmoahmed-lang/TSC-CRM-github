import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/stats - Get dashboard statistics
export async function GET() {
    try {
        // Get invoice statistics
        const invoices = await prisma.invoice.findMany();
        const totalSales = invoices.reduce((sum, inv) => sum + inv.finalValue, 0);
        const totalCollected = invoices.reduce((sum, inv) => sum + inv.collected, 0);
        const pendingAmount = totalSales - totalCollected;

        // Get purchase orders statistics
        const purchaseOrders = await prisma.purchaseOrder.findMany();
        const totalPurchases = purchaseOrders.reduce((sum, po) => sum + po.amount, 0);

        // Get employee count
        const employeeCount = await prisma.employee.count({
            where: { status: 'active' }
        });

        // Get payroll statistics
        const payroll = await prisma.payroll.findMany();
        const totalPayroll = payroll.reduce((sum, p) => sum + p.netSalary, 0);

        // Get expense statistics
        const expenses = await prisma.expense.findMany();
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

        // Calculate profit margin
        const profitMargin = totalSales > 0
            ? ((totalSales - totalPurchases) / totalSales * 100).toFixed(2)
            : 0;

        const stats = {
            totalSales,
            totalCollected,
            pendingAmount,
            totalInvoices: invoices.length,
            totalPurchases,
            profitMargin: parseFloat(profitMargin),
            employees: employeeCount,
            totalPayroll,
            totalExpenses
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}
