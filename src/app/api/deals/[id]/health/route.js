import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DealHealthEngine } from '@/lib/dealHealthEngine';

// GET - Get health score for a specific deal
export async function GET(request, { params }) {
    try {
        const { id } = params;

        // Get opportunity
        const opportunity = await prisma.opportunity.findUnique({
            where: { id },
            include: {
                stageHistory: {
                    orderBy: { changedAt: 'desc' },
                    take: 10
                }
            }
        });

        if (!opportunity) {
            return NextResponse.json({
                success: false,
                error: 'Opportunity not found'
            }, { status: 404 });
        }

        // Get interactions (activities related to this deal)
        const interactions = await prisma.activity.findMany({
            where: {
                entityType: 'opportunity',
                entityId: id
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 50
        });

        // Calculate health
        const health = DealHealthEngine.calculateHealthScore(opportunity, interactions);

        // Update health score in database
        await prisma.opportunity.update({
            where: { id },
            data: {
                healthScore: health.totalScore,
                velocityScore: health.breakdown.velocity
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                opportunityId: id,
                title: opportunity.title,
                value: opportunity.value,
                stage: opportunity.stage,
                health
            }
        });

    } catch (error) {
        console.error('Error calculating deal health:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

// POST - Batch calculate health for multiple deals
export async function POST(request) {
    try {
        const body = await request.json();
        const { tenantId, opportunityIds } = body;

        if (!tenantId) {
            return NextResponse.json({
                success: false,
                error: 'tenantId is required'
            }, { status: 400 });
        }

        // Get opportunities
        const where = opportunityIds
            ? { id: { in: opportunityIds }, tenantId }
            : { tenantId, isArchived: false };

        const opportunities = await prisma.opportunity.findMany({
            where,
            include: {
                stageHistory: {
                    orderBy: { changedAt: 'desc' },
                    take: 5
                }
            }
        });

        // Get all interactions
        const allInteractions = await prisma.activity.findMany({
            where: {
                entityType: 'opportunity',
                entityId: { in: opportunities.map(o => o.id) },
                tenantId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Group interactions by opportunity
        const interactionsMap = {};
        allInteractions.forEach(interaction => {
            if (!interactionsMap[interaction.entityId]) {
                interactionsMap[interaction.entityId] = [];
            }
            interactionsMap[interaction.entityId].push(interaction);
        });

        // Batch calculate
        const results = DealHealthEngine.batchCalculateHealth(opportunities, interactionsMap);

        // Update all health scores
        await Promise.all(
            results.map(result =>
                prisma.opportunity.update({
                    where: { id: result.opportunityId },
                    data: {
                        healthScore: result.health.totalScore,
                        velocityScore: result.health.breakdown.velocity
                    }
                })
            )
        );

        return NextResponse.json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error('Error in batch health calculation:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
