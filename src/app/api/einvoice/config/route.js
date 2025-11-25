import { NextResponse } from 'next/server';
import { withAuth, adminOnly } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';

/**
 * Get e-invoice configuration
 * GET /api/einvoice/config
 */
export const GET = withAuth(adminOnly, async (req) => {
    try {
        const tenantId = req.tenantId;

        const config = await prisma.eInvoiceConfig.findUnique({
            where: { tenantId },
            select: {
                id: true,
                clientId: true,
                taxNumber: true,
                branchId: true,
                isActive: true,
                environment: true,
                // Don't return clientSecret
            },
        });

        return NextResponse.json({ config });
    } catch (error) {
        logger.error('Get config error', { error: error.message });
        return NextResponse.json(
            { error: 'Failed to get configuration' },
            { status: 500 }
        );
    }
});

/**
 * Update e-invoice configuration
 * PUT /api/einvoice/config
 */
export const PUT = withAuth(adminOnly, async (req) => {
    try {
        const tenantId = req.tenantId;
        const { clientId, clientSecret, taxNumber, branchId, environment, isActive } =
            await req.json();

        const config = await prisma.eInvoiceConfig.upsert({
            where: { tenantId },
            create: {
                tenantId,
                clientId,
                clientSecret,
                taxNumber,
                branchId,
                environment: environment || 'sandbox',
                isActive: isActive !== undefined ? isActive : false,
            },
            update: {
                ...(clientId && { clientId }),
                ...(clientSecret && { clientSecret }),
                ...(taxNumber && { taxNumber }),
                ...(branchId && { branchId }),
                ...(environment && { environment }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        logger.info('E-invoice config updated', { tenantId });

        return NextResponse.json({
            success: true,
            message: 'Configuration updated successfully',
        });
    } catch (error) {
        logger.error('Update config error', { error: error.message });
        return NextResponse.json(
            { error: 'Failed to update configuration' },
            { status: 500 }
        );
    }
});
