import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST convert RFQ to PO
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { rfqId, quoteId } = body;

        if (!rfqId || !quoteId) {
            return NextResponse.json(
                { error: 'RFQ ID and Quote ID are required' },
                { status: 400 }
            );
        }

        // Get RFQ details
        const rfq = await prisma.rFQ.findUnique({
            where: { id: rfqId },
            include: {
                items: true
            }
        });

        if (!rfq) {
            return NextResponse.json(
                { error: 'RFQ not found' },
                { status: 404 }
            );
        }

        // Get quote details
        const quote = await prisma.supplierQuote.findUnique({
            where: { id: quoteId },
            include: {
                items: true
            }
        });

        if (!quote) {
            return NextResponse.json(
                { error: 'Quote not found' },
                { status: 404 }
            );
        }

        // Generate PO number
        const count = await prisma.advancedPurchaseOrder.count({
            where: { tenantId: session.user.tenantId }
        });
        const poNumber = `PO-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;

        // Calculate total amount from quote
        const totalAmount = quote.items.reduce((sum, item) =>
            sum + (item.quantity * item.unitPrice), 0
        );

        // Determine approval level
        let approvalLevel = 1;
        if (totalAmount > 50000) approvalLevel = 3;
        else if (totalAmount > 10000) approvalLevel = 2;

        // Create PO from RFQ
        const purchaseOrder = await prisma.advancedPurchaseOrder.create({
            data: {
                poNumber,
                rfqId,
                supplierId: quote.supplierId,
                status: 'draft',
                totalAmount,
                expectedDelivery: rfq.deliveryDate,
                paymentTerms: quote.paymentTerms,
                notes: `ØªÙ… Ø¥Ù†Ø´Ø§Ø¤Ù‡ Ù…Ù† RFQ: ${rfq.rfqNumber}\nØ¹Ø±Ø¶ Ø§Ù„Ù…ÙˆØ±Ø¯: ${quote.quoteNumber}`,
                approvalLevel,
                tenantId: session.user.tenantId,
                createdBy: session.user.id,
                items: {
                    create: quote.items.map(item => ({
                        productId: item.productId,
                        productName: item.productName,
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                        quantityPending: item.quantity,
                        specifications: item.specifications
                    }))
                }
            },
            include: {
                supplier: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        // Update RFQ status
        await prisma.rFQ.update({
            where: { id: rfqId },
            data: { status: 'converted_to_po' }
        });

        return NextResponse.json({
            success: true,
            data: purchaseOrder,
            message: 'ØªÙ… ØªØ­ÙˆÙŠÙ„ RFQ Ø¥Ù„Ù‰ Ø£Ù…Ø± Ø´Ø±Ø§Ø¡ Ø¨Ù†Ø¬Ø§Ø­'
        });

    } catch (error) {
        console.error('Error converting RFQ to PO:', error);
        return NextResponse.json(
            { error: 'Failed to convert RFQ to PO' },
            { status: 500 }
        );
    }
}
