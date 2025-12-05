import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET quality checks for a PO
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const poId = searchParams.get('poId');

        if (!poId) {
            return NextResponse.json(
                { error: 'PO ID is required' },
                { status: 400 }
            );
        }

        const qualityChecks = await prisma.pOQualityCheck.findMany({
            where: { poId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            data: qualityChecks
        });

    } catch (error) {
        console.error('Error fetching quality checks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch quality checks' },
            { status: 500 }
        );
    }
}

// POST create quality check
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            poId,
            inspectionDate,
            location,
            overallScore,
            passedItems,
            failedItems,
            partialItems,
            defects,
            actionTaken,
            notes,
            recommendations,
            photos,
            reports
        } = body;

        if (!poId) {
            return NextResponse.json(
                { error: 'PO ID is required' },
                { status: 400 }
            );
        }

        // Generate inspection number
        const count = await prisma.pOQualityCheck.count();
        const inspectionNumber = `QC-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;

        // Determine status based on results
        let status = 'pending';
        if (passedItems > 0 && failedItems === 0) status = 'passed';
        else if (failedItems > 0 && passedItems === 0) status = 'failed';
        else if (passedItems > 0 && failedItems > 0) status = 'partial';

        const qualityCheck = await prisma.pOQualityCheck.create({
            data: {
                poId,
                inspectionNumber,
                inspectorId: session.user.id,
                inspectorName: session.user.name,
                status,
                inspectionDate: inspectionDate ? new Date(inspectionDate) : new Date(),
                location,
                overallScore,
                passedItems: passedItems || 0,
                failedItems: failedItems || 0,
                partialItems: partialItems || 0,
                defects: defects ? JSON.stringify(defects) : null,
                defectCount: defects ? defects.length : 0,
                actionTaken,
                notes,
                recommendations,
                photos: photos ? JSON.stringify(photos) : null,
                reports: reports ? JSON.stringify(reports) : null
            }
        });

        // Update PO quality status
        await prisma.advancedPurchaseOrder.update({
            where: { id: poId },
            data: { qualityStatus: status }
        });

        return NextResponse.json({
            success: true,
            data: qualityCheck,
            message: 'ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ ÙØ­Øµ Ø§Ù„Ø¬ÙˆØ¯Ø© Ø¨Ù†Ø¬Ø§Ø­'
        });

    } catch (error) {
        console.error('Error creating quality check:', error);
        return NextResponse.json(
            { error: 'Failed to create quality check' },
            { status: 500 }
        );
    }
}
