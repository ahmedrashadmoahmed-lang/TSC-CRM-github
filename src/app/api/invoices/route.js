import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { InvoiceService } from '@/services/InvoiceService';
import { PERMISSIONS } from '@/lib/permissions';
import { validate, invoiceSchema, paymentSchema } from '@/lib/validation';

// GET /api/invoices - Get all invoices
export const GET = withAuth(async (request) => {
    const { tenant, user } = request;
    const { searchParams } = new URL(request.url);

    const filters = {
        status: searchParams.get('status') || 'all',
        customerId: searchParams.get('customerId') || null,
        startDate: searchParams.get('startDate') || null,
        endDate: searchParams.get('endDate') || null,
        search: searchParams.get('search') || null,
    };

    const service = new InvoiceService(
        tenant.id,
        tenant.settings,
        user.id,
        user.name,
        user.email
    );

    const invoices = await service.getInvoices(filters);

    return NextResponse.json(invoices);
}, { permission: PERMISSIONS.INVOICE_READ });

// POST /api/invoices - Create new invoice
export const POST = withAuth(async (request) => {
    const { tenant, user } = request;
    const data = await request.json();

    // Validate input
    const { success, data: validatedData, errors } = validate(invoiceSchema, data);

    if (!success) {
        return NextResponse.json(
            { error: 'Validation failed', errors },
            { status: 400 }
        );
    }

    const service = new InvoiceService(
        tenant.id,
        tenant.settings,
        user.id,
        user.name,
        user.email
    );

    try {
        const invoice = await service.createInvoice(validatedData, request);

        return NextResponse.json(invoice, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
}, { permission: PERMISSIONS.INVOICE_CREATE });

// PUT /api/invoices/[id] - Update invoice
export async function PUT(request, { params }) {
    return withAuth(async (request) => {
        const { tenant, user } = request;
        const { id } = params;
        const data = await request.json();

        const service = new InvoiceService(
            tenant.id,
            tenant.settings,
            user.id,
            user.name,
            user.email
        );

        try {
            const invoice = await service.updateInvoice(id, data, request);

            return NextResponse.json(invoice);
        } catch (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }
    }, { permission: PERMISSIONS.INVOICE_UPDATE })(request);
}

// DELETE /api/invoices/[id] - Delete invoice
export async function DELETE(request, { params }) {
    return withAuth(async (request) => {
        const { tenant, user } = request;
        const { id } = params;

        const service = new InvoiceService(
            tenant.id,
            tenant.settings,
            user.id,
            user.name,
            user.email
        );

        try {
            await service.deleteInvoice(id, request);

            return NextResponse.json({ success: true });
        } catch (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }
    }, { permission: PERMISSIONS.INVOICE_DELETE })(request);
}
