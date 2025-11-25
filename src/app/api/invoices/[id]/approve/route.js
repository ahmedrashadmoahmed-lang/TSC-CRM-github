import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { InvoiceService } from '@/services/InvoiceService';
import { PERMISSIONS } from '@/lib/permissions';

// POST /api/invoices/[id]/approve - Approve invoice
export async function POST(request, { params }) {
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
            const invoice = await service.approveInvoice(id, request);

            return NextResponse.json(invoice);
        } catch (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }
    }, { permission: PERMISSIONS.INVOICE_APPROVE })(request);
}
