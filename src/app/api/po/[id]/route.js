import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET single purchase order by ID
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        const purchaseOrder = await prisma.advancedPurchaseOrder.findUnique({
            where: { id },
            include: {
                supplier: true,
                items: {
                    include: {
                        product: true
                    }
                },
                shipments: {
                    orderBy: { createdAt: 'desc' }
                },
                documents: {
                    orderBy: { createdAt: 'desc' }
                },
                approvals: {
                    orderBy: { createdAt: 'desc' }
                },
                payments: {
                    orderBy: { createdAt: 'desc' }
                },
                qualityChecks: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!purchaseOrder) {
            return NextResponse.json(
                { error: 'Purchase order not found' },
                { status: 404 }
            );
        }

        // Check tenant access
        if (purchaseOrder.tenantId !== session.user.tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            data: purchaseOrder
        });

    } catch (error) {
        console.error('Error fetching purchase order:', error);
        return NextResponse.json(
            { error: 'Failed to fetch purchase order' },
            { status: 500 }
        );
    }
}
