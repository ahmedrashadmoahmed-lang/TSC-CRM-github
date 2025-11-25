import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET General Ledger
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const accountId = searchParams.get('accountId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!accountId) {
            return NextResponse.json(
                { success: false, error: 'Account ID is required' },
                { status: 400 }
            );
        }

        // Get account details
        const account = await prisma.account.findUnique({
            where: { id: accountId },
            include: { parent: true, currency: true },
        });

        if (!account) {
            return NextResponse.json(
                { success: false, error: 'Account not found' },
                { status: 404 }
            );
        }

        // Get opening balance (transactions before start date)
        let openingBalance = 0;
        if (startDate) {
            const openingLines = await prisma.journalLine.findMany({
                where: {
                    accountId,
                    journalEntry: {
                        status: 'posted',
                        date: { lt: new Date(startDate) },
                    },
                },
            });

            const openingDebit = openingLines.reduce((sum, line) => sum + line.debit, 0);
            const openingCredit = openingLines.reduce((sum, line) => sum + line.credit, 0);

            if (account.type === 'asset' || account.type === 'expense') {
                openingBalance = openingDebit - openingCredit;
            } else {
                openingBalance = openingCredit - openingDebit;
            }
        }

        // Get transactions for the period
        const dateFilter = {
            accountId,
            journalEntry: {
                status: 'posted',
                ...(startDate || endDate ? {
                    date: {
                        ...(startDate && { gte: new Date(startDate) }),
                        ...(endDate && { lte: new Date(endDate) }),
                    },
                } : {}),
            },
        };

        const lines = await prisma.journalLine.findMany({
            where: dateFilter,
            include: {
                journalEntry: true,
                costCenter: true,
            },
            orderBy: {
                journalEntry: {
                    date: 'asc',
                },
            },
        });

        // Calculate running balance
        let runningBalance = openingBalance;
        const transactions = lines.map(line => {
            let change = 0;
            if (account.type === 'asset' || account.type === 'expense') {
                change = line.debit - line.credit;
            } else {
                change = line.credit - line.debit;
            }

            runningBalance += change;

            return {
                id: line.id,
                date: line.journalEntry.date,
                entryNumber: line.journalEntry.entryNumber,
                description: line.description || line.journalEntry.description,
                reference: line.journalEntry.reference,
                costCenter: line.costCenter?.name,
                debit: Math.round(line.debit * 100) / 100,
                credit: Math.round(line.credit * 100) / 100,
                balance: Math.round(runningBalance * 100) / 100,
            };
        });

        // Calculate totals
        const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
        const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);
        const closingBalance = runningBalance;

        return NextResponse.json({
            success: true,
            data: {
                account: {
                    code: account.code,
                    name: account.name,
                    type: account.type,
                    currency: account.currency?.symbol || 'ج.م',
                },
                period: {
                    startDate: startDate || 'Beginning',
                    endDate: endDate || 'Current',
                },
                openingBalance: Math.round(openingBalance * 100) / 100,
                transactions,
                totals: {
                    debit: Math.round(totalDebit * 100) / 100,
                    credit: Math.round(totalCredit * 100) / 100,
                },
                closingBalance: Math.round(closingBalance * 100) / 100,
            },
        });
    } catch (error) {
        console.error('Error generating general ledger:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate general ledger' },
            { status: 500 }
        );
    }
}
