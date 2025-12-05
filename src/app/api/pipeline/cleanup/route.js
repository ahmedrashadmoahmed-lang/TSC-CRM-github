import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PipelineHygieneEngine } from '@/lib/pipelineHygieneEngine';

// POST - Run pipeline cleanup
export async function POST(request) {
    try {
        const body = await request.json();
        const { tenantId, action, opportunityIds, reason } = body;

        if (!tenantId) {
            return NextResponse.json({
                success: false,
                error: 'tenantId is required'
            }, { status: 400 });
        }

        let result;

        switch (action) {
            case 'analyze':
                result = await analyzePipeline(tenantId);
                break;

            case 'archive':
                result = await archiveOpportunities(opportunityIds, reason, tenantId);
                break;

            case 'auto_archive':
                result = await autoArchivePipeline(tenantId);
                break;

            case 'reactivate':
                result = await reactivateOpportunities(opportunityIds, tenantId);
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
        console.error('Error in pipeline cleanup:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

// GET - Get pipeline hygiene status
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');

        if (!tenantId) {
            return NextResponse.json({
                success: false,
                error: 'tenantId is required'
            }, { status: 400 });
        }

        const analysis = await analyzePipeline(tenantId);

        return NextResponse.json({
            success: true,
            data: analysis
        });

    } catch (error) {
        console.error('Error getting hygiene status:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

// Helper: Analyze pipeline
async function analyzePipeline(tenantId) {
    // Get all active opportunities
    const opportunities = await prisma.opportunity.findMany({
        where: {
            tenantId,
            isArchived: false
        },
        select: {
            id: true,
            title: true,
            value: true,
            stage: true,
            lastActivityDate: true,
            createdAt: true,
            isArchived: true
        }
    });

    // Analyze with hygiene engine
    const analysis = PipelineHygieneEngine.analyzeOpportunities(opportunities);
    const report = PipelineHygieneEngine.generateReport(analysis);

    return {
        ...analysis,
        report
    };
}

// Helper: Archive opportunities
async function archiveOpportunities(opportunityIds, reason, tenantId) {
    if (!opportunityIds || opportunityIds.length === 0) {
        throw new Error('No opportunities specified');
    }

    const archived = await prisma.opportunity.updateMany({
        where: {
            id: { in: opportunityIds },
            tenantId
        },
        data: {
            isArchived: true,
            archivedAt: new Date(),
            archivedReason: reason || 'Manually archived'
        }
    });

    return {
        count: archived.count,
        opportunityIds
    };
}

// Helper: Auto-archive pipeline
async function autoArchivePipeline(tenantId) {
    // Get all opportunities
    const opportunities = await prisma.opportunity.findMany({
        where: {
            tenantId,
            isArchived: false,
            stage: {
                notIn: ['won', 'lost']
            }
        },
        select: {
            id: true,
            title: true,
            lastActivityDate: true,
            createdAt: true
        }
    });

    // Find opportunities to archive
    const toArchive = PipelineHygieneEngine.autoArchive(opportunities);

    if (toArchive.count === 0) {
        return {
            count: 0,
            message: 'No opportunities need archiving'
        };
    }

    // Archive them
    const archived = await prisma.opportunity.updateMany({
        where: {
            id: { in: toArchive.opportunities.map(o => o.id) },
            tenantId
        },
        data: {
            isArchived: true,
            archivedAt: new Date(),
            archivedReason: 'Auto-archived due to inactivity'
        }
    });

    return {
        count: archived.count,
        opportunities: toArchive.opportunities
    };
}

// Helper: Reactivate opportunities
async function reactivateOpportunities(opportunityIds, tenantId) {
    if (!opportunityIds || opportunityIds.length === 0) {
        throw new Error('No opportunities specified');
    }

    const reactivated = await prisma.opportunity.updateMany({
        where: {
            id: { in: opportunityIds },
            tenantId
        },
        data: {
            isArchived: false,
            archivedAt: null,
            archivedReason: null,
            lastActivityDate: new Date() // Update activity date
        }
    });

    return {
        count: reactivated.count,
        opportunityIds
    };
}

