import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DealVelocityEngine } from '@/lib/dealVelocityEngine';

// GET - Velocity analytics
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');
        const opportunityId = searchParams.get('opportunityId');

        if (!tenantId) {
            return NextResponse.json({
                success: false,
                error: 'tenantId is required'
            }, { status: 400 });
        }

        // Single deal analysis
        if (opportunityId) {
            const opportunity = await prisma.opportunity.findUnique({
                where: { id: opportunityId },
                include: {
                    stageHistory: {
                        orderBy: { changedAt: 'desc' }
                    }
                }
            });

            if (!opportunity) {
                return NextResponse.json({
                    success: false,
                    error: 'Opportunity not found'
                }, { status: 404 });
            }

            const velocity = DealVelocityEngine.calculateDealVelocity(
                opportunity,
                opportunity.stageHistory
            );

            return NextResponse.json({
                success: true,
                data: {
                    opportunityId,
                    title: opportunity.title,
                    velocity
                }
            });
        }

        // Batch analysis for all deals
        const opportunities = await prisma.opportunity.findMany({
            where: {
                tenantId,
                isArchived: false,
                stage: { notIn: ['won', 'lost'] }
            },
            include: {
                stageHistory: {
                    orderBy: { changedAt: 'desc' }
                }
            }
        });

        const stageHistoryMap = {};
        opportunities.forEach(opp => {
            stageHistoryMap[opp.id] = opp.stageHistory;
        });

        const results = DealVelocityEngine.batchAnalyzeVelocity(opportunities, stageHistoryMap);
        const aggregateMetrics = DealVelocityEngine.calculateAggregateMetrics(results);

        // Identify slow deals
        const slowDeals = results.filter(r => r.velocity.velocity < 40);

        return NextResponse.json({
            success: true,
            data: {
                summary: aggregateMetrics,
                deals: results,
                slowDeals,
                recommendations: generateRecommendations(aggregateMetrics, slowDeals)
            }
        });

    } catch (error) {
        console.error('Error in velocity analysis:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

function generateRecommendations(metrics, slowDeals) {
    const recommendations = [];

    if (metrics.avgVelocityScore < 60) {
        recommendations.push({
            priority: 'high',
            icon: '⚡',
            title: 'تسريع البايب لاين',
            description: `متوسط السرعة ${metrics.avgVelocityScore}/100. ركز على تسريع الصفقات.`
        });
    }

    if (slowDeals.length > 5) {
        recommendations.push({
            priority: 'high',
            icon: '🐌',
            title: 'صفقات بطيئة',
            description: `${slowDeals.length} صفقة بطيئة. راجعها وحدد العوائق.`
        });
    }

    if (metrics.commonBottlenecks.length > 0) {
        const topBottleneck = metrics.commonBottlenecks[0];
        recommendations.push({
            priority: 'medium',
            icon: '🚧',
            title: `اختناق في ${DealVelocityEngine.getStageLabel(topBottleneck.stage)}`,
            description: `${topBottleneck.percentage}% من الصفقات تتباطأ في هذه المرحلة.`
        });
    }

    return recommendations;
}

