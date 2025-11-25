import { NextResponse } from 'next/server';
import { withAuth, requirePermission } from '@/middleware/auth';
import EInvoiceService from '@/services/EInvoiceService';
import logger from '@/lib/logger';

/**
 * Submit invoice to Egyptian Tax Authority
 * POST /api/einvoice/submit
 */
export const POST = withAuth(
    requirePermission('invoices.manage'),
    async (req) => {
        try {
            const { invoiceId } = await req.json();
            const tenantId = req.tenantId;

            if (!invoiceId) {
                return NextResponse.json(
                    { error: 'Invoice ID is required' },
                    { status: 400 }
                );
            }

            logger.info('Submitting invoice to ETA', { invoiceId, tenantId });

            const result = await EInvoiceService.submitInvoice(invoiceId, tenantId);

            if (result.success) {
                return NextResponse.json({
                    success: true,
                    submissionUUID: result.submissionUUID,
                    message: 'Invoice submitted successfully to Egyptian Tax Authority',
                });
            } else {
                return NextResponse.json(
                    {
                        success: false,
                        error: result.error,
                        details: result.details,
                    },
                    { status: 400 }
                );
            }
        } catch (error) {
            logger.error('Submit e-invoice error', { error: error.message });
            return NextResponse.json(
                { error: 'Failed to submit invoice to ETA' },
                { status: 500 }
            );
        }
    }
);
