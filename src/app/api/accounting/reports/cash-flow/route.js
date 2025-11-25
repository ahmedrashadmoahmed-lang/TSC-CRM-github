import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET Cash Flow Statement
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

        // Get all journal entries for the period
        const entries = await prisma.journalEntry.findMany({
            where: dateFilter,
            include: {
                lines: {
                    include: {
                        account: true,
                    },
                },
            },
            orderBy: { date: 'asc' },
        });

        // Categorize cash flows
        const operatingActivities = [];
        const investingActivities = [];
        const financingActivities = [];

        entries.forEach(entry => {
            entry.lines.forEach(line => {
                // Cash/Bank accounts
                if (line.account.code.startsWith('111')) {
                    const amount = line.debit - line.credit;
                    const description = line.description || entry.description;

                    // Categorize based on related account
                    const relatedLine = entry.lines.find(l => l.id !== line.id);
                    if (relatedLine) {
                        const relatedCode = relatedLine.account.code;

                        // Operating: Revenue, Expenses, Receivables, Payables
                        if (relatedCode.startsWith('4') || relatedCode.startsWith('5') ||
                            relatedCode.startsWith('112') || relatedCode.startsWith('211')) {
                            operatingActivities.push({
                                date: entry.date,
                                description,
                                amount: Math.round(amount * 100) / 100,
                                reference: entry.entryNumber,
                            });
                        }
                        // Investing: Fixed Assets
                        else if (relatedCode.startsWith('12')) {
                            investingActivities.push({
                                date: entry.date,
                                description,
                                amount: Math.round(amount * 100) / 100,
                                reference: entry.entryNumber,
                            });
                        }
                        // Financing: Equity, Long-term Liabilities
                        else if (relatedCode.startsWith('3') || relatedCode.startsWith('22')) {
                            financingActivities.push({
                                date: entry.date,
                                description,
                                amount: Math.round(amount * 100) / 100,
                                reference: entry.entryNumber,
                            });
                        }
                    }
                }
            });
        });

        // Calculate totals
        const operatingTotal = operatingActivities.reduce((sum, a) => sum + a.amount, 0);
        const investingTotal = investingActivities.reduce((sum, a) => sum + a.amount, 0);
        const financingTotal = financingActivities.reduce((sum, a) => sum + a.amount, 0);
        const netCashFlow = operatingTotal + investingTotal + financingTotal;

        // Get opening and closing cash balance
        const cashAccount = await prisma.account.findFirst({
            where: { code: '1111' }, // Cash account
        });

        const closingBalance = cashAccount?.balance || 0;
        const openingBalance = closingBalance - netCashFlow;

        return NextResponse.json({
            success: true,
            data: {
                period: {
                    startDate: startDate || 'Beginning',
                    endDate: endDate || 'Current',
                },
                operatingActivities: {
                    items: operatingActivities,
                    total: Math.round(operatingTotal * 100) / 100,
                },
                investingActivities: {
                    items: investingActivities,
                    total: Math.round(investingTotal * 100) / 100,
                },
                financingActivities: {
                    items: financingActivities,
                    total: Math.round(financingTotal * 100) / 100,
                },
                summary: {
                    openingBalance: Math.round(openingBalance * 100) / 100,
                    netCashFlow: Math.round(netCashFlow * 100) / 100,
                    closingBalance: Math.round(closingBalance * 100) / 100,
                },
            },
        });
    } catch (error) {
        console.error('Error generating cash flow statement:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate cash flow statement' },
            { status: 500 }
        );
    }
}
