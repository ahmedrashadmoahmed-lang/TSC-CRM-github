import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET approvals for a PO
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

        const approvals = await prisma.pOApproval.findMany({
            where: { poId },
            orderBy: { level: 'asc' }
        });

        return NextResponse.json({
            success: true,
            data: approvals
        });

    } catch (error) {
        console.error('Error fetching approvals:', error);
        return NextResponse.json(
            { error: 'Failed to fetch approvals' },
            { status: 500 }
        );
    }
}

// POST create/submit approval
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { poId, status, comments, signature } = body;

        if (!poId || !status) {
            return NextResponse.json(
                { error: 'PO ID and status are required' },
                { status: 400 }
            );
        }

        // Get PO
        const po = await prisma.advancedPurchaseOrder.findUnique({
            where: { id: poId }
        });

        if (!po) {
            return NextResponse.json(
                { error: 'Purchase order not found' },
                { status: 404 }
            );
        }

        // Create approval record
        const approval = await prisma.pOApproval.create({
            data: {
                poId,
                level: po.approvalLevel,
                approverId: session.user.id,
                approverName: session.user.name,
                approverRole: session.user.role,
                status,
                comments,
                signature,
                approvedAt: status === 'approved' ? new Date() : null
            }
        });

        // Update PO status if approved
        if (status === 'approved') {
            await prisma.advancedPurchaseOrder.update({
                where: { id: poId },
                data: {
                    approvalStatus: 'approved',
                    status: 'approved'
                }
            });
        } else if (status === 'rejected') {
            await prisma.advancedPurchaseOrder.update({
                where: { id: poId },
                data: {
                    approvalStatus: 'rejected',
                    status: 'draft'
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: approval,
            message: status === 'approved' ? 'ØªÙ…Øª Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù…Ø±' : 'ØªÙ… Ø±ÙØ¶ Ø§Ù„Ø£Ù…Ø±'
        });

    } catch (error) {
        console.error('Error creating approval:', error);
        return NextResponse.json(
            { error: 'Failed to create approval' },
            { status: 500 }
        );
    }
}
