import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET Financial Ratios and KPIs
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const asOfDate = searchParams.get('asOfDate') || new Date().toISOString();

        // Get balance sheet data
        const balanceSheetRes = await fetch(`${request.url.split('/api')[0]}/api/accounting/reports/balance-sheet?asOfDate=${asOfDate}`);
        const balanceSheet = await balanceSheetRes.json();

        // Get income statement data (last 12 months)
        const oneYearAgo = new Date(asOfDate);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const incomeRes = await fetch(`${request.url.split('/api')[0]}/api/accounting/reports/income-statement?startDate=${oneYearAgo.toISOString()}&endDate=${asOfDate}`);
        const income = await incomeRes.json();

        if (!balanceSheet.success || !income.success) {
            throw new Error('Failed to fetch financial data');
        }

        const bs = balanceSheet.data;
        const is = income.data.summary;

        // Calculate ratios
        const ratios = {
            // Liquidity Ratios
            liquidity: {
                currentRatio: bs.assets.totalCurrent > 0 && bs.liabilities.totalCurrent > 0
                    ? Math.round((bs.assets.totalCurrent / bs.liabilities.totalCurrent) * 100) / 100
                    : 0,
                quickRatio: bs.liabilities.totalCurrent > 0
                    ? Math.round(((bs.assets.totalCurrent - (bs.assets.current.find(a => a.code.startsWith('113'))?.balance || 0)) / bs.liabilities.totalCurrent) * 100) / 100
                    : 0,
                workingCapital: Math.round((bs.assets.totalCurrent - bs.liabilities.totalCurrent) * 100) / 100,
            },

            // Profitability Ratios
            profitability: {
                grossProfitMargin: is.grossProfitMargin || 0,
                operatingMargin: is.operatingMargin || 0,
                netProfitMargin: is.netProfitMargin || 0,
                returnOnAssets: bs.totals.assets > 0
                    ? Math.round((is.netIncome / bs.totals.assets) * 10000) / 100
                    : 0,
                returnOnEquity: bs.equity.total > 0
                    ? Math.round((is.netIncome / bs.equity.total) * 10000) / 100
                    : 0,
            },

            // Leverage Ratios
            leverage: {
                debtToAssets: bs.totals.assets > 0
                    ? Math.round((bs.liabilities.total / bs.totals.assets) * 10000) / 100
                    : 0,
                debtToEquity: bs.equity.total > 0
                    ? Math.round((bs.liabilities.total / bs.equity.total) * 100) / 100
                    : 0,
                equityRatio: bs.totals.assets > 0
                    ? Math.round((bs.equity.total / bs.totals.assets) * 10000) / 100
                    : 0,
            },

            // Efficiency Ratios
            efficiency: {
                assetTurnover: bs.totals.assets > 0
                    ? Math.round((is.totalRevenue / bs.totals.assets) * 100) / 100
                    : 0,
            },
        };

        // Calculate health score (0-100)
        const healthScore = Math.round((
            (ratios.liquidity.currentRatio >= 2 ? 20 : ratios.liquidity.currentRatio * 10) +
            (ratios.profitability.netProfitMargin >= 10 ? 20 : ratios.profitability.netProfitMargin * 2) +
            (ratios.profitability.returnOnEquity >= 15 ? 20 : ratios.profitability.returnOnEquity * 1.33) +
            (ratios.leverage.debtToEquity <= 1 ? 20 : Math.max(0, 20 - (ratios.leverage.debtToEquity - 1) * 10)) +
            (ratios.efficiency.assetTurnover >= 1 ? 20 : ratios.efficiency.assetTurnover * 20)
        ));

        return NextResponse.json({
            success: true,
            data: {
                asOfDate,
                ratios,
                healthScore: Math.min(100, Math.max(0, healthScore)),
                interpretation: {
                    liquidity: ratios.liquidity.currentRatio >= 2 ? 'Excellent' : ratios.liquidity.currentRatio >= 1 ? 'Good' : 'Needs Improvement',
                    profitability: ratios.profitability.netProfitMargin >= 10 ? 'Excellent' : ratios.profitability.netProfitMargin >= 5 ? 'Good' : 'Needs Improvement',
                    leverage: ratios.leverage.debtToEquity <= 1 ? 'Healthy' : ratios.leverage.debtToEquity <= 2 ? 'Moderate' : 'High Risk',
                    overall: healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Fair' : 'Poor',
                },
            },
        });
    } catch (error) {
        console.error('Error calculating financial ratios:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to calculate financial ratios' },
            { status: 500 }
        );
    }
}
