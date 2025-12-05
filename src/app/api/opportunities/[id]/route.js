import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/opportunities/[id] - Fetch single opportunity
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = params;

        const opportunity = await prisma.opportunity.findFirst({
            where: {
                id,
                tenantId: session.user.tenantId,
            },
            include: {
                customer: true,
                rfqs: {
                    include: {
                        suppliers: true,
                        quotes: true,
                    },
                },
                tasks: {
                    include: {
                        customer: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                stageHistory: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                lostReasons: true,
                quotes: {
                    include: {
                        items: true,
                    },
                },
            },
        });

        if (!opportunity) {
            return NextResponse.json(
                { success: false, error: 'Opportunity not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: opportunity,
        });
    } catch (error) {
        console.error('Error fetching opportunity:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch opportunity' },
            { status: 500 }
        );
    }
}

// PATCH /api/opportunities/[id] - Update opportunity
export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = params;
        const body = await request.json();

        // Get existing opportunity
        const existing = await prisma.opportunity.findFirst({
            where: {
                id,
                tenantId: session.user.tenantId,
            },
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'Opportunity not found' },
                { status: 404 }
            );
        }

        // Update opportunity
        const opportunity = await prisma.opportunity.update({
            where: { id },
            data: {
                ...body,
                updatedAt: new Date(),
            },
            include: {
                customer: true,
            },
        });

        // Log activity if stage changed
        if (body.stage && body.stage !== existing.stage) {
            await prisma.activity.create({
                data: {
                    entityType: 'opportunity',
                    entityId: opportunity.id,
                    type: 'stage_changed',
                    description: `Stage changed from "${existing.stage}" to "${body.stage}"`,
                    userId: session.user.id,
                    tenantId: session.user.tenantId,
                },
            });
        }

        return NextResponse.json({
            success: true,
            data: opportunity,
        });
    } catch (error) {
        console.error('Error updating opportunity:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update opportunity' },
            { status: 500 }
        );
    }
}

// DELETE /api/opportunities/[id] - Delete opportunity
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = params;

        // Check if opportunity exists and belongs to tenant
        const existing = await prisma.opportunity.findFirst({
            where: {
                id,
                tenantId: session.user.tenantId,
            },
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'Opportunity not found' },
                { status: 404 }
            );
        }

        // Delete opportunity
        await prisma.opportunity.delete({
            where: { id },
        });

        // Log activity
        await prisma.activity.create({
            data: {
                entityType: 'opportunity',
                entityId: id,
                type: 'deleted',
                description: `Opportunity "${existing.title}" deleted`,
                userId: session.user.id,
                tenantId: session.user.tenantId,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Opportunity deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting opportunity:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete opportunity' },
            { status: 500 }
        );
    }
}
