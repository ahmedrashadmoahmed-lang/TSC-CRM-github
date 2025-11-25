import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET budget variance analysis
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const year = parseInt(searchParams.get('year') || new Date().getFullYear());
        const month = searchParams.get('month') ? parseInt(searchParams.get('month')) : null;

        // Get budgets for the period
        const budgets = await prisma.budget.findMany({
            where: {
                year,
                ...(month && { month }),
            },
            include: {
                account: true,
            },
        });

        // Calculate actual amounts from journal entries
        const budgetAnalysis = await Promise.all(
            budgets.map(async (budget) => {
                const startDate = month
                    ? new Date(year, month - 1, 1)
                    : new Date(year, 0, 1);
                const endDate = month
                    ? new Date(year, month, 0)
                    : new Date(year, 11, 31);

                const journalLines = await prisma.journalLine.findMany({
                    where: {
                        accountId: budget.accountId,
                        journalEntry: {
                            status: 'posted',
                            date: {
                                gte: startDate,
                                lte: endDate,
                            },
                        },
                    },
                });

                const actual = journalLines.reduce((sum, line) => {
                    if (budget.account.type === 'expense') {
                        return sum + (line.debit - line.credit);
                    }
                    return sum + (line.credit - line.debit);
                }, 0);

                const variance = budget.amount - actual;
                const variancePercent = budget.amount > 0
                    ? ((variance / budget.amount) * 100)
                    : 0;

                // Update budget with actual
                await prisma.budget.update({
                    where: { id: budget.id },
                    data: {
                        actual: Math.round(actual * 100) / 100,
                        variance: Math.round(variance * 100) / 100,
                    },
                });

                return {
                    id: budget.id,
                    account: {
                        code: budget.account.code,
                        name: budget.account.name,
                        type: budget.account.type,
                    },
                    period: month ? `${year}-${String(month).padStart(2, '0')}` : `${year}`,
                    budgeted: Math.round(budget.amount * 100) / 100,
                    actual: Math.round(actual * 100) / 100,
                    variance: Math.round(variance * 100) / 100,
                    variancePercent: Math.round(variancePercent * 100) / 100,
                    status: variance >= 0 ? 'under' : 'over',
                };
            })
        );

        // Calculate totals
        const totalBudgeted = budgetAnalysis.reduce((sum, b) => sum + b.budgeted, 0);
        const totalActual = budgetAnalysis.reduce((sum, b) => sum + b.actual, 0);
        const totalVariance = totalBudgeted - totalActual;

        return NextResponse.json({
            success: true,
            data: {
                period: { year, month },
                budgets: budgetAnalysis,
                totals: {
                    budgeted: Math.round(totalBudgeted * 100) / 100,
                    actual: Math.round(totalActual * 100) / 100,
                    variance: Math.round(totalVariance * 100) / 100,
                    variancePercent: totalBudgeted > 0
                        ? Math.round((totalVariance / totalBudgeted) * 10000) / 100
                        : 0,
                },
            },
        });
    } catch (error) {
        console.error('Error analyzing budget variance:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to analyze budget variance' },
            { status: 500 }
        );
    }
}
