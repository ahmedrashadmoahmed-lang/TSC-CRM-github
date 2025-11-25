import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { CustomerService } from '@/services/CustomerService';
import { PERMISSIONS } from '@/lib/permissions';
import { validate, customerSchema } from '@/lib/validation';

// GET /api/customers - Get all customers
export const GET = withAuth(async (request) => {
    const { tenant, user } = request;
    const { searchParams } = new URL(request.url);

    const filters = {
        status: searchParams.get('status') || 'all',
        type: searchParams.get('type') || 'all',
        search: searchParams.get('search') || null,
    };

    const service = new CustomerService(
        tenant.id,
        user.id,
        user.name,
        user.email
    );

    const customers = await service.getCustomers(filters);

    return NextResponse.json(customers);
}, { permission: PERMISSIONS.CUSTOMER_READ });

// POST /api/customers - Create new customer
export const POST = withAuth(async (request) => {
    const { tenant, user } = request;
    const data = await request.json();

    // Validate input
    const { success, data: validatedData, errors } = validate(customerSchema, data);

    if (!success) {
        return NextResponse.json(
            { error: 'Validation failed', errors },
            { status: 400 }
        );
    }

    const service = new CustomerService(
        tenant.id,
        user.id,
        user.name,
        user.email
    );

    try {
        const customer = await service.createCustomer(validatedData, request);

        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
}, { permission: PERMISSIONS.CUSTOMER_CREATE });
