import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import RFQWorkflowEngine from '@/lib/rfqWorkflowEngine';

export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const { status, notes } = await request.json();

        // 1. Get current RFQ
        const rfq = await prisma.rFQ.findUnique({
            where: { id },
            include: { quotes: true }
        });

        if (!rfq) {
            return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
        }

        // 2. Validate transition
        if (!RFQWorkflowEngine.canTransitionTo(rfq.stage, status)) {
            return NextResponse.json({
                error: `Invalid transition from ${rfq.stage} to ${status}`
            }, { status: 400 });
        }

        // 3. Update RFQ
        const updateData = {
            stage: status,
            updatedAt: new Date()
        };

        // Handle specific stage logic
        if (status === 'sent') {
            updateData.sentAt = new Date();
        } else if (status === 'closed') {
            updateData.closedAt = new Date();
        }

        // Add timeline entry
        const timelineEntry = await prisma.rFQTimeline.create({
            data: {
                rfqId: id,
                stage: status,
                action: 'status_change',
                description: `Status changed to ${RFQWorkflowEngine.getStageInfo(status).name}`,
                actorId: session.user.id,
                notes: notes
            }
        });

        const updatedRFQ = await prisma.rFQ.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({ success: true, data: updatedRFQ });

    } catch (error) {
        console.error('Error updating RFQ status:', error);
        return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }
}
