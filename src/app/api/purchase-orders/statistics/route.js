import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { PurchaseOrderService } from '@/services/PurchaseOrderService';
import { PERMISSIONS } from '@/lib/permissions';

// GET /api/purchase-orders/statistics - Get PO statistics
export const GET = withAuth(async (request) => {
    const { tenant, user } = request;

    const service = new PurchaseOrderService(
        tenant.id,
        user.id,
        user.name,
        user.email
    );

    const statistics = await service.getStatistics();

    return NextResponse.json(statistics);
}, { permission: PERMISSIONS.PO_READ });
