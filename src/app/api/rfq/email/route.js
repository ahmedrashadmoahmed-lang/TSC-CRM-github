// Email API for RFQ System
// Handles sending emails to suppliers and stakeholders

import { NextResponse } from 'next/server';
import emailService from '@/lib/emailService';
import { prisma } from '@/lib/prisma';

/**
 * POST: Send emails
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { action, tenantId } = body;

        if (!tenantId) {
            return NextResponse.json({
                success: false,
                error: 'tenantId required'
            }, { status: 400 });
        }

        switch (action) {
            case 'send-invitation': {
                // Send RFQ invitation to supplier
                const { rfqId, supplierId, invitationUrl } = body;

                if (!rfqId || !supplierId) {
                    return NextResponse.json({
                        success: false,
                        error: 'rfqId and supplierId required'
                    }, { status: 400 });
                }

                // Fetch RFQ
                const rfq = await prisma.rFQ.findUnique({
                    where: { id: rfqId },
                    include: { items: true }
                });

                if (!rfq || rfq.tenantId !== tenantId) {
                    return NextResponse.json({
                        success: false,
                        error: 'RFQ not found or unauthorized'
                    }, { status: 404 });
                }

                // Fetch supplier
                const supplier = await prisma.supplier.findUnique({
                    where: { id: supplierId }
                });

                if (!supplier || supplier.tenantId !== tenantId) {
                    return NextResponse.json({
                        success: false,
                        error: 'Supplier not found or unauthorized'
                    }, { status: 404 });
                }

                const url = invitationUrl || `${process.env.NEXTAUTH_URL}/supplier/rfq/${rfqId}`;
                const result = await emailService.sendRFQInvitation(rfq, supplier, url);

                return NextResponse.json({
                    success: true,
                    data: result
                });
            }

            case 'send-invitations-bulk': {
                // Send invitations to multiple suppliers
                const { rfqId, supplierIds, invitationUrl } = body;

                if (!rfqId || !supplierIds || !Array.isArray(supplierIds)) {
                    return NextResponse.json({
                        success: false,
                        error: 'rfqId and supplierIds array required'
                    }, { status: 400 });
                }

                // Fetch RFQ
                const rfq = await prisma.rFQ.findUnique({
                    where: { id: rfqId },
                    include: { items: true }
                });

                if (!rfq || rfq.tenantId !== tenantId) {
                    return NextResponse.json({
                        success: false,
                        error: 'RFQ not found or unauthorized'
                    }, { status: 404 });
                }

                // Fetch suppliers
                const suppliers = await prisma.supplier.findMany({
                    where: {
                        id: { in: supplierIds },
                        tenantId
                    }
                });

                const url = invitationUrl || `${process.env.NEXTAUTH_URL}/supplier/rfq/${rfqId}`;

                // Send emails to all suppliers
                const results = await Promise.allSettled(
                    suppliers.map(supplier =>
                        emailService.sendRFQInvitation(rfq, supplier, url)
                    )
                );

                const successful = results.filter(r => r.status === 'fulfilled').length;
                const failed = results.filter(r => r.status === 'rejected').length;

                return NextResponse.json({
                    success: true,
                    data: {
                        total: suppliers.length,
                        successful,
                        failed,
                        results: results.map((r, i) => ({
                            supplier: suppliers[i].name,
                            status: r.status,
                            result: r.status === 'fulfilled' ? r.value : r.reason?.message
                        }))
                    }
                });
            }

            case 'send-reminder': {
                // Send deadline reminder
                const { rfqId, supplierId, daysLeft } = body;

                if (!rfqId || !supplierId) {
                    return NextResponse.json({
                        success: false,
                        error: 'rfqId and supplierId required'
                    }, { status: 400 });
                }

                // Fetch RFQ
                const rfq = await prisma.rFQ.findUnique({
                    where: { id: rfqId }
                });

                if (!rfq || rfq.tenantId !== tenantId) {
                    return NextResponse.json({
                        success: false,
                        error: 'RFQ not found or unauthorized'
                    }, { status: 404 });
                }

                // Fetch supplier
                const supplier = await prisma.supplier.findUnique({
                    where: { id: supplierId }
                });

                if (!supplier || supplier.tenantId !== tenantId) {
                    return NextResponse.json({
                        success: false,
                        error: 'Supplier not found or unauthorized'
                    }, { status: 404 });
                }

                // Calculate days left if not provided
                let days = daysLeft;
                if (!days) {
                    const deadline = new Date(rfq.deadline);
                    const now = new Date();
                    days = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
                }

                const result = await emailService.sendDeadlineReminder(rfq, supplier, days);

                return NextResponse.json({
                    success: true,
                    data: result
                });
            }

            case 'send-reminders-bulk': {
                // Send reminders to all suppliers who haven't responded
                const { rfqId } = body;

                if (!rfqId) {
                    return NextResponse.json({
                        success: false,
                        error: 'rfqId required'
                    }, { status: 400 });
                }

                // Fetch RFQ with suppliers and quotes
                const rfq = await prisma.rFQ.findUnique({
                    where: { id: rfqId },
                    include: {
                        suppliers: {
                            include: {
                                supplier: true
                            }
                        },
                        quotes: true
                    }
                });

                if (!rfq || rfq.tenantId !== tenantId) {
                    return NextResponse.json({
                        success: false,
                        error: 'RFQ not found or unauthorized'
                    }, { status: 404 });
                }

                // Calculate days left
                const deadline = new Date(rfq.deadline);
                const now = new Date();
                const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

                // Find suppliers who haven't responded
                const respondedSupplierIds = new Set(rfq.quotes.map(q => q.supplierId));
                const pendingSuppliers = rfq.suppliers
                    .filter(rs => !respondedSupplierIds.has(rs.supplierId))
                    .map(rs => rs.supplier);

                // Send reminders
                const results = await Promise.allSettled(
                    pendingSuppliers.map(supplier =>
                        emailService.sendDeadlineReminder(rfq, supplier, daysLeft)
                    )
                );

                const successful = results.filter(r => r.status === 'fulfilled').length;
                const failed = results.filter(r => r.status === 'rejected').length;

                return NextResponse.json({
                    success: true,
                    data: {
                        total: pendingSuppliers.length,
                        successful,
                        failed,
                        daysLeft
                    }
                });
            }

            case 'confirm-quote-received': {
                // Send quote received confirmation
                const { quoteId } = body;

                if (!quoteId) {
                    return NextResponse.json({
                        success: false,
                        error: 'quoteId required'
                    }, { status: 400 });
                }

                // Fetch quote with RFQ and supplier
                const quote = await prisma.supplierQuote.findUnique({
                    where: { id: quoteId },
                    include: {
                        rfq: true,
                        supplier: true
                    }
                });

                if (!quote || quote.rfq.tenantId !== tenantId) {
                    return NextResponse.json({
                        success: false,
                        error: 'Quote not found or unauthorized'
                    }, { status: 404 });
                }

                const result = await emailService.sendQuoteReceivedConfirmation(
                    quote,
                    quote.rfq,
                    quote.supplier
                );

                return NextResponse.json({
                    success: true,
                    data: result
                });
            }

            case 'notify-selection': {
                // Notify supplier about quote selection
                const { quoteId, isSelected } = body;

                if (!quoteId || isSelected === undefined) {
                    return NextResponse.json({
                        success: false,
                        error: 'quoteId and isSelected required'
                    }, { status: 400 });
                }

                // Fetch quote with RFQ and supplier
                const quote = await prisma.supplierQuote.findUnique({
                    where: { id: quoteId },
                    include: {
                        rfq: true,
                        supplier: true
                    }
                });

                if (!quote || quote.rfq.tenantId !== tenantId) {
                    return NextResponse.json({
                        success: false,
                        error: 'Quote not found or unauthorized'
                    }, { status: 404 });
                }

                const result = await emailService.sendQuoteSelectionNotification(
                    quote,
                    quote.rfq,
                    quote.supplier,
                    isSelected
                );

                return NextResponse.json({
                    success: true,
                    data: result
                });
            }

            case 'notify-selections-bulk': {
                // Notify all suppliers about selections
                const { rfqId, selectedQuoteId } = body;

                if (!rfqId || !selectedQuoteId) {
                    return NextResponse.json({
                        success: false,
                        error: 'rfqId and selectedQuoteId required'
                    }, { status: 400 });
                }

                // Fetch all quotes for this RFQ
                const quotes = await prisma.supplierQuote.findMany({
                    where: { rfqId },
                    include: {
                        rfq: true,
                        supplier: true
                    }
                });

                if (quotes.length === 0 || quotes[0].rfq.tenantId !== tenantId) {
                    return NextResponse.json({
                        success: false,
                        error: 'Quotes not found or unauthorized'
                    }, { status: 404 });
                }

                // Send notifications to all suppliers
                const results = await Promise.allSettled(
                    quotes.map(quote =>
                        emailService.sendQuoteSelectionNotification(
                            quote,
                            quote.rfq,
                            quote.supplier,
                            quote.id === selectedQuoteId
                        )
                    )
                );

                const successful = results.filter(r => r.status === 'fulfilled').length;
                const failed = results.filter(r => r.status === 'rejected').length;

                return NextResponse.json({
                    success: true,
                    data: {
                        total: quotes.length,
                        successful,
                        failed
                    }
                });
            }

            case 'send-status-update': {
                // Send status update
                const { rfqId, recipients, statusMessage } = body;

                if (!rfqId || !recipients || !statusMessage) {
                    return NextResponse.json({
                        success: false,
                        error: 'rfqId, recipients, and statusMessage required'
                    }, { status: 400 });
                }

                // Fetch RFQ
                const rfq = await prisma.rFQ.findUnique({
                    where: { id: rfqId }
                });

                if (!rfq || rfq.tenantId !== tenantId) {
                    return NextResponse.json({
                        success: false,
                        error: 'RFQ not found or unauthorized'
                    }, { status: 404 });
                }

                const result = await emailService.sendRFQStatusUpdate(
                    rfq,
                    recipients,
                    statusMessage
                );

                return NextResponse.json({
                    success: true,
                    data: result
                });
            }

            default: {
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action'
                }, { status: 400 });
            }
        }

    } catch (error) {
        console.error('Error in email API:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

