import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { PurchaseOrderService } from '@/services/PurchaseOrderService';
import { PERMISSIONS } from '@/lib/permissions';
import { validate, purchaseOrderSchema } from '@/lib/validation';

// GET /api/purchase-orders - Get all purchase orders
export const GET = withAuth(async (request) => {
    const { tenant, user } = request;
    const { searchParams } = new URL(request.url);

    const filters = {
        status: searchParams.get('status') || 'all',
        supplierId: searchParams.get('supplierId') || null,
        startDate: searchParams.get('startDate') || null,
        endDate: searchParams.get('endDate') || null,
        search: searchParams.get('search') || null,
    };

    const service = new PurchaseOrderService(
        tenant.id,
        user.id,
        user.name,
        user.email
    );

    const purchaseOrders = await service.getPurchaseOrders(filters);

    return NextResponse.json(purchaseOrders);
}, { permission: PERMISSIONS.PO_READ });

// POST /api/purchase-orders - Create new purchase order
export const POST = withAuth(async (request) => {
    const { tenant, user } = request;
    const data = await request.json();

    // Validate input
    const { success, data: validatedData, errors } = validate(purchaseOrderSchema, data);

    if (!success) {
        return NextResponse.json(
            { error: 'Validation failed', errors },
            { status: 400 }
        );
    }

    const service = new PurchaseOrderService(
        tenant.id,
        user.id,
        user.name,
        user.email
    );

    try {
        const po = await service.createPurchaseOrder(validatedData, request);

        return NextResponse.json(po, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
}, { permission: PERMISSIONS.PO_CREATE });
