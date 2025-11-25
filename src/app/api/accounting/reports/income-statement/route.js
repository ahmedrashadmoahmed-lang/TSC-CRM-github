import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET Income Statement
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const dateFilter = {
            status: 'posted',
            ...(startDate || endDate ? {
                date: {
                    ...(startDate && { gte: new Date(startDate) }),
                    ...(endDate && { lte: new Date(endDate) }),
                },
            } : {}),
        };

        // Get revenue accounts (type = 'revenue')
        const revenueAccounts = await prisma.account.findMany({
            where: { type: 'revenue', isActive: true },
            include: {
                journalLines: {
                    where: { journalEntry: dateFilter },
                },
            },
            orderBy: { code: 'asc' },
        });

        // Get expense accounts (type = 'expense')
        const expenseAccounts = await prisma.account.findMany({
            where: { type: 'expense', isActive: true },
            include: {
                journalLines: {
                    where: { journalEntry: dateFilter },
                },
            },
            orderBy: { code: 'asc' },
        });

        // Calculate revenue
        const revenues = revenueAccounts.map(acc => {
            const total = acc.journalLines.reduce(
                (sum, line) => sum + line.credit - line.debit,
                0
            );
            return {
                code: acc.code,
                name: acc.name,
                amount: Math.round(total * 100) / 100,
            };
        }).filter(r => r.amount !== 0);

        // Calculate expenses
        const expenses = expenseAccounts.map(acc => {
            const total = acc.journalLines.reduce(
                (sum, line) => sum + line.debit - line.credit,
                0
            );
            return {
                code: acc.code,
                name: acc.name,
                amount: Math.round(total * 100) / 100,
            };
        }).filter(e => e.amount !== 0);

        // Calculate totals
        const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const netIncome = totalRevenue - totalExpenses;

        // Categorize expenses
        const costOfGoodsSold = expenses.filter(e => e.code.startsWith('5100'));
        const operatingExpenses = expenses.filter(e => e.code.startsWith('52') || e.code.startsWith('53'));
        const financialExpenses = expenses.filter(e => e.code.startsWith('54'));

        const totalCOGS = costOfGoodsSold.reduce((sum, e) => sum + e.amount, 0);
        const totalOpEx = operatingExpenses.reduce((sum, e) => sum + e.amount, 0);
        const totalFinEx = financialExpenses.reduce((sum, e) => sum + e.amount, 0);

        const grossProfit = totalRevenue - totalCOGS;
        const operatingIncome = grossProfit - totalOpEx;

        return NextResponse.json({
            success: true,
            data: {
                period: {
                    startDate: startDate || 'Beginning',
                    endDate: endDate || 'Current',
                },
                revenues,
                expenses: {
                    costOfGoodsSold,
                    operatingExpenses,
                    financialExpenses,
                    other: expenses.filter(e =>
                        !e.code.startsWith('51') &&
                        !e.code.startsWith('52') &&
                        !e.code.startsWith('53') &&
                        !e.code.startsWith('54')
                    ),
                },
                summary: {
                    totalRevenue: Math.round(totalRevenue * 100) / 100,
                    totalCOGS: Math.round(totalCOGS * 100) / 100,
                    grossProfit: Math.round(grossProfit * 100) / 100,
                    grossProfitMargin: totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 10000) / 100 : 0,
                    totalOperatingExpenses: Math.round(totalOpEx * 100) / 100,
                    operatingIncome: Math.round(operatingIncome * 100) / 100,
                    operatingMargin: totalRevenue > 0 ? Math.round((operatingIncome / totalRevenue) * 10000) / 100 : 0,
                    totalFinancialExpenses: Math.round(totalFinEx * 100) / 100,
                    netIncome: Math.round(netIncome * 100) / 100,
                    netProfitMargin: totalRevenue > 0 ? Math.round((netIncome / totalRevenue) * 10000) / 100 : 0,
                },
            },
        });
    } catch (error) {
        console.error('Error generating income statement:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate income statement' },
            { status: 500 }
        );
    }
}
