// Real Pipeline Data API
// Fetches opportunities from database with all advanced features

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DealHealthEngine } from '@/lib/dealHealthEngine';
import { PredictiveFollowUpEngine } from '@/lib/predictiveFollowUpEngine';
import { ChurnRiskEngine } from '@/lib/churnRiskEngine';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId') || 'default';
        const stage = searchParams.get('stage');

        // Build query
        const where = { tenantId };
        if (stage) {
            where.stage = stage;
        }

        // Fetch opportunities
        const opportunities = await prisma.opportunity.findMany({
            where,
            include: {
                customer: {
                    include: {
                        opportunities: true
                    }
                },
                activities: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                lostReasons: true,
                stageHistory: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Enhance with AI features
        const enhancedOpportunities = await Promise.all(
            opportunities.map(async (opp) => {
                // Calculate health
                const health = await DealHealthEngine.calculateHealthScore(opp);

                // Get AI recommendation
                const nextAction = PredictiveFollowUpEngine.predictNextAction(
                    opp,
                    opp.activities,
                    opp.customer
                );

                // Check churn risk if customer exists
                let churnRisk = null;
                if (opp.customer) {
                    churnRisk = ChurnRiskEngine.calculateChurnRisk(
                        opp.customer,
                        opp.customer.opportunities,
                        opp.activities
                    );
                }

                return {
                    ...opp,
                    healthScore: health.score,
                    healthStatus: health.status,
                    healthFactors: health.factors,
                    nextAction: nextAction.topSuggestion,
                    aiConfidence: nextAction.topSuggestion?.confidence,
                    churnRisk: churnRisk?.riskScore,
                    churnLevel: churnRisk?.level
                };
            })
        );

        // Group by stage
        const dealsByStage = {
            leads: enhancedOpportunities.filter(o => o.stage === 'lead'),
            quotes: enhancedOpportunities.filter(o => o.stage === 'quote'),
            negotiations: enhancedOpportunities.filter(o => o.stage === 'negotiation'),
            won: enhancedOpportunities.filter(o => o.stage === 'won'),
            lost: enhancedOpportunities.filter(o => o.stage === 'lost')
        };

        // Calculate metrics
        const metrics = {
            totalValue: enhancedOpportunities.reduce((sum, o) => sum + (o.value || 0), 0),
            totalDeals: enhancedOpportunities.length,
            wonDeals: dealsByStage.won.length,
            winRate: enhancedOpportunities.length > 0
                ? ((dealsByStage.won.length / enhancedOpportunities.length) * 100).toFixed(1)
                : 0,
            avgDealSize: enhancedOpportunities.length > 0
                ? (enhancedOpportunities.reduce((sum, o) => sum + (o.value || 0), 0) / enhancedOpportunities.length).toFixed(0)
                : 0,
            avgHealthScore: enhancedOpportunities.length > 0
                ? (enhancedOpportunities.reduce((sum, o) => sum + (o.healthScore || 0), 0) / enhancedOpportunities.length).toFixed(0)
                : 0,
            atRiskDeals: enhancedOpportunities.filter(o => o.healthScore < 40).length
        };

        return NextResponse.json({
            success: true,
            data: {
                deals: dealsByStage,
                allDeals: enhancedOpportunities,
                metrics
            }
        });

    } catch (error) {
        console.error('Error fetching pipeline data:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

// POST - Create new opportunity
export async function POST(request) {
    try {
        const body = await request.json();
        const { tenantId, customerId, ...opportunityData } = body;

        const opportunity = await prisma.opportunity.create({
            data: {
                ...opportunityData,
                tenantId,
                customerId,
                stage: 'lead',
                createdAt: new Date()
            },
            include: {
                customer: true
            }
        });

        // Calculate initial health score
        const health = await DealHealthEngine.calculateHealthScore(opportunity);

        // Update with health score
        const updated = await prisma.opportunity.update({
            where: { id: opportunity.id },
            data: { healthScore: health.score }
        });

        return NextResponse.json({
            success: true,
            data: updated
        });

    } catch (error) {
        console.error('Error creating opportunity:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

