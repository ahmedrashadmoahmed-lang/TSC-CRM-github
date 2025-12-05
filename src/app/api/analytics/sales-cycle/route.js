import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get all opportunities with their stage transitions
        const opportunities = await prisma.opportunity.findMany({
            where: {
                createdAt: {
                    gte: startDate
                }
            },
            include: {
                stageHistory: {
                    orderBy: {
                        changedAt: 'asc'
                    }
                }
            }
        });

        // If no data, return empty but valid response
        if (!opportunities || opportunities.length === 0) {
            return NextResponse.json({
                success: true,
                data: {
                    stages: [],
                    averageCycleTime: 0,
                    bottlenecks: [],
                    trends: { direction: 'neutral', percentage: 0 },
                    recommendations: [{
                        icon: '📊',
                        text: 'لا توجد بيانات كافية لتحليل دورة المبيعات. ابدأ بإضافة فرص جديدة.'
                    }],
                    period: {
                        days,
                        startDate: startDate.toISOString(),
                        endDate: new Date().toISOString()
                    }
                }
            });
        }

        // Calculate stage durations
        const stageDurations = {};
        const stageConversions = {};
        const stageCounts = {};

        opportunities.forEach(opportunity => {
            if (!opportunity.stageHistory || opportunity.stageHistory.length === 0) return;

            for (let i = 0; i < opportunity.stageHistory.length; i++) {
                const current = opportunity.stageHistory[i];
                const next = opportunity.stageHistory[i + 1];

                const stage = current.stage;

                if (!stageDurations[stage]) {
                    stageDurations[stage] = [];
                    stageCounts[stage] = 0;
                    stageConversions[stage] = { converted: 0, total: 0 };
                }

                stageCounts[stage]++;
                stageConversions[stage].total++;

                if (next) {
                    const duration = (new Date(next.changedAt) - new Date(current.changedAt)) / (1000 * 60 * 60 * 24);
                    stageDurations[stage].push(duration);
                    stageConversions[stage].converted++;
                }
            }
        });

        // Calculate averages and identify bottlenecks
        const stages = Object.keys(stageDurations).map(stage => {
            const durations = stageDurations[stage];
            const avgDays = durations.length > 0
                ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
                : 0;

            const conversionRate = stageConversions[stage].total > 0
                ? Math.round((stageConversions[stage].converted / stageConversions[stage].total) * 100)
                : 0;

            return {
                name: stage,
                avgDays,
                dealCount: stageCounts[stage],
                conversionRate,
                isBottleneck: avgDays > 7 // Consider bottleneck if > 7 days
            };
        });

        // Sort stages by typical sales pipeline order
        const stageOrder = ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
        stages.sort((a, b) => {
            const indexA = stageOrder.indexOf(a.name.toLowerCase());
            const indexB = stageOrder.indexOf(b.name.toLowerCase());
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });

        // Calculate total average cycle time
        const averageCycleTime = stages.length > 0
            ? Math.round(stages.reduce((sum, stage) => sum + stage.avgDays, 0))
            : 0;

        // Identify bottlenecks
        const bottlenecks = stages
            .filter(stage => stage.isBottleneck)
            .map(stage => ({
                stage: stage.name,
                severity: stage.avgDays > 14 ? 'high' : stage.avgDays > 7 ? 'medium' : 'low',
                reason: `متوسط ${stage.avgDays} يوم في هذه المرحلة - أعلى من المتوسط المتوقع`,
                avgDays: stage.avgDays
            }));

        // Calculate trends (compare with previous period)
        const previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - days);

        const previousOpportunities = await prisma.opportunity.findMany({
            where: {
                createdAt: {
                    gte: previousStartDate,
                    lt: startDate
                }
            },
            include: {
                stageHistory: true
            }
        });

        const previousCycleTime = calculateAverageCycleTime(previousOpportunities);
        const trendPercentage = previousCycleTime > 0
            ? Math.round(((averageCycleTime - previousCycleTime) / previousCycleTime) * 100)
            : 0;

        const trends = {
            direction: trendPercentage > 0 ? 'up' : trendPercentage < 0 ? 'down' : 'neutral',
            percentage: Math.abs(trendPercentage)
        };

        // Generate recommendations
        const recommendations = generateRecommendations(stages, bottlenecks, trends);

        return NextResponse.json({
            success: true,
            data: {
                stages,
                averageCycleTime,
                bottlenecks,
                trends,
                recommendations,
                period: {
                    days,
                    startDate: startDate.toISOString(),
                    endDate: new Date().toISOString()
                }
            }
        });

    } catch (error) {
        console.error('Error fetching sales cycle data:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

function calculateAverageCycleTime(deals) {
    if (!deals || deals.length === 0) return 0;

    let totalDays = 0;
    let count = 0;

    deals.forEach(deal => {
        if (!deal.stageHistory || deal.stageHistory.length < 2) return;

        const first = deal.stageHistory[0];
        const last = deal.stageHistory[deal.stageHistory.length - 1];

        const duration = (new Date(last.changedAt) - new Date(first.changedAt)) / (1000 * 60 * 60 * 24);
        totalDays += duration;
        count++;
    });

    return count > 0 ? Math.round(totalDays / count) : 0;
}

function generateRecommendations(stages, bottlenecks, trends) {
    const recommendations = [];

    // Recommendation based on bottlenecks
    if (bottlenecks.length > 0) {
        const highSeverity = bottlenecks.filter(b => b.severity === 'high');
        if (highSeverity.length > 0) {
            recommendations.push({
                icon: '🔴',
                text: `ركز على تحسين مرحلة "${highSeverity[0].stage}" - تستغرق ${highSeverity[0].avgDays} يوم في المتوسط`
            });
        }
    }

    // Recommendation based on trends
    if (trends.direction === 'up' && trends.percentage > 10) {
        recommendations.push({
            icon: '⚠️',
            text: `دورة المبيعات تزداد بنسبة ${trends.percentage}% - راجع العمليات الحالية`
        });
    } else if (trends.direction === 'down' && trends.percentage > 10) {
        recommendations.push({
            icon: '✅',
            text: `أداء ممتاز! دورة المبيعات تحسنت بنسبة ${trends.percentage}%`
        });
    }

    // Recommendation based on conversion rates
    const lowConversion = stages.filter(s => s.conversionRate < 50 && s.dealCount > 5);
    if (lowConversion.length > 0) {
        recommendations.push({
            icon: '📊',
            text: `معدل التحويل منخفض في مرحلة "${lowConversion[0].name}" (${lowConversion[0].conversionRate}%) - راجع معايير التأهيل`
        });
    }

    // General recommendations
    if (recommendations.length === 0) {
        recommendations.push({
            icon: '💡',
            text: 'استمر في مراقبة دورة المبيعات وتحديد الأنماط للتحسين المستمر'
        });
    }

    return recommendations;
}

