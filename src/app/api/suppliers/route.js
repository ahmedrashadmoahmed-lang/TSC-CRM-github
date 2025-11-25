import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { SupplierService } from '@/services/SupplierService';
import { PERMISSIONS } from '@/lib/permissions';
import { validate, supplierSchema } from '@/lib/validation';

// GET /api/suppliers - Get all suppliers
export const GET = withAuth(async (request) => {
    const { tenant, user } = request;
    const { searchParams } = new URL(request.url);

    const filters = {
        status: searchParams.get('status') || 'all',
        category: searchParams.get('category') || 'all',
        minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')) : null,
        search: searchParams.get('search') || null,
    };

    const service = new SupplierService(
        tenant.id,
        user.id,
        user.name,
        user.email
    );

    const suppliers = await service.getSuppliers(filters);

    return NextResponse.json(suppliers);
}, { permission: PERMISSIONS.SUPPLIER_READ });

// POST /api/suppliers - Create new supplier
export const POST = withAuth(async (request) => {
    const { tenant, user } = request;
    const data = await request.json();

    // Validate input
    const { success, data: validatedData, errors } = validate(supplierSchema, data);

    if (!success) {
        return NextResponse.json(
            { error: 'Validation failed', errors },
            { status: 400 }
        );
    }

    const service = new SupplierService(
        tenant.id,
        user.id,
        user.name,
        user.email
    );

    try {
        const supplier = await service.createSupplier(validatedData, request);

        return NextResponse.json(supplier, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
}, { permission: PERMISSIONS.SUPPLIER_CREATE });
