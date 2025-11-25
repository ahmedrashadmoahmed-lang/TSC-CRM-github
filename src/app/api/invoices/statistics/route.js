import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { InvoiceService } from '@/services/InvoiceService';
import { PERMISSIONS } from '@/lib/permissions';

// GET /api/invoices/statistics - Get invoice statistics
export const GET = withAuth(async (request) => {
    const { tenant, user } = request;

    const service = new InvoiceService(
        tenant.id,
        tenant.settings,
        user.id,
        user.name,
        user.email
    );

    const statistics = await service.getStatistics();

    return NextResponse.json(statistics);
}, { permission: PERMISSIONS.INVOICE_READ });
