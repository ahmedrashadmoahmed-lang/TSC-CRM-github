import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
    GamificationEngine,
    TerritoryManagementEngine,
    CompetitorIntelligenceEngine,
    DealRoomsEngine
} from '@/lib/advancedFeaturesEngines';

// POST - Advanced features actions
export async function POST(request) {
    try {
        const body = await request.json();
        const { action, data } = body;

        let result;

        switch (action) {
            case 'award_points':
                const points = GamificationEngine.calculatePoints(data.action, data.context);
                // Would save to database
                result = { points, action: data.action };
                break;

            case 'assign_territory':
                result = TerritoryManagementEngine.assignTerritory(data.rep, data.territory, data.rules);
                break;

            case 'create_deal_room':
                result = DealRoomsEngine.createDealRoom(data.opportunity, data.config);
                // Would save to database
                break;

            case 'add_stakeholder':
                result = DealRoomsEngine.addStakeholder(data.dealRoom, data.stakeholder);
                break;

            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action'
                }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error in advanced features API:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

// GET - Advanced features data
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const tenantId = searchParams.get('tenantId');

        if (!tenantId) {
            return NextResponse.json({
                success: false,
                error: 'tenantId is required'
            }, { status: 400 });
        }

        let result;

        switch (action) {
            case 'leaderboard':
                // Mock data - would fetch from database
                const users = [
                    { id: '1', name: 'User 1', points: 1500, deals: 25, revenue: 500000 },
                    { id: '2', name: 'User 2', points: 1200, deals: 20, revenue: 400000 }
                ];
                result = GamificationEngine.generateLeaderboard(users);
                break;

            case 'territory_balance':
                const opportunities = await prisma.opportunity.findMany({
                    where: { tenantId }
                });
                // Mock territories
                const territories = [
                    { id: 't1', name: 'North', capacity: 100 },
                    { id: 't2', name: 'South', capacity: 100 }
                ];
                result = TerritoryManagementEngine.balanceTerritories(territories, opportunities);
                break;

            case 'competitor_analysis':
                const lostReasons = await prisma.lostReason.findMany({
                    where: { tenantId },
                    include: { opportunity: true }
                });

                const competitors = [...new Set(lostReasons.map(r => r.competitorName).filter(Boolean))];
                result = competitors.map(comp =>
                    CompetitorIntelligenceEngine.analyzeCompetitor(comp, lostReasons)
                ).filter(Boolean);
                break;

            case 'deal_rooms':
                // Would fetch from database
                result = [];
                break;

            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action'
                }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error fetching advanced features data:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

