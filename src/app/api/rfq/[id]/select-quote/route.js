import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { quoteId, autoConvertToPO } = await request.json();
        const rfqId = params.id;

        // Verify quote belongs to this RFQ
        const quote = await prisma.supplierQuote.findFirst({
            where: {
                id: quoteId,
                rfqId: rfqId
            },
            include: {
                supplier: true
            }
        });

        if (!quote) {
            return NextResponse.json({
                error: 'Quote not found or does not belong to this RFQ'
            }, { status: 404 });
        }

        // Update selected quote
        await prisma.supplierQuote.update({
            where: { id: quoteId },
            data: {
                status: 'selected',
                isSelected: true,
                selectedAt: new Date()
            }
        });

        // Update other quotes to rejected
        await prisma.supplierQuote.updateMany({
            where: {
                rfqId: rfqId,
                id: { not: quoteId }
            },
            data: {
                status: 'rejected',
                isSelected: false
            }
        });

        // Update RFQ with selected quote
        await prisma.rFQ.update({
            where: { id: rfqId },
            data: {
                selectedQuoteId: quoteId,
                stage: 'selected'
            }
        });

        let po = null;

        // Auto-convert to PO if requested
        if (autoConvertToPO) {
            const rfq = await prisma.rFQ.findUnique({
                where: { id: rfqId },
                include: { items: true }
            });

            // Generate PO number
            const lastPO = await prisma.purchaseOrder.findFirst({
                where: { tenantId: session.user.tenantId },
                orderBy: { createdAt: 'desc' }
            });

            const poNumber = lastPO
                ? `PO-${(parseInt(lastPO.poNumber.split('-')[1]) + 1).toString().padStart(5, '0')}`
                : 'PO-00001';

            // Create PO
            po = await prisma.purchaseOrder.create({
                data: {
                    poNumber,
                    tenantId: session.user.tenantId,
                    supplierId: quote.supplierId,
                    rfqId: rfqId,
                    status: 'draft',
                    totalAmount: quote.totalPrice,
                    currency: quote.currency,
                    paymentTerms: quote.paymentTerms || 'Net 30',
                    deliveryDate: new Date(Date.now() + quote.deliveryTime * 24 * 60 * 60 * 1000),
                    notes: `Created from RFQ ${rfq.rfqNumber} - Selected Quote`,
                    createdBy: session.user.id,
                    items: {
                        create: rfq.items.map(item => ({
                            productName: item.productName,
                            description: item.description,
                            quantity: item.quantity,
                            unit: item.unit,
                            unitPrice: item.estimatedPrice || 0,
                            totalPrice: (item.quantity * (item.estimatedPrice || 0)),
                            specifications: item.specifications
                        }))
                    }
                }
            });

            // Update RFQ stage to po_created
            await prisma.rFQ.update({
                where: { id: rfqId },
                data: { stage: 'po_created' }
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Quote selected successfully',
            quote,
            po: po ? { id: po.id, poNumber: po.poNumber } : null
        });

    } catch (error) {
        console.error('Error selecting quote:', error);
        return NextResponse.json({
            error: 'Failed to select quote',
            details: error.message
        }, { status: 500 });
    }
}
