import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');
        const days = parseInt(searchParams.get('days') || '30');

        if (!tenantId) {
            return NextResponse.json({
                success: false,
                error: 'tenantId is required'
            }, { status: 400 });
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get opportunities in period
        const opportunities = await prisma.opportunity.findMany({
            where: {
                tenantId,
                createdAt: { gte: startDate }
            },
            include: {
                stageHistory: {
                    orderBy: { changedAt: 'desc' }
                }
            }
        });

        // Calculate metrics
        const metrics = {
            avgVelocity: calculateAvgVelocity(opportunities),
            dealsEntering: opportunities.length,
            dealsClosing: opportunities.filter(o => o.stage === 'won').length,
            revenueVelocity: opportunities.filter(o => o.stage === 'won').reduce((sum, o) => sum + o.value, 0)
        };

        // Stage metrics
        const stageMetrics = calculateStageMetrics(opportunities);

        // Trends (mock for now)
        const trends = {
            velocity: 5,
            entering: 10,
            closing: 8,
            revenue: 12
        };

        // Recommendations
        const recommendations = generateRecommendations(metrics, stageMetrics);

        return NextResponse.json({
            success: true,
            data: {
                metrics,
                stageMetrics,
                trends,
                recommendations
            }
        });

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

function calculateAvgVelocity(opportunities) {
    if (opportunities.length === 0) return 0;
    const velocities = opportunities.map(o => {
        const days = Math.ceil((new Date() - new Date(o.createdAt)) / (1000 * 60 * 60 * 24));
        return days <= 30 ? 100 : days <= 60 ? 70 : 40;
    });
    return Math.round(velocities.reduce((a, b) => a + b, 0) / velocities.length);
}

function calculateStageMetrics(opportunities) {
    const stages = ['lead', 'qualified', 'proposal', 'negotiation'];
    return stages.map(stage => {
        const stageOpps = opportunities.filter(o => o.stage === stage);
        return {
            stage,
            count: stageOpps.length,
            avgDays: stageOpps.length > 0 ? Math.round(stageOpps.reduce((sum, o) => {
                return sum + Math.ceil((new Date() - new Date(o.createdAt)) / (1000 * 60 * 60 * 24));
            }, 0) / stageOpps.length) : 0,
            conversionRate: 75,
            velocityScore: 80
        };
    });
}

function generateRecommendations(metrics, stageMetrics) {
    const recs = [];
    if (metrics.avgVelocity < 60) {
        recs.push({
            priority: 'high',
            icon: '⚡',
            title: 'Improve Pipeline Velocity',
            description: `Average velocity is ${metrics.avgVelocity}. Focus on accelerating deals.`
        });
    }
    return recs;
}

