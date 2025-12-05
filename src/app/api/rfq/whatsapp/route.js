// WhatsApp API for RFQ System
// Handles WhatsApp notifications to suppliers and stakeholders

import { NextResponse } from 'next/server';
import whatsappService from '@/lib/whatsappService';
import { prisma } from '@/lib/prisma';

/**
 * POST: Send WhatsApp messages
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
                // Send RFQ invitation to supplier via WhatsApp
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

                if (!supplier.phone && !supplier.whatsapp) {
                    return NextResponse.json({
                        success: false,
                        error: 'Supplier has no phone/WhatsApp number'
                    }, { status: 400 });
                }

                const url = invitationUrl || `${process.env.NEXTAUTH_URL}/supplier/rfq/${rfqId}`;
                const result = await whatsappService.sendRFQInvitation(rfq, supplier, url);

                return NextResponse.json({
                    success: true,
                    data: result
                });
            }

            case 'send-invitations-bulk': {
                // Send invitations to multiple suppliers via WhatsApp
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

                // Fetch suppliers with phone numbers
                const suppliers = await prisma.supplier.findMany({
                    where: {
                        id: { in: supplierIds },
                        tenantId,
                        OR: [
                            { phone: { not: null } },
                            { whatsapp: { not: null } }
                        ]
                    }
                });

                const url = invitationUrl || `${process.env.NEXTAUTH_URL}/supplier/rfq/${rfqId}`;

                // Send WhatsApp messages to all suppliers
                const results = await Promise.allSettled(
                    suppliers.map(supplier =>
                        whatsappService.sendRFQInvitation(rfq, supplier, url)
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
                        skipped: supplierIds.length - suppliers.length,
                        results: results.map((r, i) => ({
                            supplier: suppliers[i].name,
                            status: r.status,
                            result: r.status === 'fulfilled' ? r.value : r.reason?.message
                        }))
                    }
                });
            }

            case 'send-reminder': {
                // Send deadline reminder via WhatsApp
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

                const result = await whatsappService.sendDeadlineReminder(rfq, supplier, days);

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

                // Find suppliers who haven't responded and have phone numbers
                const respondedSupplierIds = new Set(rfq.quotes.map(q => q.supplierId));
                const pendingSuppliers = rfq.suppliers
                    .filter(rs => !respondedSupplierIds.has(rs.supplierId))
                    .map(rs => rs.supplier)
                    .filter(s => s.phone || s.whatsapp);

                // Send reminders
                const results = await Promise.allSettled(
                    pendingSuppliers.map(supplier =>
                        whatsappService.sendDeadlineReminder(rfq, supplier, daysLeft)
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
                // Send quote received confirmation via WhatsApp
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

                const result = await whatsappService.sendQuoteReceivedConfirmation(
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
                // Notify supplier about quote selection via WhatsApp
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

                const result = await whatsappService.sendQuoteSelectionNotification(
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
                // Notify all suppliers about selections via WhatsApp
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

                // Filter suppliers with phone numbers
                const quotesWithPhone = quotes.filter(q => q.supplier.phone || q.supplier.whatsapp);

                // Send notifications to all suppliers
                const results = await Promise.allSettled(
                    quotesWithPhone.map(quote =>
                        whatsappService.sendQuoteSelectionNotification(
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
                        total: quotesWithPhone.length,
                        successful,
                        failed,
                        skipped: quotes.length - quotesWithPhone.length
                    }
                });
            }

            case 'send-status-update': {
                // Send status update via WhatsApp
                const { rfqId, phone, statusMessage } = body;

                if (!rfqId || !phone || !statusMessage) {
                    return NextResponse.json({
                        success: false,
                        error: 'rfqId, phone, and statusMessage required'
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

                const result = await whatsappService.sendRFQStatusUpdate(
                    rfq,
                    phone,
                    statusMessage
                );

                return NextResponse.json({
                    success: true,
                    data: result
                });
            }

            case 'send-custom': {
                // Send custom WhatsApp message
                const { phone, message, mediaUrl } = body;

                if (!phone || !message) {
                    return NextResponse.json({
                        success: false,
                        error: 'phone and message required'
                    }, { status: 400 });
                }

                const result = await whatsappService.sendCustomMessage(phone, message, mediaUrl);

                return NextResponse.json({
                    success: true,
                    data: result
                });
            }

            case 'validate-phone': {
                // Validate phone number format
                const { phone } = body;

                if (!phone) {
                    return NextResponse.json({
                        success: false,
                        error: 'phone required'
                    }, { status: 400 });
                }

                const isValid = whatsappService.validatePhoneNumber(phone);
                const formatted = whatsappService.formatPhoneNumber(phone);

                return NextResponse.json({
                    success: true,
                    data: {
                        isValid,
                        formatted,
                        original: phone
                    }
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
        console.error('Error in WhatsApp API:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

/**
 * GET: Get message status
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const messageId = searchParams.get('messageId');

        if (!messageId) {
            return NextResponse.json({
                success: false,
                error: 'messageId required'
            }, { status: 400 });
        }

        const status = await whatsappService.getMessageStatus(messageId);

        return NextResponse.json({
            success: true,
            data: status
        });

    } catch (error) {
        console.error('Error getting WhatsApp message status:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

