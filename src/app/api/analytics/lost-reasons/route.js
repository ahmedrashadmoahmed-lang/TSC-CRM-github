import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Analytics for lost reasons
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');
        const days = parseInt(searchParams.get('days') || '90');

        if (!tenantId) {
            return NextResponse.json({
                success: false,
                error: 'tenantId is required'
            }, { status: 400 });
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get all lost reasons in period
        const lostReasons = await prisma.lostReason.findMany({
            where: {
                tenantId,
                createdAt: {
                    gte: startDate
                }
            },
            include: {
                opportunity: {
                    select: {
                        value: true,
                        title: true
                    }
                }
            }
        });

        // Analyze by category
        const byCategory = {};
        const byCompetitor = {};
        let totalValue = 0;
        let totalCount = lostReasons.length;

        lostReasons.forEach(reason => {
            // Category analysis
            if (!byCategory[reason.category]) {
                byCategory[reason.category] = {
                    count: 0,
                    totalValue: 0,
                    percentage: 0
                };
            }
            byCategory[reason.category].count++;
            byCategory[reason.category].totalValue += reason.opportunity.value;
            totalValue += reason.opportunity.value;

            // Competitor analysis
            if (reason.competitorName) {
                if (!byCompetitor[reason.competitorName]) {
                    byCompetitor[reason.competitorName] = {
                        count: 0,
                        totalValue: 0,
                        avgPrice: 0,
                        prices: []
                    };
                }
                byCompetitor[reason.competitorName].count++;
                byCompetitor[reason.competitorName].totalValue += reason.opportunity.value;

                if (reason.competitorPrice) {
                    byCompetitor[reason.competitorName].prices.push(reason.competitorPrice);
                }
            }
        });

        // Calculate percentages
        Object.keys(byCategory).forEach(category => {
            byCategory[category].percentage = totalCount > 0
                ? Math.round((byCategory[category].count / totalCount) * 100)
                : 0;
        });

        // Calculate average competitor prices
        Object.keys(byCompetitor).forEach(competitor => {
            const prices = byCompetitor[competitor].prices;
            if (prices.length > 0) {
                byCompetitor[competitor].avgPrice =
                    prices.reduce((a, b) => a + b, 0) / prices.length;
            }
            delete byCompetitor[competitor].prices; // Remove raw prices from response
        });

        // Top reasons
        const topReasons = Object.entries(byCategory)
            .map(([category, data]) => ({
                category,
                ...data
            }))
            .sort((a, b) => b.count - a.count);

        // Top competitors
        const topCompetitors = Object.entries(byCompetitor)
            .map(([name, data]) => ({
                name,
                ...data
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // Recommendations
        const recommendations = generateRecommendations(topReasons, topCompetitors);

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    totalLost: totalCount,
                    totalValue,
                    avgDealValue: totalCount > 0 ? totalValue / totalCount : 0,
                    period: {
                        days,
                        startDate: startDate.toISOString(),
                        endDate: new Date().toISOString()
                    }
                },
                byCategory: topReasons,
                byCompetitor: topCompetitors,
                recommendations
            }
        });

    } catch (error) {
        console.error('Error analyzing lost reasons:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

function generateRecommendations(topReasons, topCompetitors) {
    const recommendations = [];

    // Analyze top reason
    if (topReasons.length > 0) {
        const topReason = topReasons[0];

        if (topReason.category === 'Price' && topReason.percentage > 30) {
            recommendations.push({
                priority: 'high',
                icon: '💰',
                title: 'مراجعة استراتيجية التسعير',
                description: `${topReason.percentage}% من الصفقات المفقودة بسبب السعر. راجع نموذج التسعير الخاص بك.`,
                action: 'Review pricing strategy'
            });
        }

        if (topReason.category === 'Competitor' && topReason.percentage > 25) {
            recommendations.push({
                priority: 'high',
                icon: '🎯',
                title: 'تحليل المنافسين',
                description: `${topReason.percentage}% من الصفقات خسرت للمنافسين. قم بتحليل عروضهم.`,
                action: 'Competitive analysis'
            });
        }

        if (topReason.category === 'Timing' && topReason.percentage > 20) {
            recommendations.push({
                priority: 'medium',
                icon: '⏰',
                title: 'تحسين التوقيت',
                description: `${topReason.percentage}% من الصفقات فقدت بسبب التوقيت. راجع دورة المبيعات.`,
                action: 'Optimize timing'
            });
        }
    }

    // Analyze top competitor
    if (topCompetitors.length > 0) {
        const topCompetitor = topCompetitors[0];
        recommendations.push({
            priority: 'high',
            icon: '🏆',
            title: `التركيز على ${topCompetitor.name}`,
            description: `أكبر منافس (${topCompetitor.count} صفقات مفقودة). قم بإنشاء استراتيجية مضادة.`,
            action: 'Create counter-strategy'
        });
    }

    // General recommendation
    if (recommendations.length === 0) {
        recommendations.push({
            priority: 'low',
            icon: '📊',
            title: 'استمر في المراقبة',
            description: 'لا توجد أنماط واضحة حتى الآن. استمر في تتبع الأسباب.',
            action: 'Continue monitoring'
        });
    }

    return recommendations;
}

