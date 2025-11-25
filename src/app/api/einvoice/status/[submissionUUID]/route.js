import { NextResponse } from 'next/server';
import { withAuth, requirePermission } from '@/middleware/auth';
import EInvoiceService from '@/services/EInvoiceService';
import logger from '@/lib/logger';

/**
 * Check e-invoice submission status
 * GET /api/einvoice/status/[submissionUUID]
 */
export async function GET(req, { params }) {
    try {
        const { submissionUUID } = params;
        const tenantId = req.tenantId;

        logger.info('Checking e-invoice status', { submissionUUID });

        const status = await EInvoiceService.checkStatus(submissionUUID, tenantId);

        return NextResponse.json({
            success: true,
            status,
        });
    } catch (error) {
        logger.error('Check status error', { error: error.message });
        return NextResponse.json(
            { error: 'Failed to check submission status' },
            { status: 500 }
        );
    }
}
