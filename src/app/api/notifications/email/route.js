import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import EmailService from '@/services/EmailService';
import logger from '@/lib/logger';

/**
 * Send email notification
 * POST /api/notifications/email
 */
export const POST = withAuth(async (req) => {
    try {
        const { to, type, data } = await req.json();

        if (!to || !type) {
            return NextResponse.json(
                { error: 'Email and type are required' },
                { status: 400 }
            );
        }

        let result;

        switch (type) {
            case 'invoice':
                result = await EmailService.sendInvoiceEmail(
                    data.customer,
                    data.invoice,
                    data.pdfBuffer
                );
                break;
            case 'payment_reminder':
                result = await EmailService.sendPaymentReminder(
                    data.customer,
                    data.invoice
                );
                break;
            case 'payment_confirmation':
                result = await EmailService.sendPaymentConfirmation(
                    data.customer,
                    data.invoice,
                    data.payment
                );
                break;
            case 'welcome':
                result = await EmailService.sendWelcomeEmail(data.user);
                break;
            default:
                return NextResponse.json(
                    { error: 'Invalid email type' },
                    { status: 400 }
                );
        }

        return NextResponse.json(result);
    } catch (error) {
        logger.error('Email notification error', { error: error.message });
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        );
    }
});
