import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const { action, comments } = await request.json(); // action: 'approve' | 'reject'

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const rfq = await prisma.rFQ.findUnique({
            where: { id }
        });

        if (!rfq) {
            return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
        }

        // Update data based on action
        const updateData = {
            approvalStatus: action === 'approve' ? 'approved' : 'rejected',
            approverId: session.user.id,
            stage: action === 'approve' ? 'approved' : 'draft', // Send back to draft if rejected
            updatedAt: new Date()
        };

        // Add timeline entry
        await prisma.rFQTimeline.create({
            data: {
                rfqId: id,
                stage: updateData.stage,
                action: action,
                description: `RFQ ${action}d by ${session.user.name}`,
                actorId: session.user.id,
                notes: comments
            }
        });

        const updatedRFQ = await prisma.rFQ.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({ success: true, data: updatedRFQ });

    } catch (error) {
        console.error('Error processing approval:', error);
        return NextResponse.json({ error: 'Failed to process approval' }, { status: 500 });
    }
}
