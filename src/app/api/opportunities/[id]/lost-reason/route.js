import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST - Record why a deal was lost
export async function POST(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();

        const {
            category,
            subcategory,
            description,
            competitorName,
            competitorPrice,
            createdBy,
            tenantId
        } = body;

        // Validate required fields
        if (!category || !tenantId) {
            return NextResponse.json({
                success: false,
                error: 'Category and tenantId are required'
            }, { status: 400 });
        }

        // Verify opportunity exists and is in 'lost' stage
        const opportunity = await prisma.opportunity.findUnique({
            where: { id }
        });

        if (!opportunity) {
            return NextResponse.json({
                success: false,
                error: 'Opportunity not found'
            }, { status: 404 });
        }

        // Create lost reason
        const lostReason = await prisma.lostReason.create({
            data: {
                category,
                subcategory,
                description,
                competitorName,
                competitorPrice,
                opportunityId: id,
                tenantId,
                createdBy
            }
        });

        // Update opportunity stage to 'lost' if not already
        if (opportunity.stage !== 'lost') {
            await prisma.opportunity.update({
                where: { id },
                data: {
                    stage: 'lost',
                    closedDate: new Date()
                }
            });

            // Add to stage history
            await prisma.stageHistory.create({
                data: {
                    opportunityId: id,
                    stage: 'lost',
                    previousStage: opportunity.stage,
                    changedBy: createdBy,
                    notes: `Lost: ${category}`
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: lostReason
        });

    } catch (error) {
        console.error('Error recording lost reason:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

// GET - Get lost reasons for an opportunity
export async function GET(request, { params }) {
    try {
        const { id } = params;

        const lostReasons = await prisma.lostReason.findMany({
            where: {
                opportunityId: id
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            success: true,
            data: lostReasons
        });

    } catch (error) {
        console.error('Error fetching lost reasons:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
