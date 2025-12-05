import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST update PO status (workflow)
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { poId, newStatus, notes } = body;

        if (!poId || !newStatus) {
            return NextResponse.json(
                { error: 'PO ID and new status are required' },
                { status: 400 }
            );
        }

        // Validate status transition
        const validStatuses = [
            'draft',
            'pending_approval',
            'approved',
            'ordered',
            'shipped',
            'delivered',
            'closed',
            'cancelled'
        ];

        if (!validStatuses.includes(newStatus)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }

        // Get current PO
        const po = await prisma.advancedPurchaseOrder.findUnique({
            where: { id: poId }
        });

        if (!po) {
            return NextResponse.json(
                { error: 'Purchase order not found' },
                { status: 404 }
            );
        }

        // Update status
        const updatedPO = await prisma.advancedPurchaseOrder.update({
            where: { id: poId },
            data: {
                status: newStatus,
                notes: notes || po.notes
            },
            include: {
                supplier: true,
                items: true,
                approvals: true
            }
        });

        // Create activity log
        // TODO: Add to activity log

        return NextResponse.json({
            success: true,
            data: updatedPO,
            message: `ØªÙ… ØªØ­Ø¯ÙŠØ« Ø­Ø§Ù„Ø© Ø§Ù„Ø£Ù…Ø± Ø¥Ù„Ù‰: ${getStatusLabel(newStatus)}`
        });

    } catch (error) {
        console.error('Error updating PO status:', error);
        return NextResponse.json(
            { error: 'Failed to update status' },
            { status: 500 }
        );
    }
}

function getStatusLabel(status) {
    const labels = {
        draft: 'Ù…Ø³ÙˆØ¯Ø©',
        pending_approval: 'Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø©',
        approved: 'Ù…ÙØ¹ØªÙ…Ø¯',
        ordered: 'ØªÙ… Ø§Ù„Ø·Ù„Ø¨',
        shipped: 'ØªÙ… Ø§Ù„Ø´Ø­Ù†',
        delivered: 'ØªÙ… Ø§Ù„ØªØ³Ù„ÙŠÙ…',
        closed: 'Ù…ØºÙ„Ù‚',
        cancelled: 'Ù…Ù„ØºÙŠ'
    };
    return labels[status] || status;
}
