import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { InvoiceService } from '@/services/InvoiceService';
import { PERMISSIONS } from '@/lib/permissions';
import { validate, paymentSchema } from '@/lib/validation';

// POST /api/invoices/[id]/payment - Record payment
export async function POST(request, { params }) {
    return withAuth(async (request) => {
        const { tenant, user } = request;
        const { id } = params;
        const data = await request.json();

        // Validate payment data
        const { success, data: validatedData, errors } = validate(paymentSchema, {
            ...data,
            invoiceId: id,
        });

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
            const invoice = await service.recordPayment(
                id,
                validatedData.amount,
                validatedData.collectionDate,
                request
            );

            return NextResponse.json(invoice);
        } catch (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }
    }, { permission: PERMISSIONS.INVOICE_UPDATE })(request);
}
