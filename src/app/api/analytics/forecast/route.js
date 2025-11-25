import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Get all invoices with dates
        const invoices = await prisma.invoice.findMany({
            orderBy: { issueDate: 'asc' }
        });

        // Group by month
        const monthlyData = {};
        invoices.forEach(invoice => {
            const date = new Date(invoice.issueDate);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    month: monthKey,
                    sales: 0,
                    collected: 0,
                    count: 0
                };
            }

            monthlyData[monthKey].sales += invoice.finalValue;
            monthlyData[monthKey].collected += invoice.collected;
            monthlyData[monthKey].count += 1;
        });

        // Convert to array and sort
        const historicalData = Object.values(monthlyData).sort((a, b) =>
            a.month.localeCompare(b.month)
        );

        // Simple linear regression for forecasting
        const forecast = generateForecast(historicalData, 3); // 3 months ahead

        // Calculate trends
        const trends = calculateTrends(historicalData);

        return NextResponse.json({
            historical: historicalData,
            forecast,
            trends,
            summary: {
                totalMonths: historicalData.length,
                averageMonthlySales: historicalData.reduce((sum, m) => sum + m.sales, 0) / historicalData.length,
                growthRate: trends.growthRate,
                prediction: forecast[0]?.sales || 0
            }
        });

    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json(
            { error: 'Failed to generate analytics' },
            { status: 500 }
        );
    }
}

function generateForecast(data, months) {
    if (data.length < 2) return [];

    // Simple linear regression
    const n = data.length;
    const x = data.map((_, i) => i);
    const y = data.map(d => d.sales);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate forecast
    const forecast = [];
    const lastMonth = new Date(data[data.length - 1].month + '-01');

    for (let i = 1; i <= months; i++) {
        const forecastMonth = new Date(lastMonth);
        forecastMonth.setMonth(forecastMonth.getMonth() + i);
        const monthKey = `${forecastMonth.getFullYear()}-${String(forecastMonth.getMonth() + 1).padStart(2, '0')}`;

        const predictedSales = Math.max(0, slope * (n + i - 1) + intercept);

        forecast.push({
            month: monthKey,
            sales: Math.round(predictedSales),
            confidence: Math.max(0.5, 1 - (i * 0.15)), // Confidence decreases with distance
            type: 'forecast'
        });
    }

    return forecast;
}

function calculateTrends(data) {
    if (data.length < 2) {
        return {
            growthRate: 0,
            trend: 'stable',
            momentum: 0
        };
    }

    // Calculate month-over-month growth
    const recentMonths = data.slice(-3);
    const growthRates = [];

    for (let i = 1; i < recentMonths.length; i++) {
        const growth = ((recentMonths[i].sales - recentMonths[i - 1].sales) / recentMonths[i - 1].sales) * 100;
        growthRates.push(growth);
    }

    const avgGrowth = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;

    return {
        growthRate: Math.round(avgGrowth * 100) / 100,
        trend: avgGrowth > 5 ? 'growing' : avgGrowth < -5 ? 'declining' : 'stable',
        momentum: avgGrowth > 0 ? 'positive' : avgGrowth < 0 ? 'negative' : 'neutral',
        recentGrowth: growthRates
    };
}
