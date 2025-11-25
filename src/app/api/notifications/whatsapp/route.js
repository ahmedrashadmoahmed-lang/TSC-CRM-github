import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import WhatsAppService from '@/services/WhatsAppService';
import logger from '@/lib/logger';

/**
 * Send WhatsApp notification
 * POST /api/notifications/whatsapp
 */
export const POST = withAuth(async (req) => {
    try {
        const { to, type, data } = await req.json();

        if (!to || !type) {
            return NextResponse.json(
                { error: 'Phone number and type are required' },
                { status: 400 }
            );
        }

        let result;

        switch (type) {
            case 'invoice':
                result = await WhatsAppService.sendInvoiceNotification(
                    data.customer,
                    data.invoice
                );
                break;
            case 'payment_reminder':
                result = await WhatsAppService.sendPaymentReminder(
                    data.customer,
                    data.invoice
                );
                break;
            case 'payment_confirmation':
                result = await WhatsAppService.sendPaymentConfirmation(
                    data.customer,
                    data.invoice,
                    data.payment
                );
                break;
            case 'custom':
                result = await WhatsAppService.sendCustomMessage(
                    to,
                    data.title,
                    data.body
                );
                break;
            default:
                return NextResponse.json(
                    { error: 'Invalid notification type' },
                    { status: 400 }
                );
        }

        return NextResponse.json(result);
    } catch (error) {
        logger.error('WhatsApp notification error', { error: error.message });
        return NextResponse.json(
            { error: 'Failed to send WhatsApp notification' },
            { status: 500 }
        );
    }
});
