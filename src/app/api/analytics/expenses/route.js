import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const expenses = await prisma.expense.findMany({
            orderBy: { date: 'asc' }
        });

        // Group by category
        const categoryAnalysis = {};
        expenses.forEach(expense => {
            if (!categoryAnalysis[expense.category]) {
                categoryAnalysis[expense.category] = {
                    category: expense.category,
                    total: 0,
                    count: 0,
                    transactions: []
                };
            }
            categoryAnalysis[expense.category].total += expense.amount;
            categoryAnalysis[expense.category].count += 1;
            categoryAnalysis[expense.category].transactions.push({
                date: expense.date,
                amount: expense.amount,
                description: expense.description
            });
        });

        // Calculate percentages and averages
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const categories = Object.values(categoryAnalysis).map(cat => ({
            category: cat.category,
            total: Math.round(cat.total),
            count: cat.count,
            percentage: Math.round((cat.total / totalExpenses) * 100),
            average: Math.round(cat.total / cat.count),
            topExpenses: cat.transactions
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 3)
        })).sort((a, b) => b.total - a.total);

        // Monthly trends
        const monthlyExpenses = {};
        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyExpenses[monthKey]) {
                monthlyExpenses[monthKey] = {
                    month: monthKey,
                    total: 0,
                    count: 0
                };
            }

            monthlyExpenses[monthKey].total += expense.amount;
            monthlyExpenses[monthKey].count += 1;
        });

        const monthlyTrend = Object.values(monthlyExpenses).sort((a, b) =>
            a.month.localeCompare(b.month)
        );

        // Anomaly detection (expenses > 2x average)
        const avgExpense = totalExpenses / expenses.length;
        const anomalies = expenses
            .filter(e => e.amount > avgExpense * 2)
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 10);

        // Recommendations
        const recommendations = generateRecommendations(categories, monthlyTrend);

        return NextResponse.json({
            categories,
            monthlyTrend,
            anomalies,
            recommendations,
            summary: {
                totalExpenses: Math.round(totalExpenses),
                totalTransactions: expenses.length,
                avgTransaction: Math.round(avgExpense),
                topCategory: categories[0]?.category || 'N/A',
                monthlyAverage: Math.round(totalExpenses / monthlyTrend.length)
            }
        });

    } catch (error) {
        console.error('Expense analysis error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze expenses' },
            { status: 500 }
        );
    }
}

function generateRecommendations(categories, monthlyTrend) {
    const recommendations = [];

    // High expense categories
    const topCategories = categories.slice(0, 3);
    if (topCategories.length > 0) {
        recommendations.push({
            type: 'cost-reduction',
            priority: 'high',
            title: 'تحسين أكبر فئات المصروفات',
            description: `أكبر 3 فئات تمثل ${topCategories.reduce((sum, c) => sum + c.percentage, 0)}% من المصروفات`,
            categories: topCategories.map(c => c.category)
        });
    }

    // Trend analysis
    if (monthlyTrend.length >= 3) {
        const recent = monthlyTrend.slice(-3);
        const trend = recent[2].total > recent[0].total * 1.2;

        if (trend) {
            recommendations.push({
                type: 'trend-alert',
                priority: 'medium',
                title: 'ارتفاع المصروفات الشهرية',
                description: 'المصروفات في ارتفاع مستمر خلال الأشهر الأخيرة'
            });
        }
    }

    return recommendations;
}
