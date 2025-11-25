import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { PurchaseOrderService } from '@/services/PurchaseOrderService';
import { PERMISSIONS } from '@/lib/permissions';

// POST /api/purchase-orders/[id]/approve - Approve purchase order
export async function POST(request, { params }) {
    return withAuth(async (request) => {
        const { tenant, user } = request;
        const { id } = params;

        const service = new PurchaseOrderService(
            tenant.id,
            user.id,
            user.name,
            user.email
        );

        try {
            const po = await service.approvePurchaseOrder(id, request);

            return NextResponse.json(po);
        } catch (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }
    }, { permission: PERMISSIONS.PO_APPROVE })(request);
}
