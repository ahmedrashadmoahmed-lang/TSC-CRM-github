import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET Balance Sheet
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const asOfDate = searchParams.get('asOfDate') || new Date().toISOString();

        const dateFilter = {
            status: 'posted',
            date: { lte: new Date(asOfDate) },
        };

        // Get all accounts with their balances
        const accounts = await prisma.account.findMany({
            where: { isActive: true },
            include: {
                journalLines: {
                    where: { journalEntry: dateFilter },
                },
            },
            orderBy: { code: 'asc' },
        });

        // Calculate balances for each account
        const calculateBalance = (account) => {
            const debit = account.journalLines.reduce((sum, line) => sum + line.debit, 0);
            const credit = account.journalLines.reduce((sum, line) => sum + line.credit, 0);

            // Assets and Expenses increase with debit
            if (account.type === 'asset' || account.type === 'expense') {
                return debit - credit;
            }
            // Liabilities, Equity, and Revenue increase with credit
            return credit - debit;
        };

        // Categorize accounts
        const assets = accounts
            .filter(acc => acc.type === 'asset')
            .map(acc => ({
                code: acc.code,
                name: acc.name,
                level: acc.level,
                balance: Math.round(calculateBalance(acc) * 100) / 100,
            }))
            .filter(acc => acc.balance !== 0);

        const liabilities = accounts
            .filter(acc => acc.type === 'liability')
            .map(acc => ({
                code: acc.code,
                name: acc.name,
                level: acc.level,
                balance: Math.round(calculateBalance(acc) * 100) / 100,
            }))
            .filter(acc => acc.balance !== 0);

        const equity = accounts
            .filter(acc => acc.type === 'equity')
            .map(acc => ({
                code: acc.code,
                name: acc.name,
                level: acc.level,
                balance: Math.round(calculateBalance(acc) * 100) / 100,
            }))
            .filter(acc => acc.balance !== 0);

        // Calculate current vs non-current
        const currentAssets = assets.filter(a => a.code.startsWith('11'));
        const nonCurrentAssets = assets.filter(a => a.code.startsWith('12'));
        const currentLiabilities = liabilities.filter(l => l.code.startsWith('21'));
        const nonCurrentLiabilities = liabilities.filter(l => l.code.startsWith('22'));

        // Calculate totals
        const totalCurrentAssets = currentAssets.reduce((sum, a) => sum + a.balance, 0);
        const totalNonCurrentAssets = nonCurrentAssets.reduce((sum, a) => sum + a.balance, 0);
        const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

        const totalCurrentLiabilities = currentLiabilities.reduce((sum, l) => sum + l.balance, 0);
        const totalNonCurrentLiabilities = nonCurrentLiabilities.reduce((sum, l) => sum + l.balance, 0);
        const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;

        const totalEquity = equity.reduce((sum, e) => sum + e.balance, 0);
        const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

        // Calculate financial ratios
        const workingCapital = totalCurrentAssets - totalCurrentLiabilities;
        const currentRatio = totalCurrentLiabilities > 0
            ? totalCurrentAssets / totalCurrentLiabilities
            : 0;
        const debtToEquityRatio = totalEquity > 0
            ? totalLiabilities / totalEquity
            : 0;

        return NextResponse.json({
            success: true,
            data: {
                asOfDate,
                assets: {
                    current: currentAssets,
                    nonCurrent: nonCurrentAssets,
                    totalCurrent: Math.round(totalCurrentAssets * 100) / 100,
                    totalNonCurrent: Math.round(totalNonCurrentAssets * 100) / 100,
                    total: Math.round(totalAssets * 100) / 100,
                },
                liabilities: {
                    current: currentLiabilities,
                    nonCurrent: nonCurrentLiabilities,
                    totalCurrent: Math.round(totalCurrentLiabilities * 100) / 100,
                    totalNonCurrent: Math.round(totalNonCurrentLiabilities * 100) / 100,
                    total: Math.round(totalLiabilities * 100) / 100,
                },
                equity: {
                    accounts: equity,
                    total: Math.round(totalEquity * 100) / 100,
                },
                totals: {
                    assets: Math.round(totalAssets * 100) / 100,
                    liabilitiesAndEquity: Math.round(totalLiabilitiesAndEquity * 100) / 100,
                    difference: Math.round((totalAssets - totalLiabilitiesAndEquity) * 100) / 100,
                },
                ratios: {
                    workingCapital: Math.round(workingCapital * 100) / 100,
                    currentRatio: Math.round(currentRatio * 100) / 100,
                    debtToEquityRatio: Math.round(debtToEquityRatio * 100) / 100,
                },
            },
        });
    } catch (error) {
        console.error('Error generating balance sheet:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate balance sheet' },
            { status: 500 }
        );
    }
}
